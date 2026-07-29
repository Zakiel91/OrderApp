import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { type FixFormData, INITIAL_FIX_FORM } from '../lib/types'
import { useWizardNav } from './WizardNavContext'
import { validateFixStep, validateFixAll } from '../lib/validation'

interface FixFormContextType {
  form: FixFormData
  updateField: <K extends keyof FixFormData>(key: K, value: FixFormData[K]) => void
  updateFields: (updates: Partial<FixFormData>) => void
  resetForm: () => void
  /** Drop the persisted draft but keep the in-memory form (post-submit). */
  clearDraft: () => void
  step: number
  setStep: (s: number) => void
  totalSteps: number
  submitHandler: (() => Promise<void>) | null
  registerSubmitHandler: (fn: (() => Promise<void>) | null) => void
}

const STORAGE_KEY = 'fix_draft'
const PERSIST_DELAY_MS = 400
const FixFormContext = createContext<FixFormContextType | null>(null)

export function FixFormProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<FixFormData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { return { ...INITIAL_FIX_FORM, ...JSON.parse(saved) } } catch { /* ignore */ }
    }
    return { ...INITIAL_FIX_FORM, order_date: new Date().toISOString().split('T')[0] }
  })
  const [step, setStep] = useState(1)
  const totalSteps = 3 // Client, Fix Info, Review

  // Synced in an effect — see OrderFormContext for why not during render.
  const formRef = useRef(form)
  useEffect(() => { formRef.current = form }, [form])

  // See OrderFormContext — guards against a pending debounce resurrecting a
  // draft that was just cleared.
  const suppressPersistRef = useRef(false)

  const persist = useCallback(() => {
    if (suppressPersistRef.current) return
    const { image_files, ...rest } = formRef.current
    void image_files
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
    } catch { /* quota exceeded / private mode — best-effort */ }
  }, [])

  useEffect(() => {
    const timer = setTimeout(persist, PERSIST_DELAY_MS)
    return () => clearTimeout(timer)
  }, [form, persist])

  useEffect(() => {
    window.addEventListener('pagehide', persist)
    return () => {
      window.removeEventListener('pagehide', persist)
      persist()
    }
  }, [persist])

  const updateField = useCallback(<K extends keyof FixFormData>(key: K, value: FixFormData[K]) => {
    suppressPersistRef.current = false
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateFields = useCallback((updates: Partial<FixFormData>) => {
    suppressPersistRef.current = false
    setForm(prev => ({ ...prev, ...updates }))
  }, [])

  const clearDraft = useCallback(() => {
    suppressPersistRef.current = true
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const resetForm = useCallback(() => {
    suppressPersistRef.current = true
    setForm({ ...INITIAL_FIX_FORM, order_date: new Date().toISOString().split('T')[0] })
    setStep(1)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const [submitHandler, setSubmitHandler] = useState<(() => Promise<void>) | null>(null)
  const registerSubmitHandler = useCallback((fn: (() => Promise<void>) | null) => {
    setSubmitHandler(() => fn)  // стрелочная функция ОБЯЗАТЕЛЬНА — иначе React вызовет fn как updater
  }, [])

  const validateStep = useCallback((s: number) => validateFixStep(s, formRef.current), [])
  const validateAll = useCallback(() => validateFixAll(formRef.current), [])

  const { setWizardState } = useWizardNav()
  useEffect(() => {
    setWizardState({ step, totalSteps, setStep, submitHandler, submitting: false, validateStep, validateAll })
    return () => setWizardState(null)
  }, [step, totalSteps, setStep, submitHandler, setWizardState, validateStep, validateAll])

  return (
    <FixFormContext.Provider value={{
      form, updateField, updateFields, resetForm, clearDraft, step, setStep, totalSteps,
      submitHandler, registerSubmitHandler,
    }}>
      {children}
    </FixFormContext.Provider>
  )
}

export function useFixForm() {
  const ctx = useContext(FixFormContext)
  if (!ctx) throw new Error('useFixForm must be used within FixFormProvider')
  return ctx
}

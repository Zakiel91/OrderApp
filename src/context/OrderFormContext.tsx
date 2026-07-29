import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { type OrderFormData, INITIAL_FORM_DATA } from '../lib/types'
import { useWizardNav } from './WizardNavContext'
import { validateOrderStep, validateOrderAll } from '../lib/validation'

interface OrderFormContextType {
  form: OrderFormData
  updateField: <K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => void
  updateFields: (updates: Partial<OrderFormData>) => void
  resetForm: () => void
  /** Drop the persisted draft but keep the in-memory form (post-submit). */
  clearDraft: () => void
  step: number
  setStep: (s: number) => void
  totalSteps: number
  submitHandler: (() => Promise<void>) | null
  registerSubmitHandler: (fn: (() => Promise<void>) | null) => void
}

const STORAGE_KEY = 'order_draft'
const PERSIST_DELAY_MS = 400
const OrderFormContext = createContext<OrderFormContextType | null>(null)

export function OrderFormProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<OrderFormData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { return { ...INITIAL_FORM_DATA, ...JSON.parse(saved) } } catch { /* ignore */ }
    }
    return { ...INITIAL_FORM_DATA, order_date: new Date().toISOString().split('T')[0] }
  })
  const [step, setStep] = useState(1)
  const totalSteps = 5 // Was 6, Step1 removed (all automatic)

  // Latest form, readable from stable callbacks without re-creating them.
  // Synced in an effect, not during render: refs must not be written while
  // rendering. Every reader (debounced persist, pagehide, BottomNav click
  // handlers) runs after effects have flushed, so it never sees a stale form.
  const formRef = useRef(form)
  useEffect(() => { formRef.current = form }, [form])

  // Set after clearDraft()/resetForm() so a pending debounce — or the unmount
  // flush — cannot resurrect the draft we just deleted. Cleared by the next edit.
  const suppressPersistRef = useRef(false)

  const persist = useCallback(() => {
    if (suppressPersistRef.current) return
    // File objects don't survive JSON, so images are intentionally not persisted.
    const { image_files, ...rest } = formRef.current
    void image_files
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
    } catch { /* quota exceeded / private mode — draft persistence is best-effort */ }
  }, [])

  // Debounced: the previous version stringified the whole form on every keystroke.
  useEffect(() => {
    const timer = setTimeout(persist, PERSIST_DELAY_MS)
    return () => clearTimeout(timer)
  }, [form, persist])

  // Don't lose the last few characters when the wizard unmounts or the tab is
  // backgrounded mid-debounce.
  useEffect(() => {
    window.addEventListener('pagehide', persist)
    return () => {
      window.removeEventListener('pagehide', persist)
      persist()
    }
  }, [persist])

  const updateField = useCallback(<K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => {
    suppressPersistRef.current = false
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateFields = useCallback((updates: Partial<OrderFormData>) => {
    suppressPersistRef.current = false
    setForm(prev => ({ ...prev, ...updates }))
  }, [])

  const clearDraft = useCallback(() => {
    suppressPersistRef.current = true
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const resetForm = useCallback(() => {
    suppressPersistRef.current = true
    setForm({ ...INITIAL_FORM_DATA, order_date: new Date().toISOString().split('T')[0] })
    setStep(1)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const [submitHandler, setSubmitHandler] = useState<(() => Promise<void>) | null>(null)
  const registerSubmitHandler = useCallback((fn: (() => Promise<void>) | null) => {
    setSubmitHandler(() => fn)  // стрелочная функция ОБЯЗАТЕЛЬНА — иначе React вызовет fn как updater
  }, [])

  // Stable identities: the wizard state below must not be rebuilt on every keystroke.
  const validateStep = useCallback((s: number) => validateOrderStep(s, formRef.current), [])
  const validateAll = useCallback(() => validateOrderAll(formRef.current), [])

  const { setWizardState } = useWizardNav()
  useEffect(() => {
    setWizardState({ step, totalSteps, setStep, submitHandler, submitting: false, validateStep, validateAll })
    return () => setWizardState(null)
  }, [step, totalSteps, setStep, submitHandler, setWizardState, validateStep, validateAll])

  return (
    <OrderFormContext.Provider value={{
      form, updateField, updateFields, resetForm, clearDraft, step, setStep, totalSteps,
      submitHandler, registerSubmitHandler,
    }}>
      {children}
    </OrderFormContext.Provider>
  )
}

export function useOrderForm() {
  const ctx = useContext(OrderFormContext)
  if (!ctx) throw new Error('useOrderForm must be used within OrderFormProvider')
  return ctx
}

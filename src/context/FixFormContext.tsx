import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { type FixFormData, INITIAL_FIX_FORM } from '../lib/types'
import { useWizardNav } from './WizardNavContext'

interface FixFormContextType {
  form: FixFormData
  updateField: <K extends keyof FixFormData>(key: K, value: FixFormData[K]) => void
  updateFields: (updates: Partial<FixFormData>) => void
  resetForm: () => void
  step: number
  setStep: (s: number) => void
  totalSteps: number
  submitHandler: (() => Promise<void>) | null
  registerSubmitHandler: (fn: (() => Promise<void>) | null) => void
}

const STORAGE_KEY = 'fix_draft'
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

  useEffect(() => {
    // Don't save File objects to localStorage
    const { image_files, ...rest } = form
    void image_files
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
  }, [form])

  const updateField = useCallback(<K extends keyof FixFormData>(key: K, value: FixFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateFields = useCallback((updates: Partial<FixFormData>) => {
    setForm(prev => ({ ...prev, ...updates }))
  }, [])

  const resetForm = useCallback(() => {
    setForm({ ...INITIAL_FIX_FORM, order_date: new Date().toISOString().split('T')[0] })
    setStep(1)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const [submitHandler, setSubmitHandler] = useState<(() => Promise<void>) | null>(null)
  const registerSubmitHandler = useCallback((fn: (() => Promise<void>) | null) => {
    setSubmitHandler(() => fn)  // стрелочная функция ОБЯЗАТЕЛЬНА — иначе React вызовет fn как updater
  }, [])

  const { setWizardState } = useWizardNav()
  useEffect(() => {
    setWizardState({ step, totalSteps, setStep, submitHandler, submitting: false })
    return () => setWizardState(null)
  }, [step, totalSteps, setStep, submitHandler, setWizardState])

  return (
    <FixFormContext.Provider value={{
      form, updateField, updateFields, resetForm, step, setStep, totalSteps,
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

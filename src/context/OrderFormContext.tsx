import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { type OrderFormData, INITIAL_FORM_DATA } from '../lib/types'
import { useWizardNav } from './WizardNavContext'

interface OrderFormContextType {
  form: OrderFormData
  updateField: <K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => void
  updateFields: (updates: Partial<OrderFormData>) => void
  resetForm: () => void
  step: number
  setStep: (s: number) => void
  totalSteps: number
  submitHandler: (() => Promise<void>) | null
  registerSubmitHandler: (fn: (() => Promise<void>) | null) => void
}

const STORAGE_KEY = 'order_draft'
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

  useEffect(() => {
    // Don't save File objects to localStorage
    const { image_files, ...rest } = form
    void image_files
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
  }, [form])

  const updateField = useCallback(<K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateFields = useCallback((updates: Partial<OrderFormData>) => {
    setForm(prev => ({ ...prev, ...updates }))
  }, [])

  const resetForm = useCallback(() => {
    setForm({ ...INITIAL_FORM_DATA, order_date: new Date().toISOString().split('T')[0] })
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
    <OrderFormContext.Provider value={{
      form, updateField, updateFields, resetForm, step, setStep, totalSteps,
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

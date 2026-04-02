import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { type OrderFormData, INITIAL_FORM_DATA } from '../lib/types'

interface OrderFormContextType {
  form: OrderFormData
  updateField: <K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => void
  updateFields: (updates: Partial<OrderFormData>) => void
  resetForm: () => void
  step: number
  setStep: (s: number) => void
  totalSteps: number
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
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

  return (
    <OrderFormContext.Provider value={{ form, updateField, updateFields, resetForm, step, setStep, totalSteps }}>
      {children}
    </OrderFormContext.Provider>
  )
}

export function useOrderForm() {
  const ctx = useContext(OrderFormContext)
  if (!ctx) throw new Error('useOrderForm must be used within OrderFormProvider')
  return ctx
}

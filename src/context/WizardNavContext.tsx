import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { StepErrors } from '../lib/validation'

export interface WizardNavState {
  step: number
  totalSteps: number
  setStep: (s: number) => void
  submitHandler: (() => Promise<void>) | null
  submitting: boolean
  /** Rules for one step. Stable identity — reads the live form via a ref. */
  validateStep: (step: number) => StepErrors
  /** Rules across every step — the gate for the final Submit. */
  validateAll: () => StepErrors
}

interface WizardNavContextType {
  state: WizardNavState | null
  setWizardState: (state: WizardNavState | null) => void
  /** Errors from the last blocked navigation attempt, keyed by field name. */
  errors: StepErrors
  setErrors: (errors: StepErrors) => void
  clearErrors: () => void
}

const WizardNavContext = createContext<WizardNavContextType | null>(null)

const NO_ERRORS: StepErrors = {}

export function WizardNavProvider({ children }: { children: ReactNode }) {
  const [state, setStateInternal] = useState<WizardNavState | null>(null)
  const [errors, setErrorsInternal] = useState<StepErrors>(NO_ERRORS)

  const setWizardState = useCallback((s: WizardNavState | null) => {
    setStateInternal(s)
  }, [])

  const setErrors = useCallback((e: StepErrors) => {
    setErrorsInternal(Object.keys(e).length === 0 ? NO_ERRORS : e)
  }, [])

  const clearErrors = useCallback(() => {
    setErrorsInternal(prev => (prev === NO_ERRORS ? prev : NO_ERRORS))
  }, [])

  return (
    <WizardNavContext.Provider value={{ state, setWizardState, errors, setErrors, clearErrors }}>
      {children}
    </WizardNavContext.Provider>
  )
}

export function useWizardNav() {
  const ctx = useContext(WizardNavContext)
  if (!ctx) throw new Error('useWizardNav must be used within WizardNavProvider')
  return ctx
}

/** Convenience hook for steps: just the error map. */
export function useWizardErrors(): StepErrors {
  return useWizardNav().errors
}

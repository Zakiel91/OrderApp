import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface WizardNavState {
  step: number
  totalSteps: number
  setStep: (s: number) => void
  submitHandler: (() => Promise<void>) | null
  submitting: boolean
}

interface WizardNavContextType {
  state: WizardNavState | null
  setWizardState: (state: WizardNavState | null) => void
}

const WizardNavContext = createContext<WizardNavContextType | null>(null)

export function WizardNavProvider({ children }: { children: ReactNode }) {
  const [state, setStateInternal] = useState<WizardNavState | null>(null)
  const setWizardState = useCallback((s: WizardNavState | null) => {
    setStateInternal(s)
  }, [])
  return (
    <WizardNavContext.Provider value={{ state, setWizardState }}>
      {children}
    </WizardNavContext.Provider>
  )
}

export function useWizardNav() {
  const ctx = useContext(WizardNavContext)
  if (!ctx) throw new Error('useWizardNav must be used within WizardNavProvider')
  return ctx
}

import { useEffect, useRef, useState } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { useAuth } from '../context/AuthContext'
import { useWizardNav } from '../context/WizardNavContext'
import { ProgressBar } from '../components/ProgressBar'
import { DraftSavedToast } from '../components/DraftSavedToast'
import { Step2Client } from '../steps/Step2Client'
import { Step3Product } from '../steps/Step3Product'
import { Step4Stones } from '../steps/Step4Stones'
import { Step5Costs } from '../steps/Step5Costs'
import { Step6Review } from '../steps/Step6Review'

// Step 1 (Order Basics) is now automatic — prefix from user, date = today, number = auto
const STEPS = [Step2Client, Step3Product, Step4Stones, Step5Costs, Step6Review]

export function NewOrderPage() {
  const { form, updateFields, step, totalSteps } = useOrderForm()
  const { user } = useAuth()
  const { clearErrors } = useWizardNav()
  const StepComponent = STEPS[step - 1]

  // Always force prefix + salesman from user — draft cannot override identity
  const orderDate = form.order_date
  useEffect(() => {
    if (!user) return
    updateFields({
      order_prefix: user.prefix,
      salesman_name: user.name,
      ...(orderDate ? {} : { order_date: new Date().toISOString().split('T')[0] }),
    })
  }, [user, orderDate, updateFields])

  // UX-01 + UX-05: slide direction. Derived state adjusted during render — the
  // pattern React documents for "state that depends on a previous value". Refs
  // must not be read or written during render, and an effect would both lag a
  // frame and trip react-hooks/set-state-in-effect.
  const [tracker, setTracker] = useState<{ step: number; direction: 'forward' | 'back' }>(
    { step, direction: 'forward' }
  )
  if (tracker.step !== step) {
    setTracker({ step, direction: step > tracker.step ? 'forward' : 'back' })
  }
  const direction = tracker.direction

  // Scroll reset is a genuine side effect, so it stays in an effect.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    window.scrollTo(0, 0)
    // Validation messages belong to the step that produced them.
    clearErrors()
  }, [step, clearErrors])

  return (
    <>
      <div className="pb-28">
        <ProgressBar current={step} total={totalSteps} />
        <div
          key={step}
          className={direction === 'forward'
            ? 'animate-[slideInLeft_200ms_ease-out]'
            : 'animate-[slideInRight_200ms_ease-out]'}
        >
          <StepComponent />
        </div>
      </div>
      <DraftSavedToast form={form} />
    </>
  )
}

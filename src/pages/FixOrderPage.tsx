import { useEffect, useRef, useState } from 'react'
import { useFixForm } from '../context/FixFormContext'
import { useAuth } from '../context/AuthContext'
import { useWizardNav } from '../context/WizardNavContext'
import { ProgressBar } from '../components/ProgressBar'
import { DraftSavedToast } from '../components/DraftSavedToast'
import { FixStep1Client } from '../fix-steps/FixStep1Client'
import { FixStep2Item } from '../fix-steps/FixStep2Item'
import { FixStep3Review } from '../fix-steps/FixStep3Review'

const STEPS = [FixStep1Client, FixStep2Item, FixStep3Review]

export function FixOrderPage() {
  const { form, updateFields, step, totalSteps } = useFixForm()
  const { user } = useAuth()
  const { clearErrors } = useWizardNav()
  const StepComponent = STEPS[step - 1]

  const salesmanName = form.salesman_name
  const orderDate = form.order_date
  useEffect(() => {
    const patch: Parameters<typeof updateFields>[0] = {}
    if (user && !salesmanName) patch.salesman_name = user.name
    if (!orderDate) patch.order_date = new Date().toISOString().split('T')[0]
    if (Object.keys(patch).length > 0) updateFields(patch)
  }, [user, salesmanName, orderDate, updateFields])

  // Derived state adjusted during render — see NewOrderPage.
  const [tracker, setTracker] = useState<{ step: number; direction: 'forward' | 'back' }>(
    { step, direction: 'forward' }
  )
  if (tracker.step !== step) {
    setTracker({ step, direction: step > tracker.step ? 'forward' : 'back' })
  }
  const direction = tracker.direction

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    window.scrollTo(0, 0)
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

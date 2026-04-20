import { useEffect, useRef, useState } from 'react'
import { useFixForm } from '../context/FixFormContext'
import { useAuth } from '../context/AuthContext'
import { ProgressBar } from '../components/ProgressBar'
import { DraftSavedToast } from '../components/DraftSavedToast'
import { FixStep1Client } from '../fix-steps/FixStep1Client'
import { FixStep2Item } from '../fix-steps/FixStep2Item'
import { FixStep3Review } from '../fix-steps/FixStep3Review'

const STEPS = [FixStep1Client, FixStep2Item, FixStep3Review]

export function FixOrderPage() {
  const { form, updateField, step, totalSteps } = useFixForm()
  const { user } = useAuth()
  const StepComponent = STEPS[step - 1]

  const prevStep = useRef(step)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  useEffect(() => {
    if (user) {
      if (!form.salesman_name) updateField('salesman_name', user.name)
    }
    if (!form.order_date) updateField('order_date', new Date().toISOString().split('T')[0])
  }, [user, form.salesman_name, form.order_date, updateField])

  // UX-01 + UX-05: scroll reset + direction tracking on step change
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; prevStep.current = step; return }
    setDirection(step > prevStep.current ? 'forward' : 'back')
    prevStep.current = step
    window.scrollTo(0, 0)
  }, [step])

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

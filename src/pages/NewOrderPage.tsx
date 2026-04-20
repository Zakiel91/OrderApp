import { useEffect, useRef, useState } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { useAuth } from '../context/AuthContext'
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
  const { form, updateField, step, totalSteps } = useOrderForm()
  const { user } = useAuth()
  const StepComponent = STEPS[step - 1]

  const prevStep = useRef(step)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  // Auto-set order basics from logged-in user
  useEffect(() => {
    if (user) {
      if (!form.order_prefix) {
        updateField('order_prefix', user.prefix)
      }
      if (!form.salesman_name) {
        updateField('salesman_name', user.name)
      }
    }
    // Always ensure date is set
    if (!form.order_date) {
      updateField('order_date', new Date().toISOString().split('T')[0])
    }
  }, [user, form.order_prefix, form.salesman_name, form.order_date, updateField])

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

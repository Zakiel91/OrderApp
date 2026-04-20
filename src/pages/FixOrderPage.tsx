import { useEffect, useRef } from 'react'
import { useFixForm } from '../context/FixFormContext'
import { useAuth } from '../context/AuthContext'
import { ProgressBar } from '../components/ProgressBar'
import { FixStep1Client } from '../fix-steps/FixStep1Client'
import { FixStep2Item } from '../fix-steps/FixStep2Item'
import { FixStep3Review } from '../fix-steps/FixStep3Review'

const STEPS = [FixStep1Client, FixStep2Item, FixStep3Review]

export function FixOrderPage() {
  const { form, updateField, step, totalSteps } = useFixForm()
  const { user } = useAuth()
  const StepComponent = STEPS[step - 1]

  useEffect(() => {
    if (user) {
      if (!form.salesman_name) updateField('salesman_name', user.name)
    }
    if (!form.order_date) updateField('order_date', new Date().toISOString().split('T')[0])
  }, [user, form.salesman_name, form.order_date, updateField])

  // UX-01: scroll to top on step change (per D-04, D-05, D-06)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    window.scrollTo(0, 0)
  }, [step])

  return (
    <div className="pb-28">
      <ProgressBar current={step} total={totalSteps} />
      <StepComponent />
    </div>
  )
}

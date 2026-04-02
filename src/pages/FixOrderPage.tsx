import { useEffect } from 'react'
import { useFixForm } from '../context/FixFormContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { ProgressBar } from '../components/ProgressBar'
import { buttonClass, secondaryButtonClass } from '../components/FormField'
import { FixStep1Client } from '../fix-steps/FixStep1Client'
import { FixStep2Item } from '../fix-steps/FixStep2Item'
import { FixStep3Review } from '../fix-steps/FixStep3Review'

const STEPS = [FixStep1Client, FixStep2Item, FixStep3Review]

export function FixOrderPage() {
  const { form, updateField, step, setStep, totalSteps } = useFixForm()
  const { user } = useAuth()
  const { t } = useLanguage()
  const StepComponent = STEPS[step - 1]

  useEffect(() => {
    if (user) {
      if (!form.salesman_name) updateField('salesman_name', user.name)
    }
    if (!form.order_date) updateField('order_date', new Date().toISOString().split('T')[0])
  }, [user, form.salesman_name, form.order_date, updateField])

  return (
    <div className="pb-28">
      <ProgressBar current={step} total={totalSteps} />
      <StepComponent />

      {step < totalSteps && (
        <div className="p-4 flex gap-3">
          {step > 1 && (
            <button className={secondaryButtonClass} onClick={() => setStep(step - 1)}>
              {t('back')}
            </button>
          )}
          <button className={buttonClass} onClick={() => setStep(step + 1)}>
            {t('next')}
          </button>
        </div>
      )}
      {step === totalSteps && step > 1 && (
        <div className="px-4">
          <button className={secondaryButtonClass} onClick={() => setStep(step - 1)}>
            {t('back')}
          </button>
        </div>
      )}
    </div>
  )
}

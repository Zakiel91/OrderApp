import { useEffect } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { ProgressBar } from '../components/ProgressBar'
import { buttonClass, secondaryButtonClass } from '../components/FormField'
import { Step2Client } from '../steps/Step2Client'
import { Step3Product } from '../steps/Step3Product'
import { Step4Stones } from '../steps/Step4Stones'
import { Step5Costs } from '../steps/Step5Costs'
import { Step6Review } from '../steps/Step6Review'

// Step 1 (Order Basics) is now automatic — prefix from user, date = today, number = auto
const STEPS = [Step2Client, Step3Product, Step4Stones, Step5Costs, Step6Review]

export function NewOrderPage() {
  const { form, updateField, step, setStep, totalSteps } = useOrderForm()
  const { user } = useAuth()
  const { t } = useLanguage()
  const StepComponent = STEPS[step - 1]

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

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
import { useWizardNav } from '../context/WizardNavContext'
import { hasErrors } from '../lib/validation'
import { buttonClass, secondaryButtonClass } from './FormField'

const tabs = [
  { path: '/orders', labelKey: 'nav_orders', icon: '📋' },
  { path: '/orders/new', labelKey: 'nav_new', icon: '➕' },
  { path: '/orders/fix', labelKey: 'nav_fix', icon: '🔧' },
  { path: '/settings', labelKey: 'nav_settings', icon: '⚙️' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { state, setErrors, clearErrors } = useWizardNav()
  const [submitting, setSubmitting] = useState(false)

  const isWizard = location.pathname === '/orders/new' || location.pathname === '/orders/fix'

  // Wizard mode
  if (isWizard && state) {
    const { step, totalSteps, setStep, submitHandler, validateStep, validateAll } = state
    const isLastStep = step === totalSteps

    const handleNext = () => {
      // Required fields are now enforced here. Before this, the asterisks in the
      // form were decorative and "Next" always advanced.
      const errs = validateStep(step)
      setErrors(errs)
      if (hasErrors(errs)) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setStep(step + 1)
    }

    const handleBack = () => {
      clearErrors()
      setStep(step - 1)
    }

    const handleSubmit = async () => {
      if (!submitHandler) return

      // Re-check every step, not just the review screen: a field could have been
      // cleared after the step that owns it was passed.
      const errs = validateAll()
      setErrors(errs)
      if (hasErrors(errs)) {
        // Jump back to the first step that actually has a problem.
        for (let s = 1; s < totalSteps; s++) {
          if (hasErrors(validateStep(s))) { setStep(s); break }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      setSubmitting(true)
      try {
        await submitHandler()
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <nav
        className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] safe-area-bottom z-50"
        style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}
      >
        <div className="flex gap-2 px-4 py-2 max-w-lg mx-auto">
          {step > 1 && (
            <button
              className={secondaryButtonClass + ' !w-auto flex-1'}
              onClick={handleBack}
              disabled={submitting}
            >
              {t('back')}
            </button>
          )}
          {isLastStep ? (
            <button
              className={buttonClass + ' !w-auto flex-1'}
              onClick={handleSubmit}
              disabled={submitting || !submitHandler}
            >
              {submitting ? t('loading') : `✓ ${t('submit_order')}`}
            </button>
          ) : (
            <button
              className={buttonClass + ' !w-auto flex-1'}
              onClick={handleNext}
            >
              {t('next')}
            </button>
          )}
        </div>
      </nav>
    )
  }

  // Standard tab mode (unchanged)
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] safe-area-bottom z-50"
      style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}
    >
      <div className="flex justify-around max-w-lg mx-auto">
        {tabs.map(tab => {
          const active = location.pathname === tab.path ||
            (tab.path === '/orders' && location.pathname.startsWith('/orders/') && !location.pathname.includes('new') && !location.pathname.includes('fix'))
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center py-2 px-3 min-h-[52px] flex-1 transition-colors ${
                active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{tab.icon}</span>
              <span className="text-[11px] mt-0.5">{t(tab.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

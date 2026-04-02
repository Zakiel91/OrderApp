import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { buttonClass, inputClass } from '../components/FormField'

const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const DEV_CODE = '9119'

export function LoginPage() {
  const { loginWithGoogle, loginWithDevCode, isLoading, authError } = useAuth()
  const { t } = useLanguage()
  const [devInput, setDevInput] = useState('')
  const [devError, setDevError] = useState('')

  // Try Google One Tap on mount
  useEffect(() => {
    if (!IS_DEV) {
      const timer = setTimeout(() => loginWithGoogle(), 500)
      return () => clearTimeout(timer)
    }
  }, [loginWithGoogle])

  const handleDevLogin = () => {
    if (devInput === DEV_CODE) {
      loginWithDevCode()
    } else {
      setDevError('Wrong code')
      setTimeout(() => setDevError(''), 2000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-5xl mb-6">💎</div>
      <h1 className="text-2xl font-bold mb-2">{t('login_title')}</h1>
      <p className="text-[var(--color-text-muted)] mb-8">{t('login_subtitle')}</p>

      <div className="w-full max-w-xs space-y-4">
        {/* Dev login — localhost only */}
        {IS_DEV && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="password"
                className={inputClass}
                placeholder="Dev code"
                value={devInput}
                onChange={e => setDevInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDevLogin()}
                autoFocus
              />
              <button
                className="px-4 rounded-xl font-semibold text-white flex-shrink-0"
                style={{ background: 'var(--color-primary)' }}
                onClick={handleDevLogin}
              >
                →
              </button>
            </div>
            {devError && <p className="text-[var(--color-error)] text-sm text-center">{devError}</p>}
            <div className="flex items-center gap-2 py-1">
              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
              <span className="text-xs text-[var(--color-text-muted)]">or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            </div>
          </div>
        )}

        {/* Google renders its button here */}
        <div id="google-signin-btn" className="flex justify-center" />

        <button
          className={buttonClass}
          onClick={loginWithGoogle}
          disabled={isLoading}
        >
          {isLoading ? t('loading') : t('login_button')}
        </button>

        {authError && (
          <div className="rounded-xl p-3 text-sm text-center"
            style={{ background: 'var(--color-error)15', border: '1px solid var(--color-error)40', color: 'var(--color-error)' }}>
            {authError}
          </div>
        )}

        <p className="text-xs text-center text-[var(--color-text-muted)] mt-4">
          {t('login_restricted')}
        </p>
      </div>
    </div>
  )
}

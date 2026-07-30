import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { buttonClass } from '../components/FormField'

export function LoginPage() {
  const { loginWithGoogle, isLoading, authError, configError } = useAuth()
  const { t } = useLanguage()

  // Try Google One Tap on mount — skipped when the build has no client id.
  useEffect(() => {
    if (configError) return
    const timer = setTimeout(() => loginWithGoogle(), 500)
    return () => clearTimeout(timer)
  }, [loginWithGoogle, configError])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-5xl mb-6" aria-hidden="true">💎</div>
      <h1 className="text-2xl font-bold mb-2">{t('login_title')}</h1>
      <p className="text-[var(--color-text-muted)] mb-8">{t('login_subtitle')}</p>

      <div className="w-full max-w-xs space-y-4">
        {/* A missing VITE_GOOGLE_CLIENT_ID used to throw at module scope, which
            rendered a blank page with no explanation. */}
        {configError ? (
          <div role="alert" className="rounded-xl p-3 text-sm text-center"
            style={{ background: 'var(--color-error)15', border: '1px solid var(--color-error)40', color: 'var(--color-error)' }}>
            {configError}
          </div>
        ) : (
          <>
            {/* Google renders its button here */}
            <div id="google-signin-btn" className="flex justify-center" />

            <button
              className={buttonClass}
              onClick={loginWithGoogle}
              disabled={isLoading}
            >
              {isLoading ? t('loading') : t('login_button')}
            </button>
          </>
        )}

        {authError && (
          <div role="alert" className="rounded-xl p-3 text-sm text-center"
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

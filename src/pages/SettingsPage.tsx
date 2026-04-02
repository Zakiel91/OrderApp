import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { secondaryButtonClass } from '../components/FormField'
import type { Language } from '../lib/types'

const LANGUAGES: { key: Language; labelKey: string }[] = [
  { key: 'en', labelKey: 'english' },
  { key: 'he', labelKey: 'hebrew' },
  { key: 'ru', labelKey: 'russian' },
]

export function SettingsPage() {
  const { lang, setLang, t } = useLanguage()
  const { user, logout } = useAuth()

  return (
    <div className="p-4 pb-24">
      <h1 className="text-lg font-bold mb-6">{t('settings_title')}</h1>

      {user && (
        <div className="bg-[var(--color-surface)] rounded-xl p-4 mb-4 flex items-center gap-3">
          {user.picture && (
            <img src={user.picture} alt="" className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
          )}
          <div>
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-[var(--color-text-muted)]">{user.email}</div>
            <div className="text-xs text-[var(--color-accent)] mt-0.5">{user.prefix} · {user.role}</div>
          </div>
        </div>
      )}

      <div className="bg-[var(--color-surface)] rounded-xl p-4 mb-4">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">{t('language')}</h2>
        <div className="flex gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                lang === l.key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text)]'
              }`}
            >
              {t(l.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <button className={secondaryButtonClass} onClick={logout}>
        {t('logout')}
      </button>
    </div>
  )
}

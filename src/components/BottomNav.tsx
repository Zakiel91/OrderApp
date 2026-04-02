import { useLocation, useNavigate } from 'react-router'
import { useLanguage } from '../context/LanguageContext'

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] safe-area-bottom z-50" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
      <div className="flex justify-around max-w-lg mx-auto">
        {tabs.map(tab => {
          const active = location.pathname === tab.path ||
            (tab.path === '/orders' && location.pathname.startsWith('/orders/') && !location.pathname.includes('new') && !location.pathname.includes('fix'))
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center py-2 px-3 min-h-[52px] flex-1 transition-colors ${
                active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[11px] mt-0.5">{t(tab.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

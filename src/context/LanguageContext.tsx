import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import type { Language } from '../lib/types'
import { getTranslations, isRTL } from '../i18n'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, vars?: Record<string, string>) => string
  rtl: boolean
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const SUPPORTED: Language[] = ['en', 'he', 'ru']

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('lang') as Language | null
      return saved && SUPPORTED.includes(saved) ? saved : 'en'
    } catch {
      return 'en'
    }
  })

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    try { localStorage.setItem('lang', l) } catch { /* private mode */ }
  }, [])

  const rtl = isRTL(lang)

  useEffect(() => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang, rtl])

  // Resolved once per language instead of on every single t() call.
  const translations = useMemo(() => getTranslations(lang), [lang])

  const t = useCallback((key: string, vars?: Record<string, string>) => {
    let text = translations[key] || key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        // split/join replaces every occurrence — String.replace(string, …) only
        // replaces the first.
        text = text.split(`{${k}}`).join(v)
      }
    }
    return text
  }, [translations])

  const value = useMemo(() => ({ lang, setLang, t, rtl }), [lang, setLang, t, rtl])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

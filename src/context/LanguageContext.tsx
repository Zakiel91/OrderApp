import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Language } from '../lib/types'
import { getTranslations, isRTL } from '../i18n'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, vars?: Record<string, string>) => string
  rtl: boolean
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'en'
  })

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }, [])

  const rtl = isRTL(lang)

  useEffect(() => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang, rtl])

  const t = useCallback((key: string, vars?: Record<string, string>) => {
    const translations = getTranslations(lang)
    let text = translations[key] || key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v)
      })
    }
    return text
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, rtl }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

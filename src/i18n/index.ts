import en from './en.json'
import he from './he.json'
import ru from './ru.json'
import type { Language } from '../lib/types'

const translations: Record<Language, Record<string, string>> = { en, he, ru }

export function getTranslations(lang: Language) {
  return translations[lang]
}

export function isRTL(lang: Language) {
  return lang === 'he'
}

export function getDefaultSizeSystem(lang: Language) {
  if (lang === 'he') return 'mm' as const
  if (lang === 'ru') return 'eu' as const
  return 'us' as const
}

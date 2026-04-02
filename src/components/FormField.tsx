import type { ReactNode } from 'react'
import { useLanguage } from '../context/LanguageContext'

interface Props {
  label: string
  sublabel?: string
  required?: boolean
  children: ReactNode
}

export function FormField({ label, sublabel, required, children }: Props) {
  const { t } = useLanguage()
  return (
    <div className="mb-5">
      <label className="block text-[15px] font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">
        {label}
        {sublabel && <span className="text-[var(--color-text-muted)] text-xs ms-2 opacity-70">{sublabel}</span>}
        {required && <span className="text-[var(--color-accent)] ms-1">*</span>}
        {!required && <span className="text-[var(--color-text-muted)] text-xs ms-1 opacity-50">({t('optional')})</span>}
      </label>
      {children}
    </div>
  )
}

export const inputClass = 'w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-[17px] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 min-h-[50px] transition-all shadow-sm'

export const selectClass = inputClass + ' appearance-none'

export const buttonClass = 'w-full bg-[var(--color-primary)] text-white font-semibold rounded-xl px-4 py-4 min-h-[52px] active:bg-[var(--color-primary-dark)] transition-all tracking-wider uppercase text-[15px] disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg'

export const secondaryButtonClass = 'w-full bg-[var(--color-surface)] text-[var(--color-text)] font-medium rounded-xl px-4 py-3.5 min-h-[50px] active:bg-[var(--color-surface-light)] transition-colors border border-[var(--color-border)] text-[15px] shadow-sm'

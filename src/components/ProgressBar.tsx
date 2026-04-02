import { useLanguage } from '../context/LanguageContext'

interface Props {
  current: number
  total: number
}

export function ProgressBar({ current, total }: Props) {
  const { t } = useLanguage()
  const pct = (current / total) * 100

  return (
    <div className="px-4 pt-3 pb-2">
      <div className="flex justify-between text-sm text-[var(--color-text-muted)] mb-1.5">
        <span>{t('step')} {current} {t('of')} {total}</span>
      </div>
      <div className="h-1.5 bg-[var(--color-surface-light)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
        />
      </div>
    </div>
  )
}

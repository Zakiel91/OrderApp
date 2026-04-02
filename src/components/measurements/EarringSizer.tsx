import { useOrderForm } from '../../context/OrderFormContext'
import { useLanguage } from '../../context/LanguageContext'
import { FormField } from '../FormField'
import { EARRING_BACKS } from '../../lib/measurements'
import type { EarringSubType } from '../../lib/types'

export function EarringSizer() {
  const { form, updateField } = useOrderForm()
  const { t } = useLanguage()

  const subTypes: EarringSubType[] = ['stud', 'hoop', 'drop', 'huggie', 'clip-on']
  const backs = form.earring_sub_type ? EARRING_BACKS[form.earring_sub_type] || [] : []

  return (
    <div className="space-y-4">
      <FormField label={t('earring_type')} required>
        <div className="flex flex-wrap gap-2">
          {subTypes.map(st => (
            <button
              key={st}
              type="button"
              onClick={() => {
                updateField('earring_sub_type', st)
                updateField('earring_back_type', '')
              }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                form.earring_sub_type === st
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text)]'
              }`}
            >
              {t(st === 'clip-on' ? 'clip_on' : st)}
            </button>
          ))}
        </div>
      </FormField>

      {backs.length > 0 && (
        <FormField label={t('back_type')}>
          <div className="flex flex-wrap gap-2">
            {backs.map(back => (
              <button
                key={back}
                type="button"
                onClick={() => updateField('earring_back_type', back)}
                className={`px-3 py-2.5 rounded-lg text-sm min-h-[44px] transition-colors ${
                  form.earring_back_type === back
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-light)] text-[var(--color-text)]'
                }`}
              >
                {t(back)}
              </button>
            ))}
          </div>
        </FormField>
      )}
    </div>
  )
}

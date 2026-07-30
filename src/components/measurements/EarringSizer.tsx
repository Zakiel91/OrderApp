import { useOrderForm } from '../../context/OrderFormContext'
import { useLanguage } from '../../context/LanguageContext'
import { useWizardErrors } from '../../context/WizardNavContext'
import { FormField, fieldClass } from '../FormField'
import { EARRING_BACKS } from '../../lib/measurements'
import type { EarringSubType } from '../../lib/types'

export function EarringSizer() {
  const { form, updateField } = useOrderForm()
  const { t } = useLanguage()
  const errors = useWizardErrors()

  const subTypes: EarringSubType[] = ['stud', 'hoop', 'drop', 'huggie', 'clip-on']
  const backs = form.earring_sub_type ? EARRING_BACKS[form.earring_sub_type] || [] : []

  // Hoops/huggies are described by diameter; drops by how far they hang.
  const showDiameter = form.earring_sub_type === 'hoop' || form.earring_sub_type === 'huggie'
  const showDrop = form.earring_sub_type === 'drop'

  return (
    <div className="space-y-4">
      <FormField label={t('earring_type')} required error={errors.earring_sub_type}>
        <div className="flex flex-wrap gap-2">
          {subTypes.map(st => (
            <button
              key={st}
              type="button"
              aria-pressed={form.earring_sub_type === st}
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
                aria-pressed={form.earring_back_type === back}
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

      {/* These two columns were already in the submit payload but had no input
          anywhere in the UI. */}
      {showDiameter && (
        <FormField label={t('hoop_diameter')}>
          <input
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            className={fieldClass()}
            value={form.earring_diameter_mm}
            onChange={e => updateField('earring_diameter_mm', e.target.value)}
            placeholder="mm"
          />
        </FormField>
      )}

      {showDrop && (
        <FormField label={t('drop_length')}>
          <input
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            className={fieldClass()}
            value={form.earring_drop_length_mm}
            onChange={e => updateField('earring_drop_length_mm', e.target.value)}
            placeholder="mm"
          />
        </FormField>
      )}
    </div>
  )
}

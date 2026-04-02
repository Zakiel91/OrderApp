import { useOrderForm } from '../../context/OrderFormContext'
import { useLanguage } from '../../context/LanguageContext'
import { FormField, inputClass, selectClass } from '../FormField'
import { NECKLACE_PRESETS, PENDANT_SIZES, PENDANT_EXT1_SIZES, PENDANT_EXT2_SIZES, NECKLACE_EXTENSIONS, cmToInches } from '../../lib/measurements'

export function NecklaceSizer() {
  const { form, updateField } = useOrderForm()
  const { t } = useLanguage()
  const isPendant = form.jewelry_type === 'pendant'

  const addStation = () => {
    updateField('necklace_stations', [...form.necklace_stations, ''])
  }

  const removeStation = (idx: number) => {
    updateField('necklace_stations', form.necklace_stations.filter((_, i) => i !== idx))
  }

  const updateStation = (idx: number, val: string) => {
    const updated = [...form.necklace_stations]
    updated[idx] = val
    updateField('necklace_stations', updated)
  }

  // Pendant: attached/not attached, then sizes 36-45, extensions
  if (isPendant) {
    return (
      <div className="space-y-4">
        {/* Attached / Not Attached */}
        <FormField label={t('pendant_attached_label')} required>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateField('pendant_attached', true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                form.pendant_attached === true
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text)]'
              }`}
            >
              {t('attached')}
            </button>
            <button
              type="button"
              onClick={() => updateField('pendant_attached', false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                form.pendant_attached === false
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text)]'
              }`}
            >
              {t('not_attached')}
            </button>
          </div>
        </FormField>

        {/* Main chain length 36-45 */}
        <FormField label={t('pendant_chain_length')} required>
          <select
            className={selectClass}
            value={form.pendant_length_cm}
            onChange={e => updateField('pendant_length_cm', e.target.value)}
          >
            <option value="">--</option>
            {PENDANT_SIZES.map(cm => (
              <option key={cm} value={String(cm)}>{cm} cm</option>
            ))}
          </select>
        </FormField>

        {/* Extension 1: 38-45 */}
        <FormField label={t('extension_1')}>
          <select
            className={selectClass}
            value={form.pendant_extension_1}
            onChange={e => updateField('pendant_extension_1', e.target.value)}
          >
            <option value="">{t('none')}</option>
            {PENDANT_EXT1_SIZES.map(cm => (
              <option key={cm} value={String(cm)}>{cm} cm</option>
            ))}
          </select>
        </FormField>

        {/* Extension 2: 40-45 (only show if ext1 is selected) */}
        {form.pendant_extension_1 && (
          <FormField label={t('extension_2')}>
            <select
              className={selectClass}
              value={form.pendant_extension_2}
              onChange={e => updateField('pendant_extension_2', e.target.value)}
            >
              <option value="">{t('none')}</option>
              {PENDANT_EXT2_SIZES.filter(cm => cm > Number(form.pendant_extension_1)).map(cm => (
                <option key={cm} value={String(cm)}>{cm} cm</option>
              ))}
            </select>
          </FormField>
        )}
      </div>
    )
  }

  // Necklace: presets + custom + extensions + stations
  return (
    <div className="space-y-4">
      <FormField label={t('necklace_preset')}>
        <div className="flex flex-wrap gap-2">
          {NECKLACE_PRESETS.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => updateField('necklace_length_cm', String(p.cm))}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                form.necklace_length_cm === String(p.cm)
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text)]'
              } ${p.key === 'princess' && form.necklace_length_cm !== String(p.cm) ? 'ring-1 ring-[var(--color-primary)]' : ''}`}
            >
              <div>{t(p.key)}</div>
              <div className="text-xs opacity-70">{p.range} cm</div>
            </button>
          ))}
        </div>
      </FormField>

      <FormField label={t('necklace_length')}>
        <div className="relative">
          <input
            type="number"
            className={inputClass}
            value={form.necklace_length_cm}
            onChange={e => updateField('necklace_length_cm', e.target.value)}
            placeholder="cm"
          />
          {form.necklace_length_cm && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">
              = {cmToInches(parseFloat(form.necklace_length_cm))}"
            </span>
          )}
        </div>
      </FormField>

      <FormField label={t('extension_chain')}>
        <div className="flex flex-wrap gap-2">
          {NECKLACE_EXTENSIONS.map(ext => (
            <button
              key={ext.key}
              type="button"
              onClick={() => updateField('necklace_extension', ext.key)}
              className={`px-4 py-2.5 rounded-lg text-sm min-h-[44px] transition-colors ${
                form.necklace_extension === ext.key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text)]'
              }`}
            >
              {ext.key === 'none' ? t('none') : `${ext.cm}cm (${cmToInches(ext.cm)}")`}
            </button>
          ))}
        </div>
      </FormField>

      <div className="border border-[var(--color-border)] rounded-lg p-3">
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={form.necklace_stations.length > 0}
            onChange={e => {
              if (e.target.checked) updateField('necklace_stations', ['38', '45'])
              else updateField('necklace_stations', [])
            }}
            className="w-5 h-5 accent-[var(--color-primary)]"
          />
          <span className="text-sm font-medium">{t('multi_station')}</span>
        </label>

        {form.necklace_stations.length > 0 && (
          <div className="space-y-2">
            {form.necklace_stations.map((st, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-muted)] w-20">
                  {t('station')} {idx + 1}
                </span>
                <input
                  type="number"
                  className={inputClass + ' flex-1'}
                  value={st}
                  onChange={e => updateStation(idx, e.target.value)}
                  placeholder="cm"
                />
                {form.necklace_stations.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeStation(idx)}
                    className="text-[var(--color-error)] px-2 py-1 text-lg"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {form.necklace_stations.length < 5 && (
              <button
                type="button"
                onClick={addStation}
                className="text-sm text-[var(--color-primary)] py-2"
              >
                {t('add_station')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

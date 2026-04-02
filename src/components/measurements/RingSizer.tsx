import { useOrderForm } from '../../context/OrderFormContext'
import { useLanguage } from '../../context/LanguageContext'
import { FormField, selectClass } from '../FormField'
import { RING_SIZES, getRingSizeConversion } from '../../lib/measurements'
import type { RingSizeSystem } from '../../lib/types'

export function RingSizer() {
  const { form, updateField } = useOrderForm()
  const { t } = useLanguage()
  const isEternity = form.jewelry_type === 'eternity'

  // IL uses same values as EU (circumference in mm)
  const sizeOptions = RING_SIZES.map(s => {
    if (form.size_system === 'us') return { value: String(s.us), label: `US ${s.us}` }
    if (form.size_system === 'eu') return { value: String(s.eu), label: `EU ${s.eu}` }
    if (form.size_system === 'il') return { value: String(s.eu), label: `IL ${s.eu}` }
    return { value: String(s.mm), label: `${s.mm} mm` }
  })

  const selectedSize = RING_SIZES.find(s => {
    const val = parseFloat(form.size)
    if (form.size_system === 'us') return s.us === val
    if (form.size_system === 'eu' || form.size_system === 'il') return s.eu === val
    return s.mm === val
  })

  return (
    <div className="space-y-4">
      <FormField label={t('size_system')}>
        <div className="flex gap-2">
          {(['us', 'eu', 'il', 'mm'] as RingSizeSystem[]).map(sys => (
            <button
              key={sys}
              type="button"
              onClick={() => { updateField('size_system', sys); updateField('size', '') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                form.size_system === sys
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text)]'
              }`}
            >
              {sys === 'us' ? 'US' : sys === 'eu' ? 'EU' : sys === 'il' ? 'IL' : 'mm'}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label={t('ring_size')} required>
        <select
          className={selectClass}
          value={form.size}
          onChange={e => updateField('size', e.target.value)}
        >
          <option value="">--</option>
          {sizeOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {selectedSize && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            = {getRingSizeConversion(selectedSize, form.size_system === 'il' ? 'eu' : form.size_system)}
          </p>
        )}
      </FormField>

      <label className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-lg cursor-pointer">
        <input
          type="checkbox"
          checked={form.wide_band}
          onChange={e => updateField('wide_band', e.target.checked)}
          className="w-5 h-5 accent-[var(--color-primary)]"
        />
        <span className="text-sm">{t('wide_band')}</span>
      </label>

      {isEternity && (
        <FormField label={t('eternity_type')} required>
          <div className="flex gap-2">
            {(['full', 'half', '3/4'] as const).map(et => (
              <button
                key={et}
                type="button"
                onClick={() => updateField('eternity_type', et)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                  form.eternity_type === et
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-light)] text-[var(--color-text)]'
                }`}
              >
                {t(`eternity_${et === '3/4' ? '3_4' : et}`)}
              </button>
            ))}
          </div>
          {form.eternity_type === 'full' && (
            <p className="text-xs text-[var(--color-warning)] mt-1.5">{t('eternity_full_warning')}</p>
          )}
        </FormField>
      )}

      <FormField label={t('finger_notes')}>
        <input
          type="text"
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm min-h-[44px]"
          placeholder=""
          value={form.comment}
          onChange={e => updateField('comment', e.target.value)}
        />
      </FormField>
    </div>
  )
}

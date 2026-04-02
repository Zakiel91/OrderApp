import { useOrderForm } from '../../context/OrderFormContext'
import { useLanguage } from '../../context/LanguageContext'
import { FormField, inputClass, selectClass } from '../FormField'
import { getBraceletSizes, getBangleSizes } from '../../lib/measurements'
import type { BraceletSubType } from '../../lib/types'

const braceletSizes = getBraceletSizes()
const bangleSizes = getBangleSizes()

export function BraceletSizer() {
  const { form, updateField } = useOrderForm()
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <FormField label={t('bracelet_type')} required>
        <div className="flex gap-2">
          {(['chain', 'bangle', 'tennis'] as BraceletSubType[]).map(bt => (
            <button
              key={bt}
              type="button"
              onClick={() => updateField('bracelet_sub_type', bt)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                form.bracelet_sub_type === bt
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text)]'
              }`}
            >
              {t(bt)}
            </button>
          ))}
        </div>
      </FormField>

      {(form.bracelet_sub_type === 'chain' || form.bracelet_sub_type === 'tennis') && (
        <FormField label={t('bracelet_size')} required>
          <select
            className={selectClass}
            value={form.size}
            onChange={e => updateField('size', e.target.value)}
          >
            <option value="">--</option>
            {braceletSizes.map(cm => (
              <option key={cm} value={String(cm)}>{cm} cm</option>
            ))}
          </select>
        </FormField>
      )}

      {form.bracelet_sub_type === 'bangle' && (
        <FormField label={t('bangle_size_cm')} required>
          <select
            className={selectClass}
            value={form.bangle_size_cm}
            onChange={e => updateField('bangle_size_cm', e.target.value)}
          >
            <option value="">--</option>
            {bangleSizes.map(cm => (
              <option key={cm} value={String(cm)}>{cm} cm</option>
            ))}
            <option value="custom">{t('custom')}</option>
          </select>
          {form.bangle_size_cm === 'custom' && (
            <input
              type="number"
              className={inputClass + ' mt-2'}
              value={form.bangle_size_cm === 'custom' ? '' : form.bangle_size_cm}
              onChange={e => updateField('bangle_size_cm', e.target.value)}
              placeholder={t('custom') + ' cm'}
              step="0.1"
            />
          )}
        </FormField>
      )}
    </div>
  )
}

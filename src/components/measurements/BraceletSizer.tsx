import { useState } from 'react'
import { useOrderForm } from '../../context/OrderFormContext'
import { useLanguage } from '../../context/LanguageContext'
import { useWizardErrors } from '../../context/WizardNavContext'
import { FormField, fieldClass, selectClass } from '../FormField'
import { getBraceletSizes, getBangleSizes } from '../../lib/measurements'
import type { BraceletSubType } from '../../lib/types'

const braceletSizes = getBraceletSizes()
const bangleSizes = getBangleSizes()

export function BraceletSizer() {
  const { form, updateField } = useOrderForm()
  const { t } = useLanguage()
  const errors = useWizardErrors()

  // Custom mode has to live in its own state.
  // Previously the sentinel value 'custom' was written into bangle_size_cm and
  // the extra input was shown only while the field equalled 'custom' — so the
  // first typed character replaced the sentinel and unmounted the input. The
  // custom size was impossible to enter.
  const isPresetBangle = bangleSizes.some(cm => String(cm) === form.bangle_size_cm)
  const [customBangle, setCustomBangle] = useState(
    () => !!form.bangle_size_cm && !isPresetBangle
  )

  const errorSelectClass = (hasError?: boolean) =>
    hasError ? selectClass + ' !border-[var(--color-error)]' : selectClass

  return (
    <div className="space-y-4">
      <FormField label={t('bracelet_type')} required error={errors.bracelet_sub_type}>
        <div className="flex gap-2">
          {(['chain', 'bangle', 'tennis'] as BraceletSubType[]).map(bt => (
            <button
              key={bt}
              type="button"
              aria-pressed={form.bracelet_sub_type === bt}
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
        <FormField label={t('bracelet_size')} required error={errors.size}>
          <select
            className={errorSelectClass(!!errors.size)}
            aria-invalid={!!errors.size}
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
        <FormField label={t('bangle_size_cm')} required error={errors.bangle_size_cm}>
          <select
            className={errorSelectClass(!!errors.bangle_size_cm)}
            aria-invalid={!!errors.bangle_size_cm}
            value={customBangle ? 'custom' : form.bangle_size_cm}
            onChange={e => {
              if (e.target.value === 'custom') {
                setCustomBangle(true)
                updateField('bangle_size_cm', '')
              } else {
                setCustomBangle(false)
                updateField('bangle_size_cm', e.target.value)
              }
            }}
          >
            <option value="">--</option>
            {bangleSizes.map(cm => (
              <option key={cm} value={String(cm)}>{cm} cm</option>
            ))}
            <option value="custom">{t('custom')}</option>
          </select>
          {customBangle && (
            <input
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              className={fieldClass(!!errors.bangle_size_cm) + ' mt-2'}
              value={form.bangle_size_cm}
              onChange={e => updateField('bangle_size_cm', e.target.value)}
              placeholder={t('custom') + ' cm'}
              aria-label={t('bangle_size_cm')}
            />
          )}
        </FormField>
      )}
    </div>
  )
}

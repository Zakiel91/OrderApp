import { useOrderForm } from '../context/OrderFormContext'
import { useLanguage } from '../context/LanguageContext'
import { useWizardErrors } from '../context/WizardNavContext'
import { FormField, fieldClass } from '../components/FormField'
import { ImagePicker } from '../components/ImagePicker'
import { ORDER_PURPOSE_OPTIONS, CERTIFICATE_OPTIONS, PAYMENT_METHODS } from '../lib/constants'

export function Step5Costs() {
  const { form, updateField } = useOrderForm()
  const { t } = useLanguage()
  const errors = useWizardErrors()

  return (
    <div className="p-4 space-y-1">
      <h2 className="text-lg font-semibold mb-4">{t('step5_title')}</h2>

      {/* CGL / Price details */}
      <FormField label={t('cgl_price_details')}>
        <textarea
          className={fieldClass() + ' min-h-[60px] resize-none'}
          value={form.cgl_price_details}
          onChange={e => updateField('cgl_price_details', e.target.value)}
          rows={2}
          placeholder={t('cgl_price_placeholder')}
        />
      </FormField>

      {/* Certificate: SGS / CGL / SUSHI / None */}
      <FormField label={t('certificate')} required error={errors.certificate}>
        <div className="flex flex-wrap gap-2">
          {CERTIFICATE_OPTIONS.map(cert => (
            <button
              key={cert}
              type="button"
              aria-pressed={form.certificate === cert}
              onClick={() => updateField('certificate', cert)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                form.certificate === cert
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text)]'
              }`}
            >
              {cert === 'none' ? t('none') : cert.toUpperCase()}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label={t('price_to_client')} error={errors.price_to_client}>
        <input
          type="number"
          min="0"
          step="0.01"
          className={fieldClass(!!errors.price_to_client)}
          value={form.price_to_client}
          aria-invalid={!!errors.price_to_client}
          onChange={e => updateField('price_to_client', e.target.value)}
          placeholder="$"
        />
      </FormField>

      {/* UPID or MEMO - must select */}
      <FormField label={t('order_purpose')} required error={errors.order_purpose}>
        <div className="flex gap-2">
          {ORDER_PURPOSE_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              aria-pressed={form.order_purpose === opt}
              onClick={() => updateField('order_purpose', opt)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold min-h-[48px] transition-colors ${
                form.order_purpose === opt
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-light)] text-[var(--color-text)] border border-[var(--color-border)]'
              }`}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label={t('deadline')} required error={errors.deadline}>
        <input
          type="date"
          className={fieldClass(!!errors.deadline)}
          value={form.deadline}
          aria-invalid={!!errors.deadline}
          onChange={e => updateField('deadline', e.target.value)}
        />
      </FormField>

      {/* Image upload with camera support */}
      <FormField label={t('images')}>
        <ImagePicker
          files={form.image_files}
          onChange={files => updateField('image_files', files)}
        />
      </FormField>

      {/* Advance Payment (optional) */}
      <FormField label={t('advance_amount')} error={errors.advance_amount}>
        <input
          type="number"
          min="0"
          step="0.01"
          className={fieldClass(!!errors.advance_amount)}
          value={form.advance_amount}
          aria-invalid={!!errors.advance_amount}
          onChange={e => updateField('advance_amount', e.target.value)}
          placeholder="$"
        />
      </FormField>

      {form.advance_amount && parseFloat(form.advance_amount) > 0 && (
        <FormField label={t('advance_method')} required error={errors.advance_method}>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method}
                type="button"
                aria-pressed={form.advance_method === method}
                onClick={() => updateField('advance_method', method)}
                className={`flex-1 py-3 rounded-xl text-[14px] font-medium min-h-[50px] transition-colors ${
                  form.advance_method === method
                    ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
                }`}
              >
                {t(`payment_${method}`)}
              </button>
            ))}
          </div>
        </FormField>
      )}

      <FormField label={t('special_instructions')}>
        <textarea
          className={fieldClass() + ' min-h-[100px] resize-none'}
          value={form.special_instructions}
          onChange={e => updateField('special_instructions', e.target.value)}
          rows={4}
        />
      </FormField>
    </div>
  )
}

import { useRef } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { useLanguage } from '../context/LanguageContext'
import { FormField, inputClass } from '../components/FormField'
import { ORDER_PURPOSE_OPTIONS, CERTIFICATE_OPTIONS, PAYMENT_METHODS } from '../lib/constants'

export function Step5Costs() {
  const { form, updateField } = useOrderForm()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageAdd = (files: FileList | null) => {
    if (!files) return
    const newFiles = [...form.image_files, ...Array.from(files)]
    updateField('image_files', newFiles)
  }

  const handleImageRemove = (idx: number) => {
    const updated = form.image_files.filter((_, i) => i !== idx)
    updateField('image_files', updated)
  }

  return (
    <div className="p-4 space-y-1">
      <h2 className="text-lg font-semibold mb-4">{t('step5_title')}</h2>

      {/* CGL / Price details */}
      <FormField label={t('cgl_price_details')}>
        <textarea
          className={inputClass + ' min-h-[60px] resize-none'}
          value={form.cgl_price_details}
          onChange={e => updateField('cgl_price_details', e.target.value)}
          rows={2}
          placeholder={t('cgl_price_placeholder')}
        />
      </FormField>

      {/* Certificate: SGS / CGL / SUSHI / None */}
      <FormField label={t('certificate')} required>
        <div className="flex flex-wrap gap-2">
          {CERTIFICATE_OPTIONS.map(cert => (
            <button
              key={cert}
              type="button"
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

      <FormField label={t('price_to_client')}>
        <input
          type="number"
          className={inputClass}
          value={form.price_to_client}
          onChange={e => updateField('price_to_client', e.target.value)}
          placeholder="$"
        />
      </FormField>

      {/* UPID or MEMO - must select */}
      <FormField label={t('order_purpose')} required>
        <div className="flex gap-2">
          {ORDER_PURPOSE_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
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

      <FormField label={t('deadline')} required>
        <input
          type="date"
          className={inputClass}
          value={form.deadline}
          onChange={e => updateField('deadline', e.target.value)}
        />
      </FormField>

      {/* Image upload with camera support */}
      <FormField label={t('images')}>
        <div className="space-y-3">
          {/* Preview existing images */}
          {form.image_files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.image_files.map((file, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-border)]">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(idx)}
                    className="absolute top-0 right-0 bg-[var(--color-error)] text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {/* Camera button (mobile) */}
            <button
              type="button"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.capture = 'environment'
                input.onchange = (e) => handleImageAdd((e.target as HTMLInputElement).files)
                input.click()
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm min-h-[48px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              {t('camera')}
            </button>

            {/* File upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm min-h-[48px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {t('upload')}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleImageAdd(e.target.files)}
          />

          <p className="text-xs text-[var(--color-text-muted)]">
            {t('images_hint')}
          </p>
        </div>
      </FormField>

      {/* Advance Payment (optional) */}
      <FormField label={t('advance_amount')}>
        <input
          type="number"
          className={inputClass}
          value={form.advance_amount}
          onChange={e => updateField('advance_amount', e.target.value)}
          placeholder="$"
        />
      </FormField>

      {form.advance_amount && parseFloat(form.advance_amount) > 0 && (
        <FormField label={t('advance_method')} required>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method}
                type="button"
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
          className={inputClass + ' min-h-[100px] resize-none'}
          value={form.special_instructions}
          onChange={e => updateField('special_instructions', e.target.value)}
          rows={4}
        />
      </FormField>

    </div>
  )
}

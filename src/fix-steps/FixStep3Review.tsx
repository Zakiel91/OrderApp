import { useState } from 'react'
import { useFixForm } from '../context/FixFormContext'
import { useLanguage } from '../context/LanguageContext'
import { buttonClass } from '../components/FormField'
import { createOrder, updateOrder, saveClientIfNew } from '../lib/api'
import { uploadOrderImages } from '../lib/imageUtils'

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-[14px] font-semibold text-[var(--color-accent)] uppercase tracking-wider mb-2">{title}</h3>
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
        {children}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between px-4 py-3 gap-4">
      <span className="text-[13px] text-[var(--color-text-muted)] shrink-0">{label}</span>
      <span className="text-[14px] text-[var(--color-text)] text-end font-medium">{value}</span>
    </div>
  )
}

export function FixStep3Review() {
  const { form, resetForm } = useFixForm()
  const { t } = useLanguage()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        order_prefix: 'FIX',
        order_type: 'fix',
        order_date: form.order_date,
        salesman_name: form.salesman_name,
        client_name: form.client_name,
        client_id: form.client_id || undefined,
        client_phone: form.client_phone || undefined,
        client_email: form.client_email || undefined,
        client_address: form.client_address || undefined,
        client_country: form.client_country || undefined,
        jewelry_type: form.jewelry_type || undefined,
        metal: form.metal || undefined,
        description: [
          form.fix_options.map(o => o).join(', '),
          form.fix_other_text,
          form.size ? `New size: ${form.size}` : '',
          form.description,
        ].filter(Boolean).join(' | ') || undefined,
        main_stone_parcel: form.main_stone || undefined,
        comment: form.comment || undefined,
        price_to_client: form.price_to_client ? parseFloat(form.price_to_client) : undefined,
        deadline: form.deadline || undefined,
      }
      const result = await createOrder(payload)

      // Upload images to R2 if any
      if (form.image_files.length > 0 && result.id) {
        try {
          const imageKeys = await uploadOrderImages(form.image_files, String(result.id))
          if (imageKeys) {
            await updateOrder({ id: result.id, image_urls: imageKeys })
          }
        } catch { /* images failed but order was created */ }
      }

      // Silently save client to DB if they weren't already there
      if (!form.client_db_id && form.client_name) {
        saveClientIfNew({
          name: form.client_name,
          phone: form.client_phone || undefined,
          email: form.client_email || undefined,
          teudat_zehut: form.client_id || undefined,
          company_number: form.client_company_number || undefined,
          address: form.client_address || undefined,
          country: form.client_country || undefined,
        })
      }

      setSuccess(result.order_number)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="p-8 text-center">
        <div className="w-20 h-20 mx-auto bg-[var(--color-success)] rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">{t('fix_submitted')}</h2>
        <p className="text-[var(--color-text-muted)] mb-1">{t('fix_order_number')}</p>
        <p className="text-2xl font-bold text-[var(--color-accent)] mb-6">{success}</p>
        <button className={buttonClass} onClick={() => { resetForm(); setSuccess(null) }}>
          {t('fix_create_another')}
        </button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('fix_step3_title')}</h2>

      <ReviewSection title={t('review_client')}>
        <ReviewRow label={t('client_name')} value={form.client_name} />
        <ReviewRow label={t('client_id')} value={form.client_id} />
        <ReviewRow label={t('client_phone')} value={form.client_phone} />
        <ReviewRow label={t('client_email')} value={form.client_email} />
        <ReviewRow label={t('client_address')} value={form.client_address} />
        <ReviewRow label={t('client_country')} value={form.client_country} />
      </ReviewSection>

      <ReviewSection title={t('fix_review_details')}>
        <ReviewRow label={t('jewelry_type')} value={form.jewelry_type ? t(form.jewelry_type) : ''} />
        <ReviewRow label={t('metal')} value={form.metal} />
        <ReviewRow label={t('fix_what')} value={form.fix_options.map(o => t(`fixopt_${o}`)).join(', ')} />
        {form.fix_options.includes('other') && <ReviewRow label={t('fix_other_describe')} value={form.fix_other_text} />}
        {form.fix_options.includes('resize') && <ReviewRow label={t('fix_new_size')} value={form.size} />}
        <ReviewRow label={t('fix_upid')} value={form.main_stone} />
        <ReviewRow label={t('fix_description')} value={form.description} />
        <ReviewRow label={t('fix_comment')} value={form.comment} />
        <ReviewRow label={t('price_to_client')} value={form.price_to_client ? `$${form.price_to_client}` : ''} />
        <ReviewRow label={t('deadline')} value={form.deadline} />
        {form.image_files.length > 0 && (
          <ReviewRow label={t('images')} value={`${form.image_files.length} ${t('images_attached')}`} />
        )}
      </ReviewSection>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">{error}</div>
      )}

      <button className={buttonClass} onClick={handleSubmit} disabled={submitting}>
        {submitting ? t('submitting') : t('fix_submit')}
      </button>
    </div>
  )
}

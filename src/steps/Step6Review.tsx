import { useState } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { useLanguage } from '../context/LanguageContext'
import { buttonClass } from '../components/FormField'
import { createOrder, updateOrder, saveClientIfNew } from '../lib/api'
import { uploadOrderImages } from '../lib/imageUtils'

function ReviewRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="text-[var(--color-text)] font-medium text-end ms-4">{value}</span>
    </div>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-4 mb-3">
      <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-2">{title}</h3>
      <div className="divide-y divide-[var(--color-border)]">{children}</div>
    </div>
  )
}

export function Step6Review() {
  const { form, resetForm } = useOrderForm()
  const { t } = useLanguage()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const payload: Record<string, unknown> = {
        order_prefix: form.order_prefix,
        order_date: form.order_date,
        order_type: 'production',
        client_name: form.client_name,
        client_id: form.client_id || undefined,
        client_phone: form.client_phone || undefined,
        client_email: form.client_email || undefined,
        client_address: form.client_address || undefined,
        client_country: form.client_country || undefined,
        salesman_name: form.salesman_name,
        jewelry_type: form.jewelry_type,
        metal: form.metal,
        size: form.size || undefined,
        size_system: form.size_system || undefined,
        collection_style: form.collection_style || undefined,
        comment: form.comment || undefined,
        main_stone_parcel: form.main_stone_parcel || undefined,
        main_stone_manual: form.main_stone_manual || undefined,
        side_stones: form.side_stones || undefined,
        cat_claw: form.cat_claw || undefined,
        order_purpose: form.order_purpose || undefined,
        certificate: form.certificate || undefined,
        cgl_price_details: form.cgl_price_details || undefined,
        price_to_client: form.price_to_client ? parseFloat(form.price_to_client) : undefined,
        deadline: form.deadline || undefined,
        advance_amount: form.advance_amount ? parseFloat(form.advance_amount) : undefined,
        advance_method: form.advance_method || undefined,
        special_instructions: form.special_instructions || undefined,
        // Pendant fields
        pendant_attached: form.jewelry_type === 'pendant' ? form.pendant_attached : undefined,
        pendant_length_cm: form.pendant_length_cm || undefined,
        pendant_extension_1: form.pendant_extension_1 || undefined,
        pendant_extension_2: form.pendant_extension_2 || undefined,
        // Earring fields
        earring_sub_type: form.earring_sub_type || undefined,
        earring_back_type: form.earring_back_type || undefined,
        earring_diameter_mm: form.earring_diameter_mm ? parseFloat(form.earring_diameter_mm) : undefined,
        earring_drop_length_mm: form.earring_drop_length_mm ? parseFloat(form.earring_drop_length_mm) : undefined,
        // Bracelet fields
        bracelet_sub_type: form.bracelet_sub_type || undefined,
        bangle_size_cm: form.bangle_size_cm || undefined,
        // Necklace fields
        necklace_length_cm: form.necklace_length_cm || undefined,
        necklace_extension: form.necklace_extension || undefined,
        // Eternity
        eternity_type: form.eternity_type || undefined,
        wide_band: form.wide_band || undefined,
        status: 'new',
      }
      Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k] })

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

      setOrderNumber(result.order_number || form.order_prefix + '???')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2">{t('order_submitted')}</h2>
        <p className="text-[var(--color-text-muted)] mb-8 text-center">
          {t('order_created', { number: orderNumber })}
        </p>
        <div className="w-full max-w-xs space-y-3">
          <button className={buttonClass} onClick={resetForm}>
            {t('create_another')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('step6_title')}</h2>

      <ReviewSection title={t('review_basics')}>
        <ReviewRow label={t('prefix')} value={form.order_prefix} />
        <ReviewRow label={t('order_date')} value={form.order_date} />
        <ReviewRow label={t('ordered_by')} value={form.salesman_name} />
      </ReviewSection>

      <ReviewSection title={t('review_client')}>
        <ReviewRow label={t('client_name')} value={form.client_name} />
        <ReviewRow label={t('client_id')} value={form.client_id} />
        <ReviewRow label={t('client_phone')} value={form.client_phone} />
        <ReviewRow label={t('client_email')} value={form.client_email} />
        <ReviewRow label={t('client_address')} value={form.client_address} />
        <ReviewRow label={t('client_country')} value={form.client_country} />
      </ReviewSection>

      <ReviewSection title={t('review_product')}>
        <ReviewRow label={t('jewelry_type')} value={form.jewelry_type ? t(form.jewelry_type) : ''} />
        <ReviewRow label={t('metal')} value={form.metal} />
        <ReviewRow label={t('size')} value={form.size ? `${form.size} (${form.size_system.toUpperCase()})` : ''} />
        <ReviewRow label={t('collection')} value={form.collection_style} />
        {form.jewelry_type === 'pendant' && (
          <>
            <ReviewRow label={t('pendant_attached_label')} value={form.pendant_attached ? t('attached') : t('not_attached')} />
            <ReviewRow label={t('pendant_chain_length')} value={form.pendant_length_cm ? `${form.pendant_length_cm} cm` : ''} />
            <ReviewRow label={t('extension_1')} value={form.pendant_extension_1 ? `${form.pendant_extension_1} cm` : ''} />
            <ReviewRow label={t('extension_2')} value={form.pendant_extension_2 ? `${form.pendant_extension_2} cm` : ''} />
          </>
        )}
        {form.bracelet_sub_type === 'bangle' && (
          <ReviewRow label={t('bangle_size_cm')} value={form.bangle_size_cm ? `${form.bangle_size_cm} cm` : ''} />
        )}
        <ReviewRow label={t('comments')} value={form.comment} />
      </ReviewSection>

      <ReviewSection title={t('review_stones')}>
        <ReviewRow label={t('main_stone')} value={form.main_stone_parcel ? form.main_stone_parcel.split('|||').join(', ') : form.main_stone_manual} />
        <ReviewRow label={t('side_stones')} value={form.side_stones} />
        <ReviewRow label={t('prong_type')} value={form.cat_claw ? t(`prong_${form.cat_claw}`) : ''} />
      </ReviewSection>

      <ReviewSection title={t('review_costs')}>
        <ReviewRow label={t('certificate')} value={form.certificate ? form.certificate.toUpperCase() : ''} />
        <ReviewRow label={t('cgl_price_details')} value={form.cgl_price_details} />
        <ReviewRow label={t('order_purpose')} value={form.order_purpose ? form.order_purpose.toUpperCase() : ''} />
        <ReviewRow label={t('price_to_client')} value={form.price_to_client ? `$${form.price_to_client}` : ''} />
        <ReviewRow label={t('deadline')} value={form.deadline} />
        <ReviewRow label={t('advance_amount')} value={form.advance_amount ? `$${form.advance_amount}` : ''} />
        <ReviewRow label={t('advance_method')} value={form.advance_method ? t(`payment_${form.advance_method}`) : ''} />
        <ReviewRow label={t('special_instructions')} value={form.special_instructions} />
        {form.image_files.length > 0 && (
          <ReviewRow label={t('images')} value={`${form.image_files.length} ${t('images_attached')}`} />
        )}
      </ReviewSection>

      {error && (
        <div className="bg-[var(--color-error)]/20 border border-[var(--color-error)] rounded-lg p-3 mb-4 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      <button
        className={buttonClass}
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? t('loading') : t('submit_order')}
      </button>
    </div>
  )
}

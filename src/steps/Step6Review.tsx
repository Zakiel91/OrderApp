import { useState, useCallback, useEffect } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { useLanguage } from '../context/LanguageContext'
import { buttonClass } from '../components/FormField'
import { createOrder, updateOrder, saveClientIfNew, ApiError } from '../lib/api'
import { formatDateIL } from '../lib/constants'
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
  const { form, resetForm, clearDraft, registerSubmitHandler } = useOrderForm()
  const { t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [error, setError] = useState('')
  // Surfaced instead of swallowed: the order exists but its photos didn't land.
  const [imageWarning, setImageWarning] = useState(false)

  const handleSubmit = useCallback(async () => {
    setError('')
    setImageWarning(false)
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
        client_teudat: form.client_id || undefined,
        client_company_number: form.client_company_number || undefined,
        salesman_name: form.salesman_name,
        jewelry_type: form.jewelry_type,
        // Free-text type description for "other" — the worker stores body.description.
        description: form.jewelry_type === 'other' ? (form.other_type || undefined) : undefined,
        metal: form.metal,
        size: form.size || undefined,
        size_system: form.size_system || undefined,
        collection_style: form.collection_style || undefined,
        // There is no finger_notes column, so it is folded into the comment
        // rather than being dropped (which is what happened before it had its
        // own field).
        comment: [
          form.comment,
          form.finger_notes ? `Finger notes: ${form.finger_notes}` : '',
        ].filter(Boolean).join(' | ') || undefined,
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
        // Multi-station positions were captured in the UI but never submitted;
        // the worker stores them inside the `measurements` JSON column.
        necklace_stations: form.necklace_stations.length > 0 ? form.necklace_stations : undefined,
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
        } catch {
          // The order is saved; don't fail the submit, but say the photos didn't
          // make it so the salesman can re-attach them from the order screen.
          setImageWarning(true)
        }
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
      // Drop the persisted draft right away. It used to survive until the user
      // pressed "Create another", so navigating away left the submitted order
      // pre-filled into the next new order.
      clearDraft()
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) setError(t('err_network'))
      else setError(err instanceof Error ? err.message : t('error'))
    }
  }, [form, t, clearDraft])

  useEffect(() => {
    registerSubmitHandler(handleSubmit)
    return () => registerSubmitHandler(null)
  }, [handleSubmit, registerSubmitHandler])

  if (submitted) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl mb-4" aria-hidden="true">✅</div>
        <h2 className="text-xl font-bold mb-2">{t('order_submitted')}</h2>
        <p className="text-[var(--color-text-muted)] mb-4 text-center">
          {t('order_created', { number: orderNumber })}
        </p>
        {imageWarning && (
          <div className="w-full max-w-xs mb-4 rounded-xl p-3 text-[13px] text-center"
            style={{ background: 'var(--color-warning)15', border: '1px solid var(--color-warning)40', color: 'var(--color-warning)' }}>
            {t('images_upload_failed')}
          </div>
        )}
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
        <ReviewRow label={t('order_date')} value={form.order_date ? formatDateIL(form.order_date) : ''} />
        <ReviewRow label={t('ordered_by')} value={form.salesman_name} />
      </ReviewSection>

      <ReviewSection title={t('review_client')}>
        <ReviewRow label={t('client_name')} value={form.client_name} />
        <ReviewRow label={t('client_id')} value={form.client_id} />
        <ReviewRow label={t('company_number')} value={form.client_company_number} />
        <ReviewRow label={t('client_phone')} value={form.client_phone} />
        <ReviewRow label={t('client_email')} value={form.client_email} />
        <ReviewRow label={t('client_address')} value={form.client_address} />
        <ReviewRow label={t('client_country')} value={form.client_country} />
      </ReviewSection>

      <ReviewSection title={t('review_product')}>
        <ReviewRow label={t('jewelry_type')} value={form.jewelry_type ? t(form.jewelry_type) : ''} />
        <ReviewRow label={t('other_type_describe')} value={form.jewelry_type === 'other' ? form.other_type : ''} />
        <ReviewRow label={t('metal')} value={form.metal} />
        <ReviewRow label={t('size')} value={form.size ? `${form.size} (${form.size_system.toUpperCase()})` : ''} />
        <ReviewRow label={t('collection')} value={form.collection_style} />
        <ReviewRow label={t('finger_notes')} value={form.finger_notes} />
        {form.jewelry_type === 'earrings' && (
          <>
            <ReviewRow label={t('earring_type')} value={form.earring_sub_type ? t(form.earring_sub_type === 'clip-on' ? 'clip_on' : form.earring_sub_type) : ''} />
            <ReviewRow label={t('back_type')} value={form.earring_back_type ? t(form.earring_back_type) : ''} />
            <ReviewRow label={t('hoop_diameter')} value={form.earring_diameter_mm ? `${form.earring_diameter_mm} mm` : ''} />
            <ReviewRow label={t('drop_length')} value={form.earring_drop_length_mm ? `${form.earring_drop_length_mm} mm` : ''} />
          </>
        )}
        {form.jewelry_type === 'necklace' && (
          <>
            <ReviewRow label={t('necklace_length')} value={form.necklace_length_cm ? `${form.necklace_length_cm} cm` : ''} />
            <ReviewRow label={t('multi_station')} value={form.necklace_stations.filter(Boolean).join(', ')} />
          </>
        )}
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
        <ReviewRow label={t('deadline')} value={form.deadline ? formatDateIL(form.deadline) : ''} />
        <ReviewRow label={t('advance_amount')} value={form.advance_amount ? `$${form.advance_amount}` : ''} />
        <ReviewRow label={t('advance_method')} value={form.advance_method ? t(`payment_${form.advance_method}`) : ''} />
        <ReviewRow label={t('special_instructions')} value={form.special_instructions} />
        {form.image_files.length > 0 && (
          <ReviewRow label={t('images')} value={`${form.image_files.length} ${t('images_attached')}`} />
        )}
      </ReviewSection>

      {error && (
        <div role="alert" className="bg-[var(--color-error)]/20 border border-[var(--color-error)] rounded-lg p-3 mb-4 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
import { getOrder, updateOrder, ApiError } from '../lib/api'
import { formatStatus } from '../lib/constants'
import { EMAIL_RE } from '../lib/validation'
import { FormField, inputClass, fieldClass, selectClass, buttonClass, secondaryButtonClass } from '../components/FormField'
import type { Order } from '../lib/types'

const JEWELRY_TYPE_KEYS = ['ring', 'earrings', 'pendant', 'necklace', 'bracelet', 'eternity', 'other'] as const

export function EditOrderPage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) { setLoading(false); setError(t('error')); return }
    let cancelled = false
    getOrder(parseInt(id))
        .then(o => {
          if (cancelled) return
          if (o.status !== 'new') {
            // The message carries a {status} placeholder — it used to render literally.
            setError(t('edit_not_allowed', { status: formatStatus(o.status, t) }))
          } else {
            setOrder(o)
            setFormData({
              client_name_raw: o.client_name_raw ?? '',
              client_phone: o.client_phone ?? '',
              client_email: o.client_email ?? '',
              jewelry_type: o.jewelry_type ?? '',
              metal: o.metal ?? '',
              size: o.size ?? '',
              description: o.description ?? '',
              main_stone_parcel: o.main_stone_parcel ?? '',
              price_to_client: o.price_to_client != null ? String(o.price_to_client) : '',
              deadline: o.deadline ?? '',
              comment: o.comment ?? '',
            })
          }
        })
        .catch(e => {
          if (cancelled) return
          if (e instanceof ApiError && e.status === 0) setError(t('err_network'))
          else setError(e instanceof Error ? e.message : t('error'))
        })
        .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, t])

  const emailInvalid = !!formData.client_email?.trim() && !EMAIL_RE.test(formData.client_email.trim())
  const nameMissing = !formData.client_name_raw?.trim()

  const handleSave = async () => {
    if (!order) return
    // Same rules as the create wizard — the edit screen had none at all.
    if (nameMissing || emailInvalid) {
      setSaveError(t(nameMissing ? 'err_required_fields' : 'err_email'))
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await updateOrder({
        id: order.id,
        ...formData,
        price_to_client: formData.price_to_client ? parseFloat(formData.price_to_client) : undefined,
      })
      navigate(`/orders/${id}`)
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 0) setSaveError(t('err_network'))
      else setSaveError(e instanceof Error ? e.message : t('save_error'))
    } finally {
      setSaving(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(f => ({ ...f, [field]: e.target.value }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--color-text-muted)]">{t('loading')}</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <p className="text-[var(--color-text-muted)]">{error || t('error')}</p>
        <button className={secondaryButtonClass + ' mt-4'} onClick={() => navigate(`/orders/${id}`)}>
          {t('back')}
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      {/* Top action row */}
      <div className="flex gap-2 mb-4 items-center">
        <h1 className="text-lg font-bold flex-1">{order.order_number}</h1>
        <button onClick={handleSave} disabled={saving} className={buttonClass + ' w-auto px-4'}>
          {saving ? '...' : t('save_changes')}
        </button>
        <button className={secondaryButtonClass + ' w-auto px-4'} onClick={() => navigate(`/orders/${id}`)}>
          {t('back')}
        </button>
      </div>

      {/* Inline save error banner */}
      {saveError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
          <p className="text-sm text-red-400">{saveError}</p>
        </div>
      )}

      {/* Edit form card */}
      <div className="bg-[var(--color-surface)] rounded-xl p-4 mb-4">
        <div className="space-y-4">
          <FormField label={t('client_name')} required error={nameMissing ? 'err_required' : undefined}>
            <input className={fieldClass(nameMissing)} type="text" aria-invalid={nameMissing}
              value={formData.client_name_raw} onChange={set('client_name_raw')} />
          </FormField>
          <FormField label={t('client_phone')}>
            <input className={inputClass} type="tel" inputMode="tel" value={formData.client_phone} onChange={set('client_phone')} />
          </FormField>
          <FormField label={t('client_email')} error={emailInvalid ? 'err_email' : undefined}>
            <input className={fieldClass(emailInvalid)} type="email" inputMode="email" aria-invalid={emailInvalid}
              value={formData.client_email} onChange={set('client_email')} />
          </FormField>
          <FormField label={t('jewelry_type')}>
            <select className={selectClass} value={formData.jewelry_type} onChange={set('jewelry_type')}>
              <option value=""></option>
              {JEWELRY_TYPE_KEYS.map(k => (
                <option key={k} value={k}>{t(k)}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t('metal')}>
            <input className={inputClass} type="text" value={formData.metal} onChange={set('metal')} />
          </FormField>
          <FormField label={t('size')}>
            <input className={inputClass} type="text" value={formData.size} onChange={set('size')} />
          </FormField>
          <FormField label={t('description')}>
            <textarea className={inputClass + ' resize-none'} rows={3} value={formData.description} onChange={set('description')} />
          </FormField>
          <FormField label={t('main_stone')}>
            <input className={inputClass} type="text" value={formData.main_stone_parcel} onChange={set('main_stone_parcel')} />
          </FormField>
          <FormField label={t('price_to_client')}>
            <input className={inputClass} type="number" min="0" step="0.01" value={formData.price_to_client} onChange={set('price_to_client')} />
          </FormField>
          <FormField label={t('deadline')}>
            <input className={inputClass} type="date" value={formData.deadline} onChange={set('deadline')} />
          </FormField>
          <FormField label={t('comment')}>
            <textarea className={inputClass + ' resize-none'} rows={3} value={formData.comment} onChange={set('comment')} />
          </FormField>
        </div>
      </div>
    </div>
  )
}

export default EditOrderPage

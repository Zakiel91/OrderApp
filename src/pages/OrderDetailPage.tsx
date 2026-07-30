import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
import { getOrder, deleteOrder, updateOrder, ApiError } from '../lib/api'
import { formatDateIL, statusColor, formatStatus, tOr } from '../lib/constants'
import { secondaryButtonClass } from '../components/FormField'
import { FieldEditSheet } from '../components/FieldEditSheet'
import { ConfirmSheet } from '../components/ConfirmSheet'
import { AuthImage } from '../components/AuthImage'
import type { Order } from '../lib/types'

function FieldRow({
  label,
  value,
  editable,
  onTap,
}: {
  label: string
  value: string | number | undefined | null
  editable: boolean
  onTap: () => void
}) {
  if (!value && value !== 0) return null

  const inner = (
    <>
      <span className="text-[15px] text-[var(--color-text)] shrink-0">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[15px] text-[var(--color-text-secondary)] text-end" style={{ wordBreak: 'break-word' }}>
          {value}
        </span>
        {editable && (
          <span className="text-[11px] text-[var(--color-text-muted)] opacity-50" aria-hidden="true">›</span>
        )}
      </div>
    </>
  )

  const layout = 'w-full flex justify-between items-center px-4 gap-3 text-start'
  const style = { minHeight: 50, borderBottom: '1px solid var(--color-separator)' } as const

  // Editable rows are real buttons — as divs with onClick they were unreachable
  // by keyboard and silent to screen readers.
  if (!editable) {
    return <div className={layout} style={style}>{inner}</div>
  }
  return (
    <button type="button" className={layout} style={{ ...style, cursor: 'pointer' }} onClick={onTap}>
      {inner}
    </button>
  )
}

export function OrderDetailPage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'client' | 'item' | 'payment' | 'notes'>('client')
  const [sheet, setSheet] = useState<{
    field: string
    label: string
    value: string
    type?: string
  } | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(96)

  useEffect(() => {
    if (!headerRef.current) return
    const ro = new ResizeObserver(([entry]) => setHeaderHeight(entry.contentRect.height))
    ro.observe(headerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!id) { setLoading(false); setError(t('error')); return }
    let cancelled = false
    setLoading(true)
    getOrder(parseInt(id))
      .then(o => { if (!cancelled) setOrder(o) })
      .catch(e => {
        if (cancelled) return
        if (e instanceof ApiError && e.status === 0) setError(t('err_network'))
        else setError(e instanceof Error ? e.message : t('error'))
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, t])

  const handleDelete = async () => {
    if (!order) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteOrder(order.id)
      navigate('/orders')
    } catch (e) {
      setConfirmDelete(false)
      setDeleteError(e instanceof ApiError && e.status === 403 ? e.message : t('delete_error'))
    } finally {
      setDeleting(false)
    }
  }

  const handleFieldSave = async (field: string, value: string) => {
    if (!order) return
    setSaving(true)
    setSaveError(null)
    const isNumeric = field === 'price_to_client' || field === 'advance_amount'
    const parsed = isNumeric ? (value ? parseFloat(value) : undefined) : value
    try {
      await updateOrder({ id: order.id, [field]: parsed })
      setOrder(prev => (prev ? { ...prev, [field]: parsed } : prev))
      setSheet(null)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (e) {
      setSaveError(e instanceof ApiError && e.status === 0 ? t('err_network') : t('save_error'))
    } finally {
      setSaving(false)
    }
  }

  const openSheet = (
    field: string,
    label: string,
    value: string | number | undefined | null,
    type?: string
  ) => {
    // Defense-in-depth: FieldRow already receives editable={isEditable} and won't call onTap
    // when not editable. This guard is a safety net in case the caller changes in the future.
    if (order?.status !== 'new') return
    setSheet({ field, label, value: value != null ? String(value) : '', type })
  }

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
        <p role="alert" className="text-[var(--color-text-muted)] text-center">{error || t('error')}</p>
        <button className={secondaryButtonClass + ' mt-4'} onClick={() => navigate('/orders')}>
          {t('back')}
        </button>
      </div>
    )
  }

  const isFix = order.order_type === 'fix' || order.order_prefix === 'FIX'
  const clientName = order.client_name_raw || order.client_name || ''
  const isEditable = order.status === 'new'
  const imageKeys = (order.image_urls || '').split(',').map(k => k.trim()).filter(Boolean)

  return (
    <>
      <div className="min-h-screen pb-24" style={{ background: 'var(--color-ios-bg)' }}>
        {/* Sticky header */}
        <div
          ref={headerRef}
          className="bg-[var(--color-surface)] px-4 py-3"
          style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--color-separator)' }}
        >
          {/* Order number + status pill */}
          <div className="flex justify-between items-center mb-2.5 gap-2">
            <div>
              <div className="font-bold" style={{ fontSize: 20 }}>{order.order_number}</div>
              <div className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
                {order.order_date ? formatDateIL(order.order_date) : ''}
                {order.salesman_name ? ` · ${order.salesman_name}` : ''}
              </div>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 text-[13px] font-medium shrink-0 ${statusColor(order.status)}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {formatStatus(order.status, t)}
            </span>
          </div>

          {/* Quick action buttons */}
          <div className="flex gap-2">
            {order.client_phone && (
              <button
                type="button"
                className="flex-1 py-2 text-[13px] font-semibold transition-opacity active:opacity-75"
                style={{ background: '#e8f8ee', color: '#248a3d', borderRadius: 10, border: 'none' }}
                onClick={() => {
                  const digits = (order.client_phone ?? '').replace(/\D/g, '')
                  if (digits.length >= 7) {
                    window.open(`https://wa.me/${digits}`, '_blank', 'noopener,noreferrer')
                  }
                }}
              >
                {t('whatsapp_action')}
              </button>
            )}
            {order.status === 'new' && (
              <button
                type="button"
                className="flex-1 py-2 text-[13px] font-semibold transition-opacity active:opacity-75"
                style={{ background: 'rgba(0,122,255,0.1)', color: 'var(--color-primary)', borderRadius: 10, border: 'none' }}
                onClick={() => navigate(`/orders/${order.id}/edit`)}
              >
                {t('edit_order')}
              </button>
            )}
            <button
              type="button"
              className="px-3 py-2 text-[13px] font-semibold transition-opacity active:opacity-75 disabled:opacity-50"
              style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', borderRadius: 10, border: 'none' }}
              onClick={() => { setDeleteError(null); setConfirmDelete(true) }}
              disabled={deleting}
            >
              {deleting ? '…' : t('delete')}
            </button>
          </div>
        </div>

        {/* Delete error banner */}
        {deleteError && (
          <div className="mx-4 mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p role="alert" className="text-sm text-red-400">{deleteError}</p>
          </div>
        )}

        {/* Save error banner */}
        {saveError && (
          <div className="mx-4 mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p role="alert" className="text-sm text-red-400">{saveError}</p>
          </div>
        )}

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label={t('nav_orders')}
          className="bg-[var(--color-surface)] flex overflow-x-auto"
          style={{
            position: 'sticky',
            top: headerHeight,
            zIndex: 9,
            borderBottom: '1px solid var(--color-separator)',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {(['client', 'item', 'payment', 'notes'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className="px-[18px] py-3 text-[14px] font-medium whitespace-nowrap border-none bg-transparent cursor-pointer transition-all"
              style={{
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              }}
              onClick={() => setActiveTab(tab)}
            >
              {t(`tab_${tab}`)}
            </button>
          ))}
        </div>

        {/* Tab panels */}

        {/* Client tab */}
        {activeTab === 'client' && (
          <div role="tabpanel" className="mx-4 my-3 bg-[var(--color-surface)] overflow-hidden" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <FieldRow label={t('client_name')} value={clientName} editable={isEditable} onTap={() => openSheet('client_name_raw', t('client_name'), clientName, 'text')} />
            <FieldRow label={t('client_phone')} value={order.client_phone} editable={isEditable} onTap={() => openSheet('client_phone', t('client_phone'), order.client_phone, 'tel')} />
            <FieldRow label={t('client_email')} value={order.client_email} editable={isEditable} onTap={() => openSheet('client_email', t('client_email'), order.client_email, 'email')} />
            <FieldRow label={t('salesman')} value={order.salesman_name} editable={false} onTap={() => {}} />
            <FieldRow label={t('order_date')} value={order.order_date ? formatDateIL(order.order_date) : ''} editable={false} onTap={() => {}} />
          </div>
        )}

        {/* Item tab */}
        {activeTab === 'item' && (
          <div role="tabpanel" className="mx-4 my-3 bg-[var(--color-surface)] overflow-hidden" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <FieldRow label={t('jewelry_type')} value={order.jewelry_type ? tOr(t, order.jewelry_type, order.jewelry_type) : ''} editable={isEditable} onTap={() => openSheet('jewelry_type', t('jewelry_type'), order.jewelry_type, 'text')} />
            <FieldRow label={t('metal')} value={order.metal} editable={isEditable} onTap={() => openSheet('metal', t('metal'), order.metal, 'text')} />
            <FieldRow label={t('description')} value={order.description} editable={isEditable} onTap={() => openSheet('description', t('description'), order.description, 'text')} />
            <FieldRow label={isFix ? t('fix_upid') : t('main_stone')} value={order.main_stone_parcel} editable={isEditable} onTap={() => openSheet('main_stone_parcel', isFix ? t('fix_upid') : t('main_stone'), order.main_stone_parcel, 'text')} />
            <FieldRow label={t('size')} value={order.size} editable={isEditable} onTap={() => openSheet('size', t('size'), order.size, 'text')} />
            <FieldRow label={t('side_stones')} value={order.side_stones} editable={isEditable} onTap={() => openSheet('side_stones', t('side_stones'), order.side_stones, 'text')} />
            <FieldRow label={t('prong_type')} value={order.cat_claw ? tOr(t, `prong_${order.cat_claw}`, order.cat_claw) : ''} editable={isEditable} onTap={() => openSheet('cat_claw', t('prong_type'), order.cat_claw, 'text')} />
          </div>
        )}

        {/* Payment tab */}
        {activeTab === 'payment' && (
          <div role="tabpanel" className="mx-4 my-3 bg-[var(--color-surface)] overflow-hidden" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <FieldRow label={t('price_to_client')} value={order.price_to_client != null ? `$${order.price_to_client}` : undefined} editable={isEditable} onTap={() => openSheet('price_to_client', t('price_to_client'), order.price_to_client, 'number')} />
            <FieldRow label={t('deadline')} value={order.deadline ? formatDateIL(order.deadline) : undefined} editable={isEditable} onTap={() => openSheet('deadline', t('deadline'), order.deadline, 'date')} />
            <FieldRow label={t('advance_amount')} value={order.advance_amount != null ? `$${order.advance_amount}` : undefined} editable={isEditable} onTap={() => openSheet('advance_amount', t('advance_amount'), order.advance_amount, 'number')} />
            <FieldRow label={t('advance_method')} value={order.advance_method ? tOr(t, `payment_${order.advance_method}`, order.advance_method) : ''} editable={isEditable} onTap={() => openSheet('advance_method', t('advance_method'), order.advance_method, 'text')} />
          </div>
        )}

        {/* Notes tab */}
        {activeTab === 'notes' && (
          <div role="tabpanel" className="mx-4 my-3 bg-[var(--color-surface)] overflow-hidden" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <FieldRow label={t('comment')} value={order.comment} editable={isEditable} onTap={() => openSheet('comment', t('comment'), order.comment, 'text')} />
            <FieldRow label={t('special_instructions')} value={order.special_instructions} editable={isEditable} onTap={() => openSheet('special_instructions', t('special_instructions'), order.special_instructions, 'text')} />
          </div>
        )}

        {/* Images section */}
        {imageKeys.length > 0 && (
          <div className="mx-4 mt-2 mb-4">
            <p className="text-sm font-medium text-[var(--color-text-muted)] mb-2">{t('images')}</p>
            <div className="flex flex-wrap gap-2">
              {imageKeys.map((key, i) => (
                // Authenticated fetch → blob URL; /api/images/get requires a JWT
                // so a bare <img src> would 401.
                <AuthImage
                  key={key}
                  imageKey={key}
                  alt={`${t('images')} ${i + 1}`}
                  className="block w-24 h-24 rounded-xl overflow-hidden border border-[var(--color-border)] object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Success toast */}
      {saveSuccess && (
        <div
          role="status"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-[var(--color-success)] text-white text-[14px] px-4 py-1.5 rounded-full animate-[fadeIn_150ms_ease-out] pointer-events-none"
        >
          {t('save_success')}
        </div>
      )}

      {/* Delete confirmation — replaces window.confirm() */}
      {confirmDelete && (
        <ConfirmSheet
          title={t('delete_confirm')}
          message={order.order_number}
          confirmLabel={t('delete')}
          destructive
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {/* FieldEditSheet */}
      {sheet && (
        <FieldEditSheet
          field={sheet.field}
          label={sheet.label}
          value={sheet.value}
          type={sheet.type}
          saving={saving}
          onSave={handleFieldSave}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  )
}

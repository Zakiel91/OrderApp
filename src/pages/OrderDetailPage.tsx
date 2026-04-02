import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
import { getOrder, deleteOrder } from '../lib/api'
import { getImageUrl } from '../lib/imageUtils'
import { secondaryButtonClass } from '../components/FormField'
import type { Order } from '../lib/types'

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  received: 'bg-blue-500/20 text-blue-400',
  in_production: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-green-500/20 text-green-400',
  delivered: 'bg-green-600/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-400',
  on_hold: 'bg-gray-500/20 text-gray-400',
  paid: 'bg-emerald-500/20 text-emerald-400',
  sold: 'bg-purple-500/20 text-purple-400',
  in_stock: 'bg-cyan-500/20 text-cyan-400',
}

function DetailRow({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex justify-between py-3 text-sm border-b border-[var(--color-border)] last:border-0 gap-4">
      <span className="text-[var(--color-text-muted)] shrink-0">{label}</span>
      <span className="text-[var(--color-text)] font-medium text-end whitespace-pre-line">{value}</span>
    </div>
  )
}

export function OrderDetailPage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getOrder(parseInt(id))
        .then(o => setOrder(o))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleDelete = async () => {
    if (!order || !confirm(t('delete_confirm'))) return
    setDeleting(true)
    try {
      await deleteOrder(order.id)
      navigate('/orders')
    } catch {
      alert('Failed to delete')
    } finally {
      setDeleting(false)
    }
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
        <p className="text-[var(--color-text-muted)]">{error || t('error')}</p>
        <button className={secondaryButtonClass + ' mt-4'} onClick={() => navigate('/orders')}>
          {t('back')}
        </button>
      </div>
    )
  }

  const isFix = order.order_type === 'fix' || order.order_prefix === 'FIX'
  const clientName = order.client_name_raw || order.client_name || ''

  return (
    <div className="p-4 pb-24">
      <div className="flex gap-2 mb-4">
        <button className={secondaryButtonClass} onClick={() => navigate('/orders')}>
          {t('back')}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {deleting ? '...' : t('delete')}
        </button>
      </div>

      {/* Header */}
      <div className="bg-[var(--color-surface)] rounded-xl p-4 mb-4">
        <div className="flex justify-between items-start">
          <h1 className="text-lg font-bold">{order.order_number}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
            {order.status}
          </span>
        </div>
        {order.display_name && (
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{order.display_name}</p>
        )}
      </div>

      {/* Client */}
      <div className="bg-[var(--color-surface)] rounded-xl p-4 mb-4 space-y-0">
        <DetailRow label={t('client_name')} value={clientName} />
        <DetailRow label={t('client_phone')} value={order.client_phone} />
        <DetailRow label={t('client_email')} value={order.client_email} />
        <DetailRow label={t('salesman')} value={order.salesman_name} />
        <DetailRow label={t('order_date')} value={order.order_date} />
      </div>

      {/* Details */}
      <div className="bg-[var(--color-surface)] rounded-xl p-4 mb-4 space-y-0">
        <DetailRow label={t('jewelry_type')} value={order.jewelry_type} />
        <DetailRow label={t('metal')} value={order.metal} />
        <DetailRow label={t('description')} value={order.description} />
        <DetailRow label={isFix ? t('fix_upid') : t('main_stone')} value={order.main_stone_parcel} />
        <DetailRow label={t('size')} value={order.size} />
        <DetailRow label={t('side_stones')} value={order.side_stones} />
        <DetailRow label={t('prong_type')} value={order.cat_claw} />
        <DetailRow label={t('price_to_client')} value={order.price_to_client ? `$${order.price_to_client}` : undefined} />
        <DetailRow label={t('deadline')} value={order.deadline} />
        <DetailRow label={t('comment')} value={order.comment} />
      </div>

      {/* Images */}
      {order.image_urls && (
        <div className="mt-4">
          <p className="text-sm font-medium text-[var(--color-text-muted)] mb-2">{t('images')}</p>
          <div className="flex flex-wrap gap-2">
            {order.image_urls.split(',').filter(Boolean).map((key, i) => (
              <a key={i} href={getImageUrl(key)} target="_blank" rel="noopener noreferrer"
                className="block w-24 h-24 rounded-xl overflow-hidden border border-[var(--color-border)]">
                <img src={getImageUrl(key)} alt={`${i + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

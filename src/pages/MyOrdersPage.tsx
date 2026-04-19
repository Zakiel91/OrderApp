import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { getOrders } from '../lib/api'
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

// Sample order shown until user creates their own
const SAMPLE_ORDER: Order = {
  id: -1,
  order_number: 'SAMPLE-001',
  order_prefix: 'SAMPLE',
  order_date: new Date().toISOString().split('T')[0],
  order_type: 'new',
  client_name: 'Sample Client',
  salesman_name: 'Demo',
  jewelry_type: 'ring',
  metal: '14K WHITE',
  status: 'new',
}

export function MyOrdersPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    // Worker filters by salesman identity from JWT — no client-side filtering needed
    getOrders(1, 200).then(res => {
      setOrders(res.orders || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--color-text-muted)]">{t('loading')}</p>
      </div>
    )
  }

  const showSample = orders.length === 0
  const displayOrders = showSample ? [SAMPLE_ORDER] : orders

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">{t('nav_orders')}</h1>
        {user && (
          <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-1 rounded-lg">
            {user.prefix} · {user.name}
          </span>
        )}
      </div>

      {showSample && (
        <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-xl p-3 mb-4">
          <p className="text-[13px] text-[var(--color-accent)]">
            {t('sample_order_hint')}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {displayOrders.map(order => (
          <div
            key={order.id}
            onClick={() => {
              if (order.id === -1) return
              navigate(`/orders/${order.id}`)
            }}
            className={`bg-[var(--color-surface)] rounded-xl p-4 transition-colors ${
              order.id === -1
                ? 'opacity-50 border border-dashed border-[var(--color-border)]'
                : 'cursor-pointer active:bg-[var(--color-surface-light)]'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-sm">{order.order_number}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                {order.status}
              </span>
            </div>
            <div className="text-sm text-[var(--color-text-muted)] space-y-0.5">
              {(order.client_name_raw || order.client_name) && <div>{order.client_name_raw || order.client_name}</div>}
              <div className="flex justify-between">
                <span>{order.jewelry_type}{order.metal ? ` · ${order.metal}` : ''}</span>
                <span className="text-xs">{order.order_date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

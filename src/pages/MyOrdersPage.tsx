import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { getOrders } from '../lib/api'
import type { Order } from '../lib/types'
import { inputClass, selectClass, secondaryButtonClass } from '../components/FormField'

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
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadOrders = () => {
    setError(null)
    setLoading(true)
    getOrders(1, 200)
      .then(res => {
        setOrders(res.orders || [])
        setTotal(res.total || 0)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) { setLoading(false); return }
    loadOrders()
  }, [user])

  const handleRetry = () => loadOrders()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--color-text-muted)]">{t('loading')}</p>
      </div>
    )
  }

  const showSample = orders.length === 0 && !error

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !searchText ||
      (o.order_number?.toLowerCase().includes(searchText.toLowerCase())) ||
      (o.client_name_raw || o.client_name || '').toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })
  const isFiltered = searchText !== '' || statusFilter !== 'all'

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">{t('nav_orders')}</h1>
        <span className="text-xs text-[var(--color-text-muted)]">
          {isFiltered
            ? t('orders_filtered', { filtered: String(filteredOrders.length), total: String(total) })
            : t('orders_count', { count: String(total) })}
        </span>
        {user && (
          <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-1 rounded-lg">
            {user.prefix} · {user.name}
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className={inputClass + ' flex-1 min-h-[48px] text-sm'}
          type="text"
          placeholder={t('search_orders')}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          aria-label={t('search_orders')}
        />
        <select
          className={selectClass + ' w-auto min-h-[48px] text-sm'}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label={t('all_statuses')}
        >
          <option value="all">{t('all_statuses')}</option>
          {Object.keys(STATUS_COLORS).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <p className="text-[var(--color-text-muted)] text-center mb-4">{t('orders_load_error')}</p>
          <button className={secondaryButtonClass + ' w-auto px-6'} onClick={handleRetry}>
            {t('retry')}
          </button>
        </div>
      )}

      {!error && showSample && (
        <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-xl p-3 mb-4">
          <p className="text-[13px] text-[var(--color-accent)]">
            {t('sample_order_hint')}
          </p>
        </div>
      )}

      {!error && (
        <div className="space-y-3">
          {(showSample ? [SAMPLE_ORDER] : filteredOrders).map(order => (
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
          {!showSample && filteredOrders.length === 0 && orders.length > 0 && (
            <p className="text-center text-[var(--color-text-muted)] py-8 text-sm">{t('no_orders')}</p>
          )}
        </div>
      )}
    </div>
  )
}

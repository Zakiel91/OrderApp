import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { getOrders, ApiError } from '../lib/api'
import type { Order } from '../lib/types'
import { ORDER_STATUSES, statusColor, formatStatus, formatDateIL, tOr } from '../lib/constants'
import { inputClass, selectClass, secondaryButtonClass } from '../components/FormField'

const PAGE_SIZE = 100

// Sample order shown until user creates their own.
// Built per render so the date doesn't go stale in a long-lived PWA session.
function buildSampleOrder(): Order {
  return {
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
}

export function MyOrdersPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadPage = useCallback(async (nextPage: number, append: boolean) => {
    setError(null)
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const res = await getOrders(nextPage, PAGE_SIZE)
      setOrders(prev => (append ? [...prev, ...(res.orders || [])] : (res.orders || [])))
      setTotal(res.total || 0)
      setTotalPages(res.totalPages || 1)
      setPage(nextPage)
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) setError(t('err_network'))
      else setError(e instanceof Error ? e.message : t('error'))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [t])

  useEffect(() => {
    if (!user) { setLoading(false); return }
    loadPage(1, false)
  }, [user, loadPage])

  // Filtering runs on every keystroke; memoise so it isn't redone for unrelated
  // re-renders.
  const filteredOrders = useMemo(() => {
    const needle = searchText.trim().toLowerCase()
    return orders.filter(o => {
      const matchesSearch = !needle ||
        (o.order_number?.toLowerCase().includes(needle)) ||
        (o.client_name_raw || o.client_name || '').toLowerCase().includes(needle)
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchText, statusFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--color-text-muted)]">{t('loading')}</p>
      </div>
    )
  }

  const showSample = orders.length === 0 && !error
  const isFiltered = searchText !== '' || statusFilter !== 'all'
  const hasMore = page < totalPages
  const visible = showSample ? [buildSampleOrder()] : filteredOrders

  return (
    <div className="p-4 pb-24">
      {/* Two rows: three items on one flex line squeezed each other out. */}
      <div className="mb-4">
        <div className="flex justify-between items-baseline gap-3">
          <h1 className="text-lg font-bold">{t('nav_orders')}</h1>
          <span className="text-xs text-[var(--color-text-muted)] shrink-0">
            {isFiltered
              ? t('orders_filtered', { filtered: String(filteredOrders.length), total: String(orders.length) })
              : t('orders_count', { count: String(total) })}
          </span>
        </div>
        {user && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {user.prefix} · {user.name}
          </p>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className={inputClass + ' flex-1 min-h-[48px] text-sm'}
          type="search"
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
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{formatStatus(s, t)}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-6">
          <p role="alert" className="text-[var(--color-text-muted)] text-center mb-4">{error}</p>
          <button className={secondaryButtonClass + ' w-auto px-6'} onClick={() => loadPage(1, false)}>
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
        <>
          <ul className="space-y-3">
            {visible.map(order => {
              const isSample = order.id === -1
              const name = order.client_name_raw || order.client_name
              return (
                <li key={order.id}>
                  {/* A real <button>: the card used to be a div with onClick, so it
                      was unreachable by keyboard and invisible to screen readers. */}
                  <button
                    type="button"
                    disabled={isSample}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className={`w-full text-start bg-[var(--color-surface)] rounded-xl p-4 transition-colors ${
                      isSample
                        ? 'opacity-50 border border-dashed border-[var(--color-border)]'
                        : 'active:bg-[var(--color-surface-light)]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="font-semibold text-sm">{order.order_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColor(order.status)}`}>
                        {formatStatus(order.status, t)}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)] space-y-0.5">
                      {name && <div>{name}</div>}
                      <div className="flex justify-between gap-2">
                        <span>
                          {order.jewelry_type ? tOr(t, order.jewelry_type, order.jewelry_type) : ''}
                          {order.metal ? ` · ${order.metal}` : ''}
                        </span>
                        <span className="text-xs shrink-0">
                          {order.order_date ? formatDateIL(order.order_date) : ''}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>

          {!showSample && filteredOrders.length === 0 && orders.length > 0 && (
            <p className="text-center text-[var(--color-text-muted)] py-8 text-sm">{t('no_orders')}</p>
          )}

          {/* Previously the list silently stopped at the first page. */}
          {!showSample && hasMore && (
            <button
              className={secondaryButtonClass + ' mt-4'}
              disabled={loadingMore}
              onClick={() => loadPage(page + 1, true)}
            >
              {loadingMore ? t('loading') : t('load_more')}
            </button>
          )}
        </>
      )}
    </div>
  )
}

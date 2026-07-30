import type { FilterData, StoneResult, Order } from './types'
import { API_BASE } from './config'
import { notifySessionExpired } from './session'

function getAuthHeader(): Record<string, string> {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}
  } catch { return {} }
}

function hasToken(): boolean {
  return 'Authorization' in getAuthHeader()
}

/** Thrown by every API helper. `status` lets callers branch without parsing strings. */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Pull the most useful message out of the response: the worker returns
// `{ error: '...' }` on failures, but a proxy/edge error may return HTML.
async function readErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.text()
    if (!text) return res.statusText || `HTTP ${res.status}`
    try {
      const body = JSON.parse(text) as { error?: string; message?: string }
      if (body.error) return body.error
      if (body.message) return body.message
    } catch { /* not JSON — fall through to the raw text */ }
    return text.length > 200 ? `${text.slice(0, 200)}…` : text
  } catch {
    return res.statusText || `HTTP ${res.status}`
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(), ...init?.headers },
    })
  } catch {
    // Network-level failure (offline, DNS, CORS preflight). status 0 = "no response".
    throw new ApiError(0, 'network')
  }

  if (!res.ok) {
    // 401 = expired/revoked JWT. Tell AuthContext so the user is logged out
    // instead of staring at an unexplained error on every screen.
    if (res.status === 401 && hasToken()) notifySessionExpired()
    throw new ApiError(res.status, await readErrorMessage(res))
  }
  return res.json() as Promise<T>
}

export async function getFilters(): Promise<FilterData> {
  return fetchJson('/api/production/filters')
}

interface StoneRow {
  parcel?: string
  shape?: string
  ct?: number
  color?: string
  clarity?: string
  cert?: string
}

export async function searchStones(query: string): Promise<StoneResult[]> {
  if (!query || query.length < 2) return []
  const res = await fetchJson<{ stones?: StoneRow[] }>(`/api/production/stone-autocomplete?q=${encodeURIComponent(query)}`)
  return (res.stones || []).map(s => ({
    parcel_name: s.parcel ?? '',
    shape: s.shape,
    carat: s.ct,
    color: s.color,
    clarity: s.clarity,
    certificate: s.cert,
  }))
}

export interface UpidResult {
  upid: string
  model_name?: string
  model_type?: string
  center_stone_shape?: string
  metal_type?: string
  metal_color?: string
  count_in_stock?: number
}

export async function searchUpid(query: string): Promise<UpidResult[]> {
  if (!query || query.length < 2) return []
  return fetchJson(`/api/production/upid-autocomplete?q=${encodeURIComponent(query)}`)
}

export async function getOrders(page = 1, limit = 50): Promise<{
  orders: Order[]
  total: number
  page: number
  totalPages: number
}> {
  return fetchJson(`/api/production/orders?page=${page}&limit=${limit}`)
}

export async function getOrder(id: number): Promise<Order> {
  const res = await fetchJson<{ order: Order }>(`/api/production/order?id=${id}`)
  return res.order
}

export async function createOrder(data: Record<string, unknown>): Promise<{ id: number; order_number: string }> {
  return fetchJson('/api/production/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteOrder(id: number): Promise<{ success: boolean }> {
  return fetchJson(`/api/production/orders?id=${id}`, {
    method: 'DELETE',
  })
}

export async function updateOrder(data: Record<string, unknown>): Promise<{ success: boolean }> {
  return fetchJson('/api/production/orders', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// ─── Client lookup ────────────────────────────────────────────────────────────

// Shape returned by /api/production/client-lookup. The worker mixes DB rows
// (`id`, `name`, `company_name`) with normalised order-app fields
// (`client_name`, `client_phone`), so both sets are declared here — that is what
// removes the `as any` casts the lookup steps used to need.
export interface ClientRecord {
  id?: number
  name?: string
  company_name?: string
  client_name?: string
  client_id?: string
  company_number?: string
  client_phone?: string
  client_email?: string
  client_address?: string
  client_country?: string
  company_verified?: boolean
  company_status?: string
  source?: 'db' | 'gov.il' | 'checksum'
}

/** Multi-match response: the worker sets `multiple` and returns candidates. */
export interface ClientLookupResult extends ClientRecord {
  multiple?: boolean
  results?: ClientRecord[]
}

/** Display name for a lookup row, whichever field the worker populated. */
export function clientDisplayName(c: ClientRecord): string {
  return c.name || c.client_name || ''
}

export async function searchClientByField(
  field: 'phone' | 'id' | 'company',
  value: string,
): Promise<ClientLookupResult | null> {
  if (!value || value.length < 3) return null
  try {
    const param = field === 'id' ? 'id' : field === 'company' ? 'company' : 'phone'
    return await fetchJson<ClientLookupResult>(`/api/production/client-lookup?${param}=${encodeURIComponent(value)}`)
  } catch {
    return null
  }
}

// Save client to DB if they don't already exist (by name) — called silently on order submit
export async function saveClientIfNew(data: {
  name: string; phone?: string; email?: string; teudat_zehut?: string;
  company_number?: string; address?: string; country?: string
}): Promise<void> {
  try {
    await fetchJson('/api/production/clients', {
      method: 'POST',
      body: JSON.stringify({ ...data, save_if_new: true }),
    })
  } catch { /* silent — order already saved, this is best-effort */ }
}

export async function searchClientsByName(name: string): Promise<ClientRecord[]> {
  if (!name || name.length < 2) return []
  try {
    const res = await fetchJson<{ results?: ClientRecord[] }>(`/api/production/client-lookup?name=${encodeURIComponent(name)}`)
    return res?.results || []
  } catch {
    return []
  }
}

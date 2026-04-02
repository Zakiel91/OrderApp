import type { FilterData, StoneResult, Order } from './types'

const API_BASE = 'https://innovation-diamonds-api.innovation-diamonds.workers.dev'

function getAuthHeader(): Record<string, string> {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}
  } catch { return {} }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(), ...init?.headers },
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json()
}

export async function getFilters(): Promise<FilterData> {
  return fetchJson('/api/production/filters')
}

export async function searchStones(query: string): Promise<StoneResult[]> {
  if (!query || query.length < 2) return []
  const res = await fetchJson<{ stones: any[] }>(`/api/production/stone-autocomplete?q=${encodeURIComponent(query)}`)
  return (res.stones || []).map((s: any) => ({
    parcel_name: s.parcel,
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

// Search client by phone or ID number - auto-fill details
export interface ClientRecord {
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

export async function searchClientByField(field: 'phone' | 'id' | 'company', value: string): Promise<ClientRecord | null> {
  if (!value || value.length < 3) return null
  try {
    const param = field === 'id' ? 'id' : field === 'company' ? 'company' : 'phone'
    return await fetchJson(`/api/production/client-lookup?${param}=${encodeURIComponent(value)}`)
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
    const res: any = await fetchJson(`/api/production/client-lookup?name=${encodeURIComponent(name)}`)
    return res?.results || []
  } catch {
    return []
  }
}

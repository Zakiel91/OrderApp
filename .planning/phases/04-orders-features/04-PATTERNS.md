# Phase 4: Orders Features - Pattern Map

**Mapped:** 2026-04-21
**Files analyzed:** 7 (6 modified + 1 created)
**Analogs found:** 7 / 7

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/pages/EditOrderPage.tsx` | page/component | request-response (GET + PUT) | `src/pages/OrderDetailPage.tsx` | exact — same fetch-on-mount + action row + error state pattern |
| `src/pages/MyOrdersPage.tsx` | page/component | CRUD + client-side filter | `src/pages/OrderDetailPage.tsx` | role-match — shares error state + loading pattern |
| `src/pages/OrderDetailPage.tsx` | page/component | request-response | self (analog to EditOrderPage) | self |
| `src/App.tsx` | config/router | — | self (existing route registrations) | exact — Route element without provider |
| `C:\Dashboard\worker\src\routes\production.ts` | route handler | CRUD | `handleDeleteOrder` (lines 693–712 in same file) | exact — ownership check pattern to copy |
| `C:\Dashboard\worker\src\index.ts` | entry/router | request-response | line 1243 `handleDeleteOrder` call | exact — third `auth` argument pattern |
| `src/i18n/en.json`, `ru.json`, `he.json` | config/i18n | — | existing keys in same files | exact — flat JSON, no nesting |

---

## Pattern Assignments

### `src/pages/EditOrderPage.tsx` (page, request-response — CREATE)

**Analog:** `src/pages/OrderDetailPage.tsx`

**Imports pattern** (OrderDetailPage.tsx lines 1–8):
```typescript
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
import { getOrder, deleteOrder } from '../lib/api'
import { secondaryButtonClass } from '../components/FormField'
import type { Order } from '../lib/types'
```

For EditOrderPage, replace `deleteOrder` with `updateOrder` and add `inputClass`, `selectClass`, `buttonClass`, `FormField`:
```typescript
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
import { getOrder, updateOrder } from '../lib/api'
import { FormField, inputClass, selectClass, buttonClass, secondaryButtonClass } from '../components/FormField'
import type { Order } from '../lib/types'
```

**State pattern** (OrderDetailPage.tsx lines 37–40):
```typescript
const { id } = useParams()
const { t } = useLanguage()
const navigate = useNavigate()
const [order, setOrder] = useState<Order | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

For EditOrderPage, add form state and saving state:
```typescript
const [saving, setSaving] = useState(false)
const [saveError, setSaveError] = useState<string | null>(null)
const [formData, setFormData] = useState<Record<string, string>>({})
```

**Fetch-on-mount pattern** (OrderDetailPage.tsx lines 42–49):
```typescript
useEffect(() => {
  if (id) {
    getOrder(parseInt(id))
      .then(o => setOrder(o))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
}, [id])
```

EditOrderPage copies this exactly, then populates formData from the loaded order. Guard: if `order.status !== 'new'` treat as error (redirect to read-only detail).

**Loading state pattern** (OrderDetailPage.tsx lines 64–70):
```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-[var(--color-text-muted)]">{t('loading')}</p>
    </div>
  )
}
```

**Error state pattern** (OrderDetailPage.tsx lines 72–81):
```typescript
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
```

For EditOrderPage, `navigate` target is `/orders/${id}` (back to detail, not to list).

**Top action row pattern** (OrderDetailPage.tsx lines 88–99):
```tsx
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
```

For EditOrderPage, replace Delete button with Save Changes (primary) and cancel navigates to `/orders/${id}`:
```tsx
<div className="flex gap-2 mb-4">
  <button className={secondaryButtonClass + ' w-auto px-4'} onClick={() => navigate(`/orders/${id}`)}>
    {t('back')}
  </button>
  <button
    onClick={handleSave}
    disabled={saving}
    className={buttonClass + ' w-auto px-6'}
  >
    {saving ? '...' : t('save_changes')}
  </button>
</div>
```

**Card container pattern** (OrderDetailPage.tsx lines 102–112 and 114–121):
```tsx
<div className="bg-[var(--color-surface)] rounded-xl p-4 mb-4">
  {/* section content */}
</div>
```

Use one card per logical group: Client fields, Order Details. `FormField` wrapper from `FormField.tsx` for each editable input.

**FormField usage pattern** (FormField.tsx lines 11–24 and class exports lines 26–32):
```tsx
<FormField label={t('client_name')}>
  <input
    className={inputClass}
    type="text"
    value={formData.client_name_raw ?? ''}
    onChange={e => setFormData(f => ({ ...f, client_name_raw: e.target.value }))}
  />
</FormField>
```

Use `selectClass` for `jewelry_type` select, `inputClass` for all other fields.

**Save (async action) pattern** — modeled after `handleDelete` in OrderDetailPage.tsx lines 51–62:
```typescript
const handleSave = async () => {
  if (!order) return
  setSaving(true)
  setSaveError(null)
  try {
    await updateOrder({
      id: order.id,
      ...formData,
      price_to_client: formData.price_to_client ? parseFloat(formData.price_to_client) : undefined,
    })
    navigate(`/orders/${id}`)
  } catch (e: any) {
    setSaveError(e.message)
  } finally {
    setSaving(false)
  }
}
```

**Inline save error banner** (no analog — new pattern):
```tsx
{saveError && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
    <p className="text-sm text-red-400">{saveError || t('save_error')}</p>
  </div>
)}
```

Place this between the action row and the first card.

**Page wrapper pattern** (OrderDetailPage.tsx line 87):
```tsx
<div className="p-4 pb-24">
```

`pb-24` accounts for BottomNav height. Copy exactly.

---

### `src/pages/MyOrdersPage.tsx` (page, CRUD + client-side filter — MODIFY)

**Analog:** `src/pages/OrderDetailPage.tsx` (error/loading patterns); self for existing structure.

**New state to add** (after existing `loading` state, line 40):
```typescript
const [total, setTotal] = useState(0)
const [error, setError] = useState<string | null>(null)
const [searchText, setSearchText] = useState('')
const [statusFilter, setStatusFilter] = useState('all')
```

**Replace the current catch-swallowing fetch** (MyOrdersPage.tsx lines 46–48):

Current (line 46–48):
```typescript
getOrders(1, 200).then(res => {
  setOrders(res.orders || [])
}).catch(() => {}).finally(() => setLoading(false))
```

Replace with extracted `loadOrders` function (avoids Pitfall 5):
```typescript
const loadOrders = () => {
  setError(null)
  setLoading(true)
  getOrders(1, 200)
    .then(res => {
      setOrders(res.orders || [])
      setTotal(res.total || 0)
    })
    .catch(e => setError(e.message))
    .finally(() => setLoading(false))
}

useEffect(() => {
  if (!user) { setLoading(false); return }
  loadOrders()
}, [user])
```

**Derived filter values** (new, before return statement):
```typescript
const filteredOrders = orders.filter(o => {
  const matchesSearch = !searchText ||
    (o.order_number?.toLowerCase().includes(searchText.toLowerCase())) ||
    (o.client_name_raw || o.client_name || '').toLowerCase().includes(searchText.toLowerCase())
  const matchesStatus = statusFilter === 'all' || o.status === statusFilter
  return matchesSearch && matchesStatus
})
const isFiltered = searchText !== '' || statusFilter !== 'all'
```

**Error card pattern** — copy from OrderDetailPage.tsx lines 72–81, adapted for list-area replacement:
```tsx
{error && (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
    <p className="text-[var(--color-text-muted)] text-center mb-4">{t('orders_load_error')}</p>
    <button className={secondaryButtonClass + ' w-auto px-6'} onClick={loadOrders}>
      {t('retry')}
    </button>
  </div>
)}
```

Note: `secondaryButtonClass` must be imported — add to existing import from `'../components/FormField'`.

**Modified header row** (replacing MyOrdersPage.tsx lines 64–71):
```tsx
<div className="flex justify-between items-center mb-4">
  <h1 className="text-lg font-bold">{t('nav_orders')}</h1>
  <span className="text-xs text-[var(--color-text-muted)]">
    {isFiltered
      ? t('orders_filtered', { filtered: filteredOrders.length, total })
      : t('orders_count', { count: total })}
  </span>
  {user && (
    <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-1 rounded-lg">
      {user.prefix} · {user.name}
    </span>
  )}
</div>
```

**Search/filter bar** (new JSX, insert after header row and before showSample banner):
```tsx
<div className="flex gap-2 mb-4">
  <input
    className={inputClass + ' flex-1 min-h-[48px] text-sm'}
    type="text"
    placeholder={t('search_orders')}
    value={searchText}
    onChange={e => setSearchText(e.target.value)}
  />
  <select
    className={selectClass + ' w-auto min-h-[48px] text-sm'}
    value={statusFilter}
    onChange={e => setStatusFilter(e.target.value)}
  >
    <option value="all">{t('all_statuses')}</option>
    {Object.keys(STATUS_COLORS).map(s => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
</div>
```

`inputClass` and `selectClass` must be added to the FormField import. `STATUS_COLORS` is already defined at file top (line 8).

**List replacement** — change `displayOrders` to `filteredOrders` (or an appropriate derived list) in the `.map()` call:
```tsx
{!error && (
  <div className="space-y-3">
    {(showSample ? [SAMPLE_ORDER] : filteredOrders).map(order => (
      /* existing card JSX unchanged */
    ))}
    {!showSample && filteredOrders.length === 0 && orders.length > 0 && (
      <p className="text-center text-[var(--color-text-muted)] py-8 text-sm">{t('no_orders')}</p>
    )}
  </div>
)}
```

---

### `src/pages/OrderDetailPage.tsx` (page — MODIFY, add Edit button)

**Analog:** self — the Delete button pattern at lines 88–99.

**Add Edit button** — insert alongside Delete button in the existing action row (lines 88–99). Place after Delete:
```tsx
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
  {order.status === 'new' && (
    <button
      className={secondaryButtonClass + ' w-auto px-4'}
      onClick={() => navigate(`/orders/${order.id}/edit`)}
    >
      {t('edit_order')}
    </button>
  )}
</div>
```

The `secondaryButtonClass` import is already present (line 7). No new imports needed — `navigate` already destructured (line 36).

---

### `src/App.tsx` (config/router — MODIFY)

**Analog:** existing Route registrations (App.tsx lines 31–44).

**Import to add** (after line 13):
```typescript
import { EditOrderPage } from './pages/EditOrderPage'
```

**Route to add** — insert BEFORE the `/orders/:id` route (line 42), per react-router v6 specificity safety:
```tsx
<Route path="/orders/:id/edit" element={<EditOrderPage />} />
<Route path="/orders/:id" element={<OrderDetailPage />} />
```

No provider wrapping. No `WizardNavProvider` or `OrderFormProvider` — plain element, matching the pattern of `SettingsPage` (line 43).

Full modified Routes block for reference (App.tsx lines 31–44):
```tsx
<Route path="/orders" element={<MyOrdersPage />} />
<Route path="/orders/new" element={
  <OrderFormProvider>
    <NewOrderPage />
  </OrderFormProvider>
} />
<Route path="/orders/fix" element={
  <FixFormProvider>
    <FixOrderPage />
  </FixFormProvider>
} />
<Route path="/orders/:id/edit" element={<EditOrderPage />} />   {/* NEW — before :id */}
<Route path="/orders/:id" element={<OrderDetailPage />} />
<Route path="/settings" element={<SettingsPage />} />
<Route path="*" element={<Navigate to="/orders" replace />} />
```

---

### `C:\Dashboard\worker\src\routes\production.ts` (route handler — MODIFY)

**Analog:** `handleDeleteOrder` in the same file, lines 693–712.

**Current signature** (line 641):
```typescript
export async function handleUpdateOrder(request: Request, db: D1Database): Promise<Response>
```

**New signature** (add third `auth` param — identical to `handleDeleteOrder` line 693):
```typescript
export async function handleUpdateOrder(request: Request, db: D1Database, auth?: AuthContext): Promise<Response>
```

**AuthContext import** — already imported at the top of production.ts via the same security module used by `handleDeleteOrder`. Verify the import exists; if not, add:
```typescript
import type { AuthContext } from '../security/auth'
```

**Ownership check to insert** after the `if (!existing)` guard on line 646, and before the `updatable` array (line 652). Copy exactly from `handleDeleteOrder` lines 699–703, adapting to use `existing` (already fetched, no second query needed):

`handleDeleteOrder` pattern (lines 699–703):
```typescript
if (auth?.role === 'salesman') {
  const order = await db.prepare(
    'SELECT order_prefix, salesman_name FROM orders WHERE id = ?'
  ).bind(id).first<{ order_prefix: string; salesman_name: string }>();
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });
  const ownsOrder = order.order_prefix === auth.order_prefix ||
    order.salesman_name?.toLowerCase() === auth.name?.toLowerCase();
  if (!ownsOrder) return Response.json({ error: 'Forbidden: not your order' }, { status: 403 });
}
```

For `handleUpdateOrder`, `existing` is already fetched (line 645) and contains `order_prefix` and `salesman_name` — no extra query needed:
```typescript
// After: if (!existing) return Response.json({ error: 'Order not found' }, { status: 404 });
if (auth?.role === 'salesman') {
  const ownsOrder = existing.order_prefix === auth.order_prefix ||
    existing.salesman_name?.toLowerCase() === auth.name?.toLowerCase();
  if (!ownsOrder) return Response.json({ error: 'Forbidden: not your order' }, { status: 403 });
}
```

Optionally add status guard immediately after ownership check (defence in depth per RESEARCH open question 1):
```typescript
if (existing.status !== 'new') {
  return Response.json({ error: 'Forbidden: order is not editable' }, { status: 403 });
}
```

---

### `C:\Dashboard\worker\src\index.ts` (entry — MODIFY)

**Analog:** the `handleDeleteOrder` call on line 1243:
```typescript
return addCorsHeaders(await handleDeleteOrder(request, env.DB, auth), origin);
```

**Current call** (line 1240–1241):
```typescript
if (request.method === 'PUT')
  return addCorsHeaders(await handleUpdateOrder(request, env.DB), origin);
```

**Updated call** (add `auth` as third argument — identical pattern to DELETE line 1243):
```typescript
if (request.method === 'PUT')
  return addCorsHeaders(await handleUpdateOrder(request, env.DB, auth), origin);
```

No other changes in index.ts needed.

---

### `src/i18n/en.json`, `ru.json`, `he.json` (i18n config — MODIFY)

**Analog:** existing flat-key JSON structure. Existing interpolation pattern from en.json line 167:
```json
"order_created": "Order {number} has been created successfully."
```

**11 new keys to append** to all three files (at the end, before closing `}`):

**en.json additions:**
```json
"edit_order": "Edit Order",
"save_changes": "Save Changes",
"save_error": "Failed to save. Please try again.",
"description": "Description",
"comment": "Comment",
"search_orders": "Search orders...",
"all_statuses": "All statuses",
"orders_count": "{count} orders",
"orders_filtered": "{filtered} of {total}",
"orders_load_error": "Could not load orders. Check your connection and try again.",
"retry": "Retry"
```

**ru.json additions:**
```json
"edit_order": "Редактировать заказ",
"save_changes": "Сохранить изменения",
"save_error": "Не удалось сохранить. Попробуйте снова.",
"description": "Описание",
"comment": "Комментарий",
"search_orders": "Поиск заказов...",
"all_statuses": "Все статусы",
"orders_count": "{count} заказов",
"orders_filtered": "{filtered} из {total}",
"orders_load_error": "Не удалось загрузить заказы. Проверьте соединение и попробуйте снова.",
"retry": "Повторить"
```

**he.json additions:**
```json
"edit_order": "ערוך הזמנה",
"save_changes": "שמור שינויים",
"save_error": "שמירה נכשלה. נסה שוב.",
"description": "תיאור",
"comment": "הערה",
"search_orders": "חיפוש הזמנות...",
"all_statuses": "כל הסטטוסים",
"orders_count": "{count} הזמנות",
"orders_filtered": "{filtered} מתוך {total}",
"orders_load_error": "לא ניתן לטעון הזמנות. בדוק את החיבור ונסה שוב.",
"retry": "נסה שוב"
```

Note: `comment` key did not exist before (confirmed — en.json has `fix_comment` but no bare `comment`). `description` also new (only `fix_description` existed). Both are safe to add.

---

## Shared Patterns

### Loading State
**Source:** `src/pages/OrderDetailPage.tsx` lines 64–70
**Apply to:** `EditOrderPage` (new file)
```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-[var(--color-text-muted)]">{t('loading')}</p>
    </div>
  )
}
```

### Error State (full-screen)
**Source:** `src/pages/OrderDetailPage.tsx` lines 72–81
**Apply to:** `EditOrderPage` (if order not found or wrong status); `MyOrdersPage` error card (list-area only, not full-screen)
```tsx
<div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
  <p className="text-[var(--color-text-muted)]">{error || t('error')}</p>
  <button className={secondaryButtonClass + ' mt-4'} onClick={...}>
    {t('back')}
  </button>
</div>
```

### Form Field CSS Classes
**Source:** `src/components/FormField.tsx` lines 26–32
**Apply to:** `EditOrderPage` (all inputs), `MyOrdersPage` (search input + status select)
```typescript
export const inputClass = 'w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-[17px] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 min-h-[50px] transition-all shadow-sm'
export const selectClass = inputClass + ' appearance-none'
export const buttonClass = 'w-full bg-[var(--color-primary)] text-white font-semibold rounded-xl px-4 py-4 min-h-[52px] ...'
export const secondaryButtonClass = 'w-full bg-[var(--color-surface)] text-[var(--color-text)] font-medium rounded-xl px-4 py-3.5 min-h-[50px] ...'
```

All buttons/inputs meet the ≥48px touch target (Phase 2 requirement). Never hand-roll these classes.

### Ownership Check (Worker)
**Source:** `C:\Dashboard\worker\src\routes\production.ts` lines 699–703 (`handleDeleteOrder`)
**Apply to:** `handleUpdateOrder` in the same file
```typescript
if (auth?.role === 'salesman') {
  const ownsOrder = existing.order_prefix === auth.order_prefix ||
    existing.salesman_name?.toLowerCase() === auth.name?.toLowerCase();
  if (!ownsOrder) return Response.json({ error: 'Forbidden: not your order' }, { status: 403 });
}
```

### Auth Argument Pass-through (Worker entry)
**Source:** `C:\Dashboard\worker\src\index.ts` line 1243
**Apply to:** the PUT branch on line 1241
```typescript
return addCorsHeaders(await handleDeleteOrder(request, env.DB, auth), origin);
// → pattern for PUT:
return addCorsHeaders(await handleUpdateOrder(request, env.DB, auth), origin);
```

### i18n Translation Call
**Source:** usage throughout `src/pages/OrderDetailPage.tsx` and `src/pages/MyOrdersPage.tsx`
**Apply to:** `EditOrderPage` and all new UI strings
```typescript
const { t } = useLanguage()
t('key')                               // simple key
t('orders_count', { count: total })    // interpolation — {variable} in JSON value
```

---

## No Analog Found

None — all files have close analogs in the existing codebase.

---

## Metadata

**Analog search scope:** `src/pages/`, `src/components/`, `src/lib/`, `src/i18n/`, `C:\Dashboard\worker\src\routes\`, `C:\Dashboard\worker\src\index.ts`, `C:\Dashboard\worker\src\security\`
**Files read:** 9 source files
**Pattern extraction date:** 2026-04-21

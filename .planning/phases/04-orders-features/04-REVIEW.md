---
phase: 04-orders-features
reviewed: 2026-04-21T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - src/pages/EditOrderPage.tsx
  - src/pages/OrderDetailPage.tsx
  - src/pages/MyOrdersPage.tsx
  - src/App.tsx
  - src/i18n/en.json
  - src/i18n/ru.json
  - src/i18n/he.json
  - C:/Dashboard/worker/src/routes/production.ts
  - C:/Dashboard/worker/src/index.ts
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-04-21
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Reviewed the new orders features: `EditOrderPage`, `OrderDetailPage`, `MyOrdersPage`, routing in `App.tsx`, all three i18n files, and the worker's `production.ts` route handlers plus `index.ts` dispatch.

The server-side auth guards on update and delete are solid. The i18n files are complete and consistent across all three locales for every key used by the new pages. The route ordering in `App.tsx` is correct (static segments before `:id` param).

One critical issue was found: `handleGetOrder` uses an explicit column list that omits the migration-added columns `salesman_name`, `client_phone`, and `client_email`, so those fields are always missing from the detail view response even though the list endpoint returns them via `SELECT o.*`. Four warnings cover a missing status guard on delete, an uninformative error message on edit-guard, a stale-count display edge case, and a swallowed delete error. Three info items cover untranslated status labels, a stale sample date, and a raw `alert()` in production code.

---

## Critical Issues

### CR-01: `handleGetOrder` omits migration-added columns — `salesman_name`, `client_phone`, `client_email` always null in detail view

**File:** `C:/Dashboard/worker/src/routes/production.ts:541`

**Issue:** `handleGetOrder` uses a hardcoded `orderCols` string that was written before the `ALTER TABLE` migrations and does not include `salesman_name`, `client_phone`, or `client_email`. The list endpoint uses `SELECT o.*` so it returns them, but the detail endpoint never does. In `OrderDetailPage` the `salesman_name` row will always be blank, and `EditOrderPage` will always initialise `client_phone`/`client_email` as empty strings even when data exists on the record.

**Fix:** Add the three columns to the `orderCols` constant:

```typescript
const orderCols = 'id, order_number, order_prefix, order_type, order_date, client_id, ' +
  'client_name_raw, jeweller_id, jeweller_name_raw, description, model_code, jewelry_type, ' +
  'metal, size, main_stone_parcel, cat_claw, valigara_sku, barak_job_bag, barak_upid, ' +
  'buy_supply, buy_supply_cost, modelling_cost, print_3d_cost, certificate_cgl_price, ' +
  'jeweller_work_wage, paid_to_jeweller, price_to_client, deadline, status, comment, ' +
  'image_urls, source_sheet, created_at, updated_at, ' +
  'salesman_name, client_phone, client_email';  // ← add these three
```

---

## Warnings

### WR-01: `handleDeleteOrder` has no status guard — salesman can delete non-`new` orders

**File:** `C:/Dashboard/worker/src/routes/production.ts:706-725`

**Issue:** `handleUpdateOrder` correctly rejects edits when `status !== 'new'` (line 651), but `handleDeleteOrder` has no equivalent guard. A salesman who owns an order can delete it regardless of status — including orders that are `in_production` or `completed`. This is an authorization gap: the UI hides the Edit button for non-`new` orders, but there is no server-side equivalent for delete.

**Fix:** Fetch the order status in `handleDeleteOrder` and reject if not deletable:

```typescript
export async function handleDeleteOrder(request: Request, db: D1Database, auth?: AuthContext): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });

  const order = await db.prepare(
    'SELECT order_prefix, salesman_name, status FROM orders WHERE id = ?'
  ).bind(id).first<{ order_prefix: string; salesman_name: string; status: string }>();
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

  // Salesman ownership check
  if (auth?.role === 'salesman') {
    const ownsOrder = order.order_prefix === auth.order_prefix ||
      order.salesman_name?.toLowerCase() === auth.name?.toLowerCase();
    if (!ownsOrder) return Response.json({ error: 'Forbidden: not your order' }, { status: 403 });
  }

  // Status guard — only allow deleting orders still in 'new' state
  if (order.status !== 'new') {
    return Response.json({ error: 'Order cannot be deleted in current status' }, { status: 403 });
  }
  // ... rest of delete
```

---

### WR-02: `EditOrderPage` uses generic error key when status guard blocks edit

**File:** `src/pages/EditOrderPage.tsx:25-27`

**Issue:** When `getOrder` returns an order with `status !== 'new'`, the component calls `setError(t('error'))` which renders the generic "Something went wrong" message. The user has no way to know they are blocked because the order is already in production. The key `t('error')` is the catch-all network error, not a business-rule message.

**Fix:** Add a dedicated i18n key and use it:

```tsx
// In EditOrderPage.tsx, line 25:
if (o.status !== 'new') {
  setError(t('edit_not_allowed'))  // new key
} else {
```

Add to all three locale files:
```json
// en.json
"edit_not_allowed": "This order can no longer be edited (status: {status})."
// he.json
"edit_not_allowed": "לא ניתן לערוך הזמנה זו (סטטוס: {status})."
// ru.json
"edit_not_allowed": "Редактирование недоступно для этого заказа (статус: {status})."
```

---

### WR-03: `MyOrdersPage` order count display is wrong when total exceeds 200

**File:** `src/pages/MyOrdersPage.tsx:50, 90-92`

**Issue:** `getOrders(1, 200)` fetches at most 200 orders. The `total` state is set from `res.total` (the server's full count). When the server has, say, 350 orders, `total` = 350 but `orders` only holds 200. The header then shows "18 of 350" for a filtered result when only 200 were loaded — the denominator is misleading. More importantly, unfiltered it shows "200 orders" via the `orders_count` key when the server has 350. The count display uses `total` (correct for unfiltered), but the filter denominator should use `orders.length` (the loaded set), not `total`.

**Fix:** Change the filtered count label to reflect the loaded set as the denominator:

```tsx
// Line 91 — replace:
? t('orders_filtered', { filtered: String(filteredOrders.length), total: String(total) })
// With:
? t('orders_filtered', { filtered: String(filteredOrders.length), total: String(orders.length) })
```

This makes "18 of 200 (loaded)" accurate rather than implying "18 of 350 (all)".

---

### WR-04: `OrderDetailPage` delete error is swallowed silently with untranslated hardcoded string

**File:** `src/pages/OrderDetailPage.tsx:57-59`

**Issue:** The delete catch block calls `alert('Failed to delete')` — a hardcoded English string, bypassing i18n. This means Russian and Hebrew users see an English alert. Additionally, `alert()` is a blocking synchronous modal that is inappropriate in a mobile PWA context.

**Fix:** Use inline error state consistent with the rest of the page:

```tsx
// Add delete error state at top of component:
const [deleteError, setDeleteError] = useState<string | null>(null)

// In handleDelete catch:
} catch {
  setDeleteError(t('delete_error'))  // add key to all locale files
} finally {

// Render inline below the action row:
{deleteError && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
    <p className="text-sm text-red-400">{deleteError}</p>
  </div>
)}
```

Add to all locale files:
```json
"delete_error": "Failed to delete order. Please try again."
```

---

## Info

### IN-01: Status options in `MyOrdersPage` filter dropdown are not translated

**File:** `src/pages/MyOrdersPage.tsx:117-119`

**Issue:** The status `<select>` renders raw status keys (`new`, `in_production`, `on_hold`, etc.) directly as option labels. All other visible text is translated. These technical identifiers are shown to Hebrew and Russian users.

**Fix:** Add status label keys to the i18n files and use them:

```tsx
{Object.keys(STATUS_COLORS).map(s => (
  <option key={s} value={s}>{t(`status_${s}`) || s}</option>
))}
```

Add to all three locale files:
```json
"status_new": "New",
"status_received": "Received",
"status_in_production": "In Production",
"status_completed": "Completed",
"status_delivered": "Delivered",
"status_cancelled": "Cancelled",
"status_on_hold": "On Hold",
"status_paid": "Paid",
"status_sold": "Sold",
"status_in_stock": "In Stock"
```

Similarly, `OrderDetailPage` line 113 renders `order.status` raw in the badge. Same fix applies there.

---

### IN-02: `SAMPLE_ORDER.order_date` is computed once at module load, not per-render

**File:** `src/pages/MyOrdersPage.tsx:27`

**Issue:** `order_date: new Date().toISOString().split('T')[0]` runs when the module is first imported. In a long-lived SPA session this will be the date the app first loaded, not today's date. This is a cosmetic issue on the sample order only.

**Fix:** Convert `SAMPLE_ORDER` to a factory function, or compute the date inside the component:

```tsx
const getSampleOrder = (): Order => ({
  ...SAMPLE_ORDER_BASE,
  order_date: new Date().toISOString().split('T')[0],
})
// and use getSampleOrder() where SAMPLE_ORDER is referenced
```

---

### IN-03: `handleGetOrder` passes `id` query param as string to SQL `WHERE id = ?`

**File:** `C:/Dashboard/worker/src/routes/production.ts:545`

**Issue:** `url.searchParams.get('id')` returns a string (e.g. `"42"`). This string is passed directly to `.bind(id)` for `WHERE id = ?` on an `INTEGER PRIMARY KEY` column. D1/SQLite performs implicit coercion so it works today, but it is a type mismatch that is inconsistent with how the update and delete paths accept `body.id` (from JSON, already a number). If validation logic is added later it may break silently.

**Fix:** Parse the id before binding:

```typescript
const idRaw = url.searchParams.get('id');
const id = idRaw ? parseInt(idRaw, 10) : null;
if (!id || isNaN(id)) return Response.json({ error: 'id must be a valid integer' }, { status: 400 });
// ...
order = await db.prepare(`SELECT ${orderCols} FROM orders WHERE id = ?`).bind(id).first();
```

---

_Reviewed: 2026-04-21_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

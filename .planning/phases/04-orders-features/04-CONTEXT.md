# Phase 4: Orders Features - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Salespeople can find, edit, and understand the state of their orders without confusion.

Three requirements:
- **FEAT-01** — Edit UI for pending ("new") orders — salesperson can tap Edit on a pending order and update its details
- **FEAT-02** — My Orders shows total order count + search/filter bar
- **FEAT-03** — Error message when orders fail to load (not silent empty list)

</domain>

<decisions>
## Implementation Decisions

### FEAT-01 — Edit Order UI

- **D-01:** Edit is only available for orders with `status === 'new'`. Orders in any other status have no Edit button.
- **D-02:** Edit button appears in `OrderDetailPage` (top action row alongside Back/Delete). Tapping it navigates to a new route `/orders/:id/edit`.
- **D-03:** The edit screen is a **flat form** (not wizard reuse). Plain text/select fields — no multi-step flow needed for editing.
- **D-04:** **No client lookup** in the edit form. Client fields (name, phone, email) are editable as plain text inputs only.
- **D-05:** Worker `handleUpdateOrder` (`PUT /api/production/orders`) **must add ownership check**: salesman can only edit orders where `salesman_name` matches the JWT identity — same pattern as `handleDeleteOrder` in `production.ts:693`.

### FEAT-02 — Search/Filter in My Orders

- **D-06:** Search UI: one text input (searches client name + order number) + one status filter dropdown ("All statuses" default, then individual statuses). Both controls appear below the header, above the order list.
- **D-07:** Filtering is **client-side** — 200 orders already loaded into memory. No new API calls for search.
- **D-08:** Order count display: shows total when no filter active ("7 orders"), shows filtered count when active ("3 of 7"). Displayed near the header.

### FEAT-03 — Error State

- **D-09:** When `getOrders` throws, show an error card in place of the order list — same visual pattern as `OrderDetailPage` error state (centered text + back/retry button). Current `catch(() => {})` must be replaced with `catch(e => setError(e.message))`.
- **D-10:** Error state includes a **Retry** button that re-calls `getOrders` — same pattern as reloading.

### Claude's Discretion

- Which specific fields to include in the flat edit form: key fields are `client_name_raw`, `client_phone`, `client_email`, `jewelry_type`, `metal`, `size`, `description`, `main_stone_parcel`, `price_to_client`, `deadline`, `comment`. Planner picks what fits a clean mobile form.
- Edit form layout — sections or flat list — planner decides.
- New i18n keys needed for "edit", "save_changes", "edit_order" labels — planner adds to all three locale files.
- Route for edit page: `/orders/:id/edit` — planner registers in `App.tsx`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Files to Modify
- `src/pages/MyOrdersPage.tsx` — Add search/filter bar, count display, error state (FEAT-02, FEAT-03)
- `src/pages/OrderDetailPage.tsx` — Add Edit button (visible for `status === 'new'` only) (FEAT-01)
- `src/App.tsx` — Register new route `/orders/:id/edit`
- `C:\Dashboard\worker\src\routes\production.ts` — Add ownership check to `handleUpdateOrder` (line 641)
- `src/i18n/en.json`, `src/i18n/ru.json`, `src/i18n/he.json` — New keys for edit UI

### New Files to Create
- `src/pages/EditOrderPage.tsx` — Flat edit form page for pending orders

### Reference (read for patterns)
- `src/lib/api.ts` — `updateOrder` (PUT) already exists; `getOrders` returns `{ orders, total }`
- `src/pages/OrderDetailPage.tsx` — Error state pattern + Delete ownership model to follow
- `src/context/OrderFormContext.tsx` — Field names and types reference for edit form
- `src/lib/types.ts` — `Order` type and `OrderFormData` field mapping
- `C:\Dashboard\worker\src\routes\production.ts:693` — `handleDeleteOrder` ownership check pattern to copy for PUT
- `.planning/phases/02-mobile-ux-foundation/02-CONTEXT.md` — Touch target (≥48px) and BottomNav patterns from Phase 2
- `.planning/phases/03-wizard-polish/03-CONTEXT.md` — Tailwind patterns, i18n key conventions

No external ADRs or specs — requirements fully captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `OrderDetailPage` error state: `flex flex-col items-center justify-center min-h-[60vh]` with `secondaryButtonClass` — reuse for FEAT-03 error card in MyOrdersPage
- `secondaryButtonClass` from `components/FormField.tsx` — standard button style for Retry
- `getOrders(1, 200)` already returns `{ orders, total }` — `total` is available but unused today
- `STATUS_COLORS` record in `MyOrdersPage` — status labels already mapped; reuse for filter dropdown
- `updateOrder(data)` in `api.ts:80` — PUT endpoint already wired, accepts `id` + any updatable fields

### Established Patterns
- Error state: `catch(e => setError(e.message))` + `useState<string | null>(null)` for error — matches OrderDetailPage
- Touch targets: all interactive elements ≥48px height (established Phase 2)
- Translation: `t('key')` via `useLanguage()` — add new keys to all three JSON files
- CSS variables: `var(--color-surface)`, `var(--color-text-muted)`, `var(--color-border)` — use throughout

### Integration Points
- Edit route: `<Route path="/orders/:id/edit" element={<EditOrderPage />} />` in `App.tsx` — no provider wrapping needed (not a wizard)
- Edit navigates back to `/orders/:id` on save or cancel
- Ownership check in worker: pass `auth` to `handleUpdateOrder` (same as `handleDeleteOrder`) — requires adding `auth` parameter and checking `salesman_name`

</code_context>

<specifics>
## Specific Ideas

- Search input placeholder: use translated `t('search')` key
- Count label position: same row as "My Orders" heading, right-aligned (current salesman badge moves or stays)
- Error card: `⚠️` icon + translated error text + Retry button — no full-page takeover, just replaces order list area
- Edit page header: order number as title, Save Changes + Cancel buttons in top action row

</specifics>

<deferred>
## Deferred Ideas

- Client lookup in edit form (search by phone/TZ/name) — deferred; user confirmed plain text fields only for now

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-orders-features*
*Context gathered: 2026-04-21*

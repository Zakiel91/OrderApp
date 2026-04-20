---
phase: 04-orders-features
plan: "02"
subsystem: my-orders-ui
tags: [search, filter, error-state, retry, i18n, ux]
dependency_graph:
  requires: [04-01]
  provides: [my-orders-search-filter, my-orders-error-state, my-orders-count-label]
  affects: [MyOrdersPage]
tech_stack:
  added: []
  patterns: [client-side-filter, derived-state, error-card-retry, loadOrders-extracted-function]
key_files:
  created: []
  modified:
    - src/pages/MyOrdersPage.tsx
decisions:
  - "Both tasks implemented in a single file write — Task 1 (state/logic) and Task 2 (JSX) combined because MyOrdersPage is small and splitting would require two reads of the same file"
  - "t() accepts Record<string, string> — numeric values for orders_count/orders_filtered converted via String() to satisfy TypeScript signature"
  - "showSample guard updated to exclude error state — when error is set, sample order is not shown even if orders array is empty"
metrics:
  duration: "~4 minutes"
  completed: "2026-04-21"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
  files_created: 0
---

# Phase 4 Plan 02: Search/Filter Bar and Error State Summary

**One-liner:** MyOrdersPage enhanced with client-side search/filter bar, order count label switching between total/filtered formats, and error card with Retry button replacing the silent empty-catch pattern.

## Tasks Completed

| # | Name | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Add loadOrders function, error state, and total state | `3b46737` | MyOrdersPage.tsx |
| 2 | Add search/filter bar and count label to JSX | `3b46737` | MyOrdersPage.tsx |

## What Was Built

### loadOrders Function (FEAT-03)
- Extracted from inline `getOrders().then().catch(() => {})` into a named `loadOrders()` function
- Old silent catch `catch(() => {})` replaced with `catch(e => setError(...))`
- Error state: `useState<string | null>(null)` — matches OrderDetailPage pattern
- `total` state: `useState(0)` — captures `res.total` from API response (was previously unused)
- `handleRetry` calls `loadOrders()` — single user-initiated retry, no loop

### Error Card (FEAT-03)
- Rendered when `error` is truthy, replacing the order list area
- Pattern matches OrderDetailPage: `flex flex-col items-center justify-center min-h-[60vh] p-6`
- Uses `t('orders_load_error')` + `secondaryButtonClass` Retry button
- Header row and search/filter bar remain visible above error card

### Search/Filter Bar (FEAT-02)
- Text input: searches `order_number` and `client_name_raw || client_name` case-insensitively
- Status dropdown: keys from `STATUS_COLORS` record (already defined in file) — no new data needed
- Both controls: `min-h-[48px]` touch target (UX-03 compliant) + `aria-label` for accessibility
- `filteredOrders` derived value: `orders.filter(...)` — pure client-side, no API calls
- `isFiltered` flag: `searchText !== '' || statusFilter !== 'all'`

### Count Label (FEAT-02)
- Position: inline in header row between h1 and salesman badge
- Without filter: `t('orders_count', { count: String(total) })` — uses `res.total` from API
- With active filter: `t('orders_filtered', { filtered: String(filteredOrders.length), total: String(total) })`
- i18n keys were added in plan 04-01 — no new keys needed here

### Empty Filter Message
- When `filteredOrders.length === 0 && orders.length > 0` (search matched nothing): shows `t('no_orders')` message
- Not shown when error card is active (`!error` guard on list block)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] t() type mismatch — numbers passed to string-only Record**
- **Found during:** Task 1 TypeScript build check
- **Issue:** `t('orders_filtered', { filtered: filteredOrders.length, total })` — `t()` signature is `Record<string, string>` but `filteredOrders.length` and `total` are numbers
- **Fix:** Wrapped numeric values with `String()`: `{ filtered: String(filteredOrders.length), total: String(total) }` and `{ count: String(total) }`
- **Files modified:** `src/pages/MyOrdersPage.tsx`
- **Commit:** `3b46737`

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. Filter operates entirely on already-loaded data within the authenticated user's own session.

| Threat ID | Status | Location |
|-----------|--------|----------|
| T-4-04 | Accepted | Client-side filter on salesman-scoped data — no new exposure |
| T-4-05 | Accepted | Single user-triggered retry — no loop or unbounded retries |

## Self-Check: PASSED

- `src/pages/MyOrdersPage.tsx` — file exists and contains all required patterns
- Commit `3b46737` — verified in git log
- `npm run build` — completed with 0 TypeScript errors, 62 modules transformed

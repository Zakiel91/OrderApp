---
phase: 04-orders-features
plan: "01"
subsystem: worker-security, edit-order-ui, i18n
tags: [security, auth, edit-order, i18n, route]
dependency_graph:
  requires: []
  provides: [edit-order-endpoint-security, EditOrderPage, edit-order-route, i18n-phase4-keys]
  affects: [worker-production-route, OrderDetailPage, App-routes]
tech_stack:
  added: []
  patterns: [ownership-check, status-guard, flat-edit-form, inline-error-banner]
key_files:
  created:
    - src/pages/EditOrderPage.tsx
  modified:
    - C:/Dashboard/worker/src/routes/production.ts
    - C:/Dashboard/worker/src/index.ts
    - src/i18n/en.json
    - src/i18n/ru.json
    - src/i18n/he.json
    - src/pages/OrderDetailPage.tsx
    - src/App.tsx
decisions:
  - "AuthContext import added to production.ts (was missing, caused pre-existing TS errors on handleListOrders and handleDeleteOrder lines)"
  - "salesman_name added to handleUpdateOrder SELECT query to enable ownership check without second DB query"
  - "status check placed before ownership check so non-new orders are rejected before identity evaluation"
metrics:
  duration: "277 seconds (~5 minutes)"
  completed: "2026-04-21"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 7
  files_created: 1
---

# Phase 4 Plan 01: Edit Order End-to-End Summary

**One-liner:** Worker PUT endpoint hardened with ownership + status guards; EditOrderPage flat form for status=new orders; Edit button conditional on status; 11 i18n keys added to all 3 locales.

## Tasks Completed

| # | Name | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Harden worker — auth param, ownership + status checks | `1b8745a` (worker repo) | production.ts, index.ts |
| 2 | Add 11 i18n keys to all three locale files | `c37195a` | en.json, ru.json, he.json |
| 3 | Create EditOrderPage and wire route + Edit button | `6623dd8` | EditOrderPage.tsx, OrderDetailPage.tsx, App.tsx |

## What Was Built

### Worker Security (T-4-01, T-4-02, T-4-03)
- `handleUpdateOrder` in `production.ts` now accepts `auth?: AuthContext` as third parameter
- Status guard added first: `if (existing.status !== 'new') return 403` — defence in depth, independent of client UI
- Ownership check added: salesman can only edit orders where `order_prefix` or `salesman_name` matches JWT identity (same pattern as `handleDeleteOrder`)
- `index.ts` updated to pass `auth` as third argument: `handleUpdateOrder(request, env.DB, auth)`

### i18n (11 new keys)
All three locale files (en.json, ru.json, he.json) now contain: `edit_order`, `save_changes`, `save_error`, `description`, `comment`, `search_orders`, `all_statuses`, `orders_count`, `orders_filtered`, `orders_load_error`, `retry`

### EditOrderPage
- Route `/orders/:id/edit` registered in App.tsx before `/orders/:id`
- Pre-populates 11 fields from existing order data
- `o.status !== 'new'` guard in useEffect shows error state (not crash) for non-new orders
- `price_to_client` converted string→float on submit, undefined if empty
- Inline save error banner below action row on failure
- Cancel/Back navigates to `/orders/:id` without saving

### OrderDetailPage
- Edit button added to top action row, conditional on `order.status === 'new'`
- Navigates to `/orders/${order.id}/edit`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Missing AuthContext import in production.ts**
- **Found during:** Task 1 TypeScript compilation check
- **Issue:** `AuthContext` was used in `handleListOrders` (line 435) and `handleDeleteOrder` (line 704) without being imported — pre-existing TS errors that were masked because the file was not being compiled standalone
- **Fix:** Added `import type { AuthContext } from '../security/auth';` at top of production.ts
- **Files modified:** `C:/Dashboard/worker/src/routes/production.ts`
- **Commit:** `1b8745a`

**2. [Rule 1 - Bug] handleUpdateOrder SELECT missing salesman_name column**
- **Found during:** Task 1 implementation review
- **Issue:** The existing SELECT query did not include `salesman_name`, which is required for the ownership check pattern
- **Fix:** Added `salesman_name` to the SELECT column list so the existing `existing` object has the needed field without a second DB query
- **Files modified:** `C:/Dashboard/worker/src/routes/production.ts`
- **Commit:** `1b8745a`

### Pre-existing Issue (Deferred, Out of Scope)

`C:/Dashboard/worker/src/index.ts:654` — `TS2322: Type 'ArrayBufferLike' is not assignable to type 'ArrayBuffer | null'` in email parsing code. Not caused by this plan's changes. Logged to deferred-items.

## Threat Surface Scan

All threats from the plan's `<threat_model>` are mitigated:

| Threat ID | Status | Location |
|-----------|--------|----------|
| T-4-01 | Mitigated | production.ts handleUpdateOrder — ownership check |
| T-4-02 | Mitigated | production.ts handleUpdateOrder — status guard |
| T-4-03 | Mitigated | index.ts — auth passed as third arg |

No new threat surface introduced.

## Self-Check: PASSED

---
phase: 04-orders-features
fixed_at: 2026-04-20T23:43:39Z
review_path: .planning/phases/04-orders-features/04-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 04: Code Review Fix Report

**Fixed at:** 2026-04-20T23:43:39Z
**Source review:** .planning/phases/04-orders-features/04-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5 (1 Critical + 4 Warnings)
- Fixed: 5
- Skipped: 0

## Fixed Issues

### CR-01: handleGetOrder omits migration-added columns

**Files modified:** `C:/Dashboard/worker/src/routes/production.ts`
**Commit:** 939c549
**Applied fix:** Appended `salesman_name, client_phone, client_email` to the `orderCols` constant in `handleGetOrder`. These three columns were added by ALTER TABLE migrations after the original `orderCols` string was written, so the detail endpoint was always returning null for them even though the data existed on the row. The list endpoint already returned them via `SELECT o.*`.

---

### WR-01: handleDeleteOrder missing status guard

**Files modified:** `C:/Dashboard/worker/src/routes/production.ts`
**Commit:** 7baa737
**Applied fix:** Refactored `handleDeleteOrder` to always fetch the order row first (selecting `order_prefix, salesman_name, status`), moved the salesman ownership check to use that result, and added a new status guard that returns HTTP 403 with `"Order cannot be deleted in current status"` when `status !== 'new'`. This mirrors the existing guard in `handleUpdateOrder`.

---

### WR-02: EditOrderPage shows generic error when status guard fires

**Files modified:** `src/pages/EditOrderPage.tsx`, `src/i18n/en.json`, `src/i18n/he.json`, `src/i18n/ru.json`
**Commit:** ec7fdcd
**Applied fix:** Changed `setError(t('error'))` to `setError(t('edit_not_allowed'))` on the status guard branch in `EditOrderPage`. Added the new key to all three locale files:
- en: `"This order can no longer be edited (status: {status})."`
- he: `"לא ניתן לערוך הזמנה זו (סטטוס: {status})."`
- ru: `"Редактирование недоступно для этого заказа (статус: {status})."`
Also added `delete_error` key to all three locale files in this same commit (used by WR-04 fix).

---

### WR-03: MyOrdersPage filtered count shows server total as denominator

**Files modified:** `src/pages/MyOrdersPage.tsx`
**Commit:** e093904
**Applied fix:** Changed the `orders_filtered` call from `String(total)` to `String(orders.length)` as the denominator. When fewer than all server records are loaded (page size capped at 200), the filtered count now correctly shows "18 of 200 (loaded)" rather than the misleading "18 of 350 (all server records)".

---

### WR-04: OrderDetailPage delete error uses alert() with hardcoded English string

**Files modified:** `src/pages/OrderDetailPage.tsx`
**Commit:** bb1fbba
**Applied fix:** Added `deleteError` state (`useState<string | null>(null)`), replaced `alert('Failed to delete')` in the catch block with `setDeleteError(t('delete_error'))`, and added an inline red error banner rendered below the action row buttons. The `delete_error` i18n key was already added to all three locale files as part of the WR-02 commit.

---

_Fixed: 2026-04-20T23:43:39Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_

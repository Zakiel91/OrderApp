---
phase: 05-order-detail-redesign
plan: "03"
subsystem: frontend-pages
tags: [ios-design, tabs, bottom-sheet, inline-editing, sticky-header, tailwind, rtl]

dependency_graph:
  requires:
    - "05-01 — iOS CSS tokens (--color-ios-bg, --shadow-sm, --radius-lg, --color-separator)"
    - "05-02 — FieldEditSheet component (bottom sheet with slideUp animation)"
  provides:
    - "OrderDetailPage — fully rewritten iPhone-native order detail page"
    - "sticky header: order number (20px bold), status pill, WhatsApp/Edit/Delete quick actions"
    - "4-tab layout: Client / Item / Payment / Notes"
    - "tap-to-edit via FieldEditSheet (status === new guard)"
    - "handleFieldSave with updateOrder (PUT) + parseFloat for numeric fields"
    - "success toast (2s auto-hide) after each field save"
  affects: []

tech_stack:
  added: []
  patterns:
    - "sticky header + sticky tab bar stacked (top: 0 / top: 96px)"
    - "activeTab state drives conditional tab panel rendering"
    - "openSheet guard: returns early if order.status !== 'new'"
    - "handleFieldSave: optimistic local state update + server PUT + toast"
    - "FieldRow helper component (internal, not exported) — renders null when value empty"
    - "parseFloat conversion for price_to_client and advance_amount before PUT"

key_files:
  created: []
  modified:
    - src/pages/OrderDetailPage.tsx
    - src/lib/types.ts

key_decisions:
  - "isEditable derived from order.status === 'new' — controls chevrons and openSheet access"
  - "FieldRow returns null for empty/undefined values — no empty rows cluttering the UI"
  - "Tab bar sticky top set to 96px to stack directly under sticky header"
  - "advance_amount, advance_method, special_instructions added to Order interface (were missing, blocking TypeScript compilation)"

patterns-established:
  - "Tab content pattern: activeTab === 'X' → <div card><FieldRow .../></div>"
  - "Sheet state shape: { field, label, value, type? } | null"

requirements-completed:
  - DET-01
  - DET-02
  - DET-03
  - DET-04

duration: "20min"
completed: "2026-04-26"
---

# Phase 5 Plan 03: OrderDetailPage Redesign Summary

**Fully rewritten OrderDetailPage with sticky header + 4-tab layout + tap-to-edit via FieldEditSheet bottom sheet — all 4 DET requirements delivered.**

---

## Performance

- **Duration:** ~20 min (including human-verify checkpoint)
- **Started:** 2026-04-26T04:00:00Z
- **Completed:** 2026-04-26T06:45:29Z
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint, approved)
- **Files modified:** 2

---

## Accomplishments

- Replaced the flat read-only order detail view with an iPhone-native layout matching the sketch design validated in Phase 5 planning
- Sticky header stays visible on scroll: order number (20px bold), status pill, and WhatsApp/Edit/Delete quick-action buttons
- 4-tab content layout (Client / Item / Payment / Notes) eliminates the single long scroll
- Tap any editable field (status === 'new' only) to open FieldEditSheet bottom sheet; Save calls `updateOrder` (PUT), updates local state, and shows 2-second success toast
- TypeScript compilation fixed by adding three missing fields to the Order interface

---

## Task Commits

1. **Task 1: Rewrite OrderDetailPage — sticky header + tabs + FieldEditSheet** — `3cad9f1` (feat)
2. **Task 2: human-verify checkpoint** — approved by user (no commit; visual verification only)

---

## Files Created/Modified

- `src/pages/OrderDetailPage.tsx` — fully rewritten with sticky header, 4 tabs, FieldEditSheet integration, handleFieldSave, success toast, isEditable guard, FieldRow helper, isFix logic preserved
- `src/lib/types.ts` — added `advance_amount?: number`, `advance_method?: string`, `special_instructions?: string` to Order interface

---

## Decisions Made

- `isEditable` derived from `order.status === 'new'` — single source of truth for chevron display and openSheet guard
- `FieldRow` returns `null` when value is empty/undefined — keeps tabs clean with no blank rows
- Tab bar sticky `top: 96px` stacks directly below sticky header without overlap
- `parseFloat` applied before PUT for `price_to_client` and `advance_amount` — matches server expectation for numeric columns

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added missing fields to Order interface in types.ts**
- **Found during:** Task 1 (rewriting OrderDetailPage.tsx)
- **Issue:** `advance_amount`, `advance_method`, and `special_instructions` were referenced in the new Payment and Notes tab panels but were absent from the `Order` interface, causing TypeScript compilation errors
- **Fix:** Added the three optional fields to the `Order` interface in `src/lib/types.ts`
- **Files modified:** `src/lib/types.ts`
- **Verification:** `npm run build` completed without TypeScript errors
- **Committed in:** 3cad9f1 (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in type definitions)
**Impact on plan:** Required for TypeScript compilation; no scope creep.

---

## Issues Encountered

None beyond the Rule 1 auto-fix above.

---

## User Setup Required

None — no external service configuration required.

---

## Known Stubs

None — all fields are wired to real API data from `getOrder`. No placeholder or hardcoded values in the rendered UI.

---

## Threat Flags

None — this plan introduces no new network endpoints or trust boundaries beyond what was already analysed in the plan's threat model (T-05-03-01 through T-05-03-05 all mitigated as designed).

---

## Next Phase Readiness

Phase 5 is now complete. All 4 DET requirements (DET-01, DET-02, DET-03, DET-04) delivered across plans 05-01, 05-02, and 05-03.

The milestone "Order Detail Redesign" is ready for closure. No blockers.

---

## Self-Check: PASSED

- `src/pages/OrderDetailPage.tsx` modified — confirmed (248 lines added in commit 3cad9f1)
- `src/lib/types.ts` modified — confirmed (4 lines added in commit 3cad9f1)
- Commit 3cad9f1 exists — confirmed via `git log --oneline`
- `npm run build` passed without errors — confirmed before human-verify checkpoint
- Human-verify checkpoint approved by user

---

*Phase: 05-order-detail-redesign*
*Completed: 2026-04-26*

---
phase: 02-mobile-ux-foundation
plan: "02"
subsystem: ui
tags: [wizard, bottom-nav, scroll-reset, react, context]

requires:
  - phase: 02-mobile-ux-foundation/02-01
    provides: [WizardNavContext, submitHandler-registration]

provides:
  - BottomNav in wizard mode with Back/Next/Submit buttons
  - Scroll reset on step change in NewOrderPage and FixOrderPage
  - Inline navigation buttons removed from both page components

affects: [NewOrderPage, FixOrderPage, BottomNav]

tech-stack:
  added: []
  patterns:
    - useRef isFirstRender guard for scroll reset (skip initial mount)
    - BottomNav reads WizardNavContext to switch between tab mode and wizard mode

key-files:
  created: []
  modified:
    - src/components/BottomNav.tsx
    - src/pages/NewOrderPage.tsx
    - src/pages/FixOrderPage.tsx

key-decisions:
  - "isWizard detection by pathname — BottomNav renders wizard mode only on /orders/new and /orders/fix"
  - "isFirstRender useRef guard prevents scrollTo(0,0) on initial page mount"
  - "submitting state lives in BottomNav (not in context) — local Promise.finally pattern"
  - "Back button disabled during submit — prevents navigation mid-request"

patterns-established:
  - "isFirstRender useRef: skip first useEffect run to avoid side-effects on mount"
  - "wizard mode guard: isWizard && state — protects against null state before wizard provider mounts"

requirements-completed:
  - UX-01
  - UX-06

duration: ~10min
completed: 2026-04-20
---

# Phase 2 Plan 02: BottomNav Wizard Mode + Scroll Reset Summary

**BottomNav switches to Back/Next/Submit wizard controls on /orders/new and /orders/fix via WizardNavContext; both pages scroll to top on step change and inline navigation buttons removed.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-20T00:00:00Z
- **Completed:** 2026-04-20T00:10:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- BottomNav detects wizard routes and renders Back/Next/Submit instead of tab bar
- Submit button calls `submitHandler` from WizardNavContext with local loading state and double-submit protection
- `window.scrollTo(0, 0)` fires on every step change in both NewOrderPage and FixOrderPage (skipped on initial mount via `useRef` guard)
- Inline Back/Next button blocks deleted from both page components — navigation is now exclusively in BottomNav

## Task Commits

1. **Task 1: BottomNav wizard mode** - `e3cc8b5` (feat)
2. **Task 2: Scroll reset + remove inline buttons** - `978593d` (feat)

## Files Created/Modified

- `src/components/BottomNav.tsx` — wizard mode added: Back (hidden step 1), Next, Submit (last step); standard tab mode unchanged
- `src/pages/NewOrderPage.tsx` — inline Back/Next removed, `useRef` + `useEffect([step])` scroll reset added, unused imports cleaned
- `src/pages/FixOrderPage.tsx` — same as NewOrderPage: inline buttons removed, scroll reset added, unused imports cleaned

## Decisions Made

- `isWizard && state` double guard: `isWizard` prevents flash of wizard UI during route transitions; `state` null-guards before the wizard provider mounts
- `isFirstRender` ref pattern chosen over checking `step === initialStep` — simpler and correct for any starting step value
- `submitting` state is local to BottomNav (not pushed into context) — BottomNav owns the Promise lifecycle since it owns the button

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `useLanguage` import from both page components**
- **Found during:** Task 2 (write phase)
- **Issue:** After deleting inline button blocks that used `t('back')` and `t('next')`, the `useLanguage` import and `t` destructuring became unused — TypeScript would error on build
- **Fix:** Removed `import { useLanguage }` and `const { t } = useLanguage()` from both NewOrderPage.tsx and FixOrderPage.tsx
- **Files modified:** `src/pages/NewOrderPage.tsx`, `src/pages/FixOrderPage.tsx`
- **Verification:** `npm run build` passes with 0 TypeScript errors
- **Committed in:** `978593d` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — unused import cleanup)
**Impact on plan:** Minor cleanup required by removing inline buttons. No scope creep.

## Issues Encountered

None — plan executed cleanly. Build passed on first attempt for both tasks.

## Known Stubs

None — BottomNav wizard mode is fully wired to WizardNavContext. `submitHandler` calls the real API handler registered in Plan 01.

## Threat Flags

No new network endpoints, auth paths, file access patterns, or schema changes introduced. All three STRIDE threats (T-02-04, T-02-05, T-02-06) assessed as `accept` per plan threat model.

## Next Phase Readiness

- UX-01 (scroll reset) and UX-06 (fixed bottom navigation) are fully implemented
- BottomNav wizard mode is ready for visual verification on mobile
- Remaining phase 02 work: touch targets (UX-03), draft saved indicator (UX-04), step indicator (UX-02)

---

## Self-Check: PASSED

Files confirmed present:
- `src/components/BottomNav.tsx` — contains `isWizard`, `useWizardNav`, `submit_order`
- `src/pages/NewOrderPage.tsx` — contains `window.scrollTo`, `isFirstRender`, no `buttonClass`
- `src/pages/FixOrderPage.tsx` — contains `window.scrollTo`, `isFirstRender`, no `buttonClass`

Commits confirmed in git log:
- `e3cc8b5`: feat(02-02): BottomNav wizard mode
- `978593d`: feat(02-02): scroll reset + remove inline buttons

---
*Phase: 02-mobile-ux-foundation*
*Completed: 2026-04-20*

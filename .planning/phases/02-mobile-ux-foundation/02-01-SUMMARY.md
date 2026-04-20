---
phase: 02-mobile-ux-foundation
plan: "01"
subsystem: wizard-nav-context
tags: [context, wizard, submit-handler, bottom-nav]
dependency_graph:
  requires: []
  provides: [WizardNavContext, submitHandler-registration]
  affects: [src/components/BottomNav.tsx]
tech_stack:
  added: [WizardNavContext pattern]
  patterns: [callback-registration, context-bridge]
key_files:
  created:
    - src/context/WizardNavContext.tsx
  modified:
    - src/context/OrderFormContext.tsx
    - src/context/FixFormContext.tsx
    - src/steps/Step6Review.tsx
    - src/fix-steps/FixStep3Review.tsx
    - src/App.tsx
decisions:
  - WizardNavContext as lightweight bridge — OrderFormContext/FixFormContext sync into it via useEffect; BottomNav reads from it without being inside the wizard providers
  - registerSubmitHandler uses setState(() => fn) arrow wrapper to prevent React treating the function as an updater
  - submitting state removed from review steps — BottomNav will manage its own loading state when calling submitHandler (Plan 02)
metrics:
  duration: "~15 minutes"
  completed: "2026-04-20"
  tasks_completed: 2
  files_changed: 6
---

# Phase 2 Plan 01: WizardNavContext — Submit Handler Bridge Summary

**One-liner:** WizardNavContext bridge lets BottomNav access wizard step state and submit handler without being inside OrderFormProvider or FixFormProvider.

---

## What Was Built

A three-layer connection between wizard pages and BottomNav:

1. **WizardNavContext** (`src/context/WizardNavContext.tsx`) — new standalone provider wrapping AppRoutes. Holds `WizardNavState | null` (step, totalSteps, setStep, submitHandler, submitting). Exposes `useWizardNav()` hook.

2. **Context sync** — `OrderFormProvider` and `FixFormProvider` each call `useWizardNav().setWizardState(...)` in a `useEffect` that runs on `step`, `submitHandler` changes. On unmount, they reset state to `null`.

3. **Submit registration** — `Step6Review` and `FixStep3Review` each declare `handleSubmit` as a `useCallback` and register it into their respective context via `registerSubmitHandler`. A cleanup effect calls `registerSubmitHandler(null)` on unmount. The inline Submit buttons were removed from both steps — BottomNav will surface them (Plan 02).

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create WizardNavContext + extend contexts | 6fb3924 | WizardNavContext.tsx, OrderFormContext.tsx, FixFormContext.tsx |
| 2 | Register handleSubmit + wrap AppRoutes | 24470f1 | Step6Review.tsx, FixStep3Review.tsx, App.tsx |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `submitting` state from review steps**
- **Found during:** Task 2 build verification
- **Issue:** After removing the inline Submit buttons, the `submitting` / `setSubmitting` state variables became unused, causing TypeScript errors TS6133
- **Fix:** Removed `const [submitting, setSubmitting] = useState(false)` and the corresponding `setSubmitting(true)` / `setSubmitting(false)` calls from both `Step6Review.tsx` and `FixStep3Review.tsx`
- **Files modified:** `src/steps/Step6Review.tsx`, `src/fix-steps/FixStep3Review.tsx`
- **Commit:** 24470f1 (included in Task 2 commit)
- **Note:** Plan 02 (BottomNav wizard mode) will manage its own loading state via a local `useState` when calling `submitHandler` as a Promise

---

## Known Stubs

None — `submitHandler` is wired end-to-end. The handler registered in WizardNavContext is the real API-calling function from the review steps. The only missing piece (BottomNav reading and calling it) is intentionally deferred to Plan 02.

---

## Threat Flags

No new network endpoints, auth paths, file access patterns, or schema changes introduced. Threat model assessment: LOW — same API calls, same JWT, same payload. Only the call site moves from an inline button to BottomNav.

---

## Self-Check: PASSED

All 6 files confirmed present on disk. Both task commits confirmed in git log:
- 6fb3924: Task 1 (WizardNavContext + context extensions)
- 24470f1: Task 2 (review step registration + App.tsx wrapper)

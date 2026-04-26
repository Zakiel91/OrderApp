---
phase: 05-order-detail-redesign
fixed_on: 2026-04-26T00:00:00Z
fix_scope: critical_warning
findings_in_scope: 5
fixed: 5
skipped: 0
iteration: 1
status: all_fixed
---

# Phase 05: Code Review Fix Report

**Fixed at:** 2026-04-26
**Source review:** `.planning/phases/05-order-detail-redesign/05-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 5
- Fixed: 5
- Skipped: 0

## Fixed Issues

### WR-01: Save errors are silently swallowed — user gets no feedback on failure

**Files modified:** `src/pages/OrderDetailPage.tsx`
**Commit:** 06dbc61
**Applied fix:**
- Added `import { useEffect, useRef, useState }` (useRef was needed for WR-03 too, added here).
- Added `const [saveError, setSaveError] = useState<string | null>(null)` state.
- Changed `handleFieldSave` to call `setSaveError(null)` at the start of each save attempt.
- Added `catch { setSaveError(t('save_error')) }` block so network/API failures surface to the user.
- Added a save error banner (matching the existing delete error banner style) below the delete error banner in the JSX.
- Sheet stays open on error (correct retry UX); only closes on success.

### WR-02: WhatsApp URL built from unvalidated server-supplied phone number

**Files modified:** `src/pages/OrderDetailPage.tsx`
**Commit:** efdd5b2
**Applied fix:**
- Replaced `order.client_phone!.replace(/\D/g, '')` with `(order.client_phone ?? '').replace(/\D/g, '')` — eliminates the non-null assertion.
- Added a length guard (`digits.length >= 7`) before calling `window.open` — an empty or too-short string never opens a URL.
- Added `'noopener,noreferrer'` as the third argument to `window.open` — best practice for external URLs derived from user data.

### WR-03: Tab bar sticky offset is a hardcoded pixel value

**Files modified:** `src/pages/OrderDetailPage.tsx`
**Commit:** 14f2892
**Applied fix:**
- Added `const headerRef = useRef<HTMLDivElement>(null)` and `const [headerHeight, setHeaderHeight] = useState(96)`.
- Added a `useEffect` that attaches a `ResizeObserver` to `headerRef.current`, updating `headerHeight` whenever the header's `contentRect.height` changes. Cleanup disconnects the observer on unmount.
- Added `ref={headerRef}` to the sticky header `<div>`.
- Replaced `top: 96` in the tab bar `style` with `top: headerHeight` — the tab bar now tracks the actual rendered header height on every device and viewport.

### WR-04: FieldEditSheet input is always right-aligned, breaking LTR users

**Files modified:** `src/components/FieldEditSheet.tsx`
**Commit:** ac1f28c
**Applied fix:**
- Removed `textAlign: 'right'` from the input's inline `style` object.
- The `[dir="rtl"] { text-align: right }` rule already present in `src/index.css` handles RTL alignment. LTR users (English, Russian) now get natural left-aligned input text.

### WR-05: Non-editable tappable rows give no feedback — silently blocked

**Files modified:** `src/pages/OrderDetailPage.tsx`
**Commit:** b812063
**Applied fix:**
- Added a two-line comment above the `if (order?.status !== 'new') return` guard in `openSheet` explaining that the guard is intentional defense-in-depth.
- The existing `editable={isEditable}` prop on `FieldRow` already prevents the tap from firing when the order is not editable; the internal guard in `openSheet` is kept as a safety net for future callers.
- No behavioural change — purely a documentation fix to eliminate the code-smell ambiguity noted in the review.

## Skipped Issues

None — all 5 in-scope warnings were successfully fixed.

---

_Fixed: 2026-04-26_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_

# Phase 2: Mobile UX Foundation - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Make wizard navigation feel natural on a phone: scroll resets on step change, Back/Next are always visible, all tappable controls meet 48px touch target standard.

Requirements: UX-01 (scroll reset), UX-03 (tap targets ≥ 48px), UX-06 (fixed nav buttons).

</domain>

<decisions>
## Implementation Decisions

### UX-06 — Wizard Navigation Buttons

- **D-01:** While a wizard is open (`/orders/new` or `/orders/fix`), `BottomNav` replaces its tab icons with Back/Next wizard controls. The BottomNav tab bar is NOT shown during wizard flow — Back/Next take its place.
- **D-02:** On the last wizard step (Step 6 Review for New Order, Step 3 Review for Fix Order): BottomNav shows `[← Back]` and `[✓ Submit]`. The Submit action currently lives in `Step6Review.tsx` / `FixStep3Review.tsx` — it must be surfaced to BottomNav (planner to decide mechanism: context method, callback registration, or context flag).
- **D-03:** The inline `div.p-4.flex.gap-3` Back/Next buttons inside `NewOrderPage.tsx` and `FixOrderPage.tsx` are removed — BottomNav takes over that responsibility.

### UX-01 — Scroll Reset

- **D-04:** On every step change, immediately scroll to top of the page — instant, no animation (`window.scrollTo(0, 0)` or `window.scrollTo({ top: 0 })`).
- **D-05:** No `behavior: 'smooth'` — Phase 3 handles smooth step transitions (UX-05); double animation would conflict.
- **D-06:** Applied to both `NewOrderPage.tsx` and `FixOrderPage.tsx` via `useEffect` with `step` as dependency.

### UX-03 — Tap Targets

- **D-07:** All interactive controls must have a touch target of at least 48px height. Primary wizard buttons (`buttonClass`, `secondaryButtonClass`) and inputs (`inputClass`) already meet this — no change needed.
- **D-08:** Small utility controls that currently fall below 48px and need fixing:
  - `Clear` button in `Step2Client.tsx` (currently `px-2 py-1`)
  - `Person / Company` toggle buttons in `Step2Client.tsx` (currently `px-3 py-1`)
  - Stone remove `✕` chip button in `Step4Stones.tsx` (small icon)
  - Search icon button inside client name input (`Step2Client.tsx`, `p-1`)
  - Stone result list items (`min-h-[44px]` → needs `min-h-[48px]`)
- **D-09:** Approach: expand the **touch area only** via `min-h-[48px]` + padding. Visual size of the icon/text stays the same. Do NOT visually enlarge ✕ or toggle buttons — only the tappable region grows.

### Claude's Discretion

- How BottomNav accesses step state and submit handler from wizard contexts (`OrderFormContext`, `FixFormContext`) — planner decides the cleanest pattern (context exposure, callback prop, or dedicated wizard nav context).
- Whether `ProgressBar` stays above the scrollable content or moves inside the BottomNav area — planner decides based on layout.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Files to Modify
- `src/pages/NewOrderPage.tsx` — Remove inline Back/Next buttons, add scroll reset effect
- `src/pages/FixOrderPage.tsx` — Same as NewOrderPage
- `src/components/BottomNav.tsx` — Add wizard mode: replace tabs with Back/Next/Submit
- `src/steps/Step6Review.tsx` — Submit logic must be accessible from BottomNav
- `src/fix-steps/FixStep3Review.tsx` — Same as Step6Review
- `src/steps/Step2Client.tsx` — Fix tap targets: Clear, toggle, search icon
- `src/steps/Step4Stones.tsx` — Fix tap targets: ✕ chip button, result list items
- `src/context/OrderFormContext.tsx` — May need to expose submit or step nav for BottomNav
- `src/context/FixFormContext.tsx` — Same as OrderFormContext

### Existing Patterns (do not break)
- `src/components/FormField.tsx` — `buttonClass` (`min-h-[52px]`), `secondaryButtonClass` (`min-h-[50px]`), `inputClass` (`min-h-[50px]`) — already compliant, no changes
- `src/App.tsx` — Routing structure; BottomNav is rendered at top level

No external ADRs or specs — requirements fully captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BottomNav.tsx`: Already fixed-position, `z-50`, `safe-area-bottom`. Wizard mode extends this component — no new positioning needed.
- `buttonClass` / `secondaryButtonClass` (FormField.tsx): Already 52px/50px compliant — reuse for Back/Next in BottomNav wizard mode.
- `OrderFormContext`: Already exposes `step`, `setStep`, `totalSteps` — BottomNav can read these directly. Submit handler needs to be added or surfaced.

### Established Patterns
- Scroll: App uses `window` scroll (no overflow container on body). `window.scrollTo(0, 0)` in `useEffect([step])` is the correct approach.
- Step logic: `STEPS[step-1]` swap pattern in both page components — step change is synchronous React state.
- BottomNav tab detection: Uses `location.pathname` to determine active tab — wizard mode detection uses same pattern (`pathname === '/orders/new'` or `pathname === '/orders/fix'`).

### Integration Points
- `BottomNav` needs read access to step state. Currently it has no dependency on OrderFormContext or FixFormContext — this is the main new connection to wire up.
- `pb-28` padding on wizard pages accounts for BottomNav height. If BottomNav now always shows two buttons (same height), padding is unchanged.

</code_context>

<specifics>
## Specific Ideas

- On the last step, BottomNav shows `[← Back]` on the left and `[✓ Submit]` (primary style, `buttonClass`) on the right — matches the existing visual language.
- The `Clear` button in Step2Client currently shows only when a client is selected — its touch area fix should not change its visual appearance (stays small text chip style).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-mobile-ux-foundation*
*Context gathered: 2026-04-20*

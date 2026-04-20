# Phase 3: Wizard Polish - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

The wizard communicates clearly where the salesperson is and that their work is safe.

Three improvements:
- **UX-02** — Step indicator shows current position on every wizard step screen (visible without scrolling)
- **UX-04** — "Draft saved" indicator appears within 1 second of any input change
- **UX-05** — Smooth step transitions (no jarring layout shift or flash)

Applies to both wizards: New Order (`/orders/new`, 5 steps) and Fix Order (`/orders/fix`, 3 steps).

</domain>

<decisions>
## Implementation Decisions

### UX-02 — Step Indicator

- **D-01:** The existing `ProgressBar` component already satisfies UX-02 — it shows "Step X of Y" text + gradient fill bar. No change needed to the component or its placement.
- **D-02:** No dots, numbered circles, or step name labels required — the current text + bar style is sufficient.

### UX-04 — Draft Saved Indicator

- **D-03:** A **small green chip toast** appears at the **top center** of the screen after each form change. Style: small, rounded, green background, checkmark + translated text. Does NOT cover content significantly — chip style, not a banner.
- **D-04:** Trigger logic — **debounced**: appears after **500ms of inactivity** following a form change (user paused typing). Stays visible for **2 seconds**, then fades out.
- **D-05:** Applies on **every wizard step** (not just the first). Each form change on any step triggers the toast.
- **D-06:** The text must use the `t('draft_saved')` translation key (new key to add in all 3 locale files: `en.json`, `he.json`, `ru.json`). Translation values:
  - `en`: `"Draft saved"`
  - `ru`: `"Черновик сохранён"`
  - `he`: `"טיוטה נשמרה"`
- **D-07:** The toast is a new standalone component (e.g., `DraftSavedToast.tsx`) rendered at the page level in `NewOrderPage.tsx` and `FixOrderPage.tsx`. It listens to form state changes via the existing context hooks.
- **D-08:** The toast is positioned `fixed`, `top-4`, `left-1/2 -translate-x-1/2` — floating above content without affecting layout.

### UX-05 — Step Transitions

- **D-09:** Smooth CSS transition on step change — **no new animation library** (no Framer Motion). Use Tailwind CSS keyframes or inline `transition` classes.
- **D-10:** Transition style: **fade + slide** — current step fades/slides out, new step fades/slides in. Direction-aware: advancing (Next) slides left, going back (Back) slides right.
- **D-11:** Transition duration: ~200ms — fast enough to feel snappy, slow enough to feel smooth.
- **D-12:** Scroll reset (D-04 from Phase 2) fires after the transition starts, not before — so the scroll-to-top happens as the new step appears.

### Claude's Discretion

- Implementation mechanism for direction-aware transitions: key-based remounting with CSS animation class, or wrapper div with `transition-transform` — planner decides cleanest approach for React 19.
- Whether `DraftSavedToast` uses a `setTimeout` + `useState` pattern or a more generic toast abstraction — keep it simple, no need for a global toast system.
- Exact Tailwind keyframe definition for slide+fade — planner decides whether to extend `tailwind.config` or use inline `@keyframes` in CSS.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Files to Modify
- `src/components/ProgressBar.tsx` — UX-02 already satisfied; verify no changes needed
- `src/pages/NewOrderPage.tsx` — Add DraftSavedToast + step transition wrapper
- `src/pages/FixOrderPage.tsx` — Same as NewOrderPage
- `src/i18n/en.json` — Add `"draft_saved": "Draft saved"`
- `src/i18n/ru.json` — Add `"draft_saved": "Черновик сохранён"`
- `src/i18n/he.json` — Add `"draft_saved": "טיוטה נשמרה"`

### New Files to Create
- `src/components/DraftSavedToast.tsx` — New chip toast component (D-03 to D-08)

### Context Reference (read for patterns)
- `src/context/OrderFormContext.tsx` — Draft save on every `form` change (useEffect); exposes `form`, `step`
- `src/context/FixFormContext.tsx` — Same pattern for Fix Order wizard
- `src/components/BottomNav.tsx` — Wizard mode pattern; fixed positioning reference
- `src/components/FormField.tsx` — `buttonClass`, `inputClass` — established Tailwind patterns

### Prior Phase Decisions (do not break)
- `.planning/phases/02-mobile-ux-foundation/02-CONTEXT.md` — D-05: scroll reset uses `window.scrollTo(0, 0)` without animation. Step transition animation (UX-05) must not conflict — scroll fires independently.

No external ADRs or specs — requirements fully captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ProgressBar.tsx`: Already renders "Step X of Y" + gradient bar. Uses `t('step')` and `t('of')` keys — translation pattern to follow for `draft_saved`.
- `useOrderForm()`: Exposes `form` (triggers toast when changed), `step` (triggers transition).
- `useFixForm()`: Same interface for Fix Order wizard.
- `useLanguage()` / `t()`: Standard translation hook — use for toast text.

### Established Patterns
- Toast positioning: Use `fixed top-4 left-1/2 -translate-x-1/2 z-50` — same z-layer as BottomNav (`z-50`) but at top. Use `z-40` to stay below BottomNav if needed.
- Translation keys: Added in all three JSON files (`en.json`, `he.json`, `ru.json`) — never hardcode text.
- Debounce pattern: No existing debounce utility — implement inline `useEffect` + `setTimeout` + cleanup in `DraftSavedToast`.
- RTL support: App sets `document.documentElement.dir` via `LanguageContext` — fixed centering (`left-1/2 -translate-x-1/2`) works in both RTL and LTR.

### Integration Points
- `NewOrderPage.tsx` renders `<ProgressBar>` + `<StepComponent>`. Transition wrapper wraps `StepComponent`; `DraftSavedToast` renders alongside (not inside) it.
- `FixOrderPage.tsx`: Same structure.
- Both pages already have `pb-28` padding for BottomNav — top toast at `top-4` does not conflict.

</code_context>

<specifics>
## Specific Ideas

- Toast visual: small green chip, top center, `✓` or `✅` prefix, translated text. Similar to success badge style — no shadow, no close button.
- Step transition: user did not specify a particular animation reference — keep it clean and standard (slide + fade at ~200ms is safe).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-wizard-polish*
*Context gathered: 2026-04-20*

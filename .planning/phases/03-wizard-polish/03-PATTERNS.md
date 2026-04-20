# Phase 3: Wizard Polish - Pattern Map

**Mapped:** 2026-04-20
**Files analyzed:** 7 (1 new, 3 modified pages/i18n, 3 i18n JSON files)
**Analogs found:** 7 / 7

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/DraftSavedToast.tsx` | component | event-driven | `src/components/ProgressBar.tsx` | role-match (translation hook pattern); `BottomNav.tsx` for fixed positioning |
| `src/pages/NewOrderPage.tsx` | page | request-response | `src/pages/FixOrderPage.tsx` | exact (identical structure) |
| `src/pages/FixOrderPage.tsx` | page | request-response | `src/pages/NewOrderPage.tsx` | exact (identical structure) |
| `src/i18n/en.json` | config | — | `src/i18n/en.json` (self — key insertion) | exact |
| `src/i18n/he.json` | config | — | `src/i18n/he.json` (self — key insertion) | exact |
| `src/i18n/ru.json` | config | — | `src/i18n/ru.json` (self — key insertion) | exact |
| `src/index.css` | config | — | `src/index.css` (self — keyframe addition) | exact |

---

## Pattern Assignments

### `src/components/DraftSavedToast.tsx` (component, event-driven)

**Analogs:** `src/components/ProgressBar.tsx` (translation hook), `src/components/BottomNav.tsx` (fixed positioning + z-layer)

**Imports pattern** — from `ProgressBar.tsx` lines 1 and `BottomNav.tsx` lines 1-5:
```typescript
import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useOrderForm } from '../context/OrderFormContext'
// (or useFixForm for the Fix wizard variant — component receives `form` as a prop or accepts a hook injector)
```

**Translation hook pattern** — from `ProgressBar.tsx` lines 8-9:
```typescript
export function ProgressBar({ current, total }: Props) {
  const { t } = useLanguage()
  // ...
  <span>{t('step')} {current} {t('of')} {total}</span>
```
Copy this pattern: destructure `t` from `useLanguage()`, use `t('draft_saved')` for the chip text. Never hardcode text.

**Fixed positioning + z-layer pattern** — from `BottomNav.tsx` lines 39-41:
```typescript
<nav
  className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] safe-area-bottom z-50"
  style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}
>
```
For the toast, mirror this pattern but at the top, using `z-40` (one layer below BottomNav's `z-50`):
```typescript
<div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 ...">
```

**Debounce + show/hide pattern** — no existing analog; implement inline per D-07/D-08:
```typescript
// useEffect + setTimeout debounce — standard React pattern
const [visible, setVisible] = useState(false)

useEffect(() => {
  // form change detected — start debounce timer
  const debounceTimer = setTimeout(() => {
    setVisible(true)
    const hideTimer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(hideTimer)
  }, 500)
  return () => clearTimeout(debounceTimer)
}, [form]) // form from useOrderForm() or useFixForm()
```

**Color token pattern** — from `src/index.css` lines 16 and `FormField.tsx` line 18:
```typescript
// CSS variable usage pattern (copy from FormField.tsx):
'text-[var(--color-accent)]'           // accent text
'bg-[var(--color-surface)]'            // surface bg
// For toast, use:
'bg-[var(--color-success)]'            // #16a34a — declared in index.css line 16
'text-white'                           // white text on green
```

**Full chip component shape** (synthesized from above analogs):
```typescript
export function DraftSavedToast({ form }: { form: unknown }) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const debounce = setTimeout(() => {
      setVisible(true)
      const hide = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(hide)
    }, 500)
    return () => clearTimeout(debounce)
  }, [form])

  if (!visible) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40
                    bg-[var(--color-success)] text-white text-[14px]
                    px-4 py-1.5 rounded-full
                    animate-[fadeIn_150ms_ease-out]">
      ✓ {t('draft_saved')}
    </div>
  )
}
```
Note: `animate-[fadeIn_150ms_ease-out]` requires a `fadeIn` keyframe defined in `src/index.css` (see index.css section below).

---

### `src/pages/NewOrderPage.tsx` (page, request-response)

**Analog:** `src/pages/FixOrderPage.tsx` — exact mirror

**Current full file** (lines 1-48) — the planner modifies this:
```typescript
import { useEffect, useRef } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { useAuth } from '../context/AuthContext'
import { ProgressBar } from '../components/ProgressBar'
import { Step2Client } from '../steps/Step2Client'
// ... step imports ...

const STEPS = [Step2Client, Step3Product, Step4Stones, Step5Costs, Step6Review]

export function NewOrderPage() {
  const { form, updateField, step, totalSteps } = useOrderForm()
  const { user } = useAuth()
  const StepComponent = STEPS[step - 1]

  // Auto-set order basics
  useEffect(() => { /* ... */ }, [user, form.order_prefix, ...])

  // UX-01: scroll to top on step change
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    window.scrollTo(0, 0)
  }, [step])

  return (
    <div className="pb-28">
      <ProgressBar current={step} total={totalSteps} />
      <StepComponent />         {/* ← transition wrapper goes around this */}
    </div>
    // ← DraftSavedToast renders alongside (not inside) the div, or as sibling at fragment level
  )
}
```

**Additions for Phase 3:**

1. Import `DraftSavedToast` and a transition wrapper.
2. Wrap `<StepComponent />` in a direction-aware transition div — use `key={step}` to trigger re-mount animation.
3. Render `<DraftSavedToast form={form} />` as a sibling (outside `pb-28` div, in a fragment).
4. Track step direction for slide direction: `const prevStep = useRef(step)` — compare on change.

**Step direction tracking pattern** — add to existing `useRef` pattern (line 36):
```typescript
const isFirstRender = useRef(true)
const prevStep = useRef(step)          // ← new: track direction

useEffect(() => {
  if (isFirstRender.current) { isFirstRender.current = false; return }
  const direction = step > prevStep.current ? 'forward' : 'back'
  prevStep.current = step
  window.scrollTo(0, 0)
  // direction state triggers animation class swap
}, [step])
```

**Transition wrapper pattern** (copy structure from existing `<StepComponent />` placement):
```tsx
// key={step} forces React to unmount/remount — triggers CSS entry animation
<div
  key={step}
  className={`animate-[${direction === 'forward' ? 'slideInLeft' : 'slideInRight'}_200ms_ease-out]`}
>
  <StepComponent />
</div>
```

---

### `src/pages/FixOrderPage.tsx` (page, request-response)

**Analog:** `src/pages/NewOrderPage.tsx` — exact mirror

Apply the identical changes as `NewOrderPage.tsx`:
- Same `prevStep` ref pattern for direction tracking
- Same transition wrapper around `<StepComponent />`
- Same `<DraftSavedToast form={form} />` sibling placement
- Context hook is `useFixForm()` instead of `useOrderForm()` — `form` and `step` are exposed identically

**Current file structure** (lines 1-36) is structurally identical to `NewOrderPage.tsx`. The only differences are:
- `useFixForm` instead of `useOrderForm` (line 3 → 3)
- `STEPS` array has 3 entries not 5 (line 9)
- No `order_prefix` auto-set in the initialization `useEffect`

---

### `src/i18n/en.json` (config)

**Pattern:** append to the end of the file before the closing `}`, following the same flat key format.

**Insertion key** (after line 213, before closing `}`):
```json
  "draft_saved": "Draft saved"
```

**Existing key format reference** (lines 12-13 of en.json):
```json
  "step": "Step",
  "of": "of",
```
Single-level flat object, double-quoted keys and values, comma after each entry except last.

---

### `src/i18n/he.json` (config)

**Insertion key:**
```json
  "draft_saved": "טיוטה נשמרה"
```
Follow same flat-key insertion pattern as en.json. The existing `"step": "שלב"` key (he.json line 12) confirms the pattern.

---

### `src/i18n/ru.json` (config)

**Insertion key:**
```json
  "draft_saved": "Черновик сохранён"
```
Follow same flat-key insertion pattern. Existing `"step": "Шаг"` key (ru.json line 12) confirms the pattern.

---

### `src/index.css` (config — keyframe additions)

**Analog:** existing `src/index.css` — add `@keyframes` blocks after the `.hide-scrollbar` section (after line 112).

**Existing CSS custom property pattern** (lines 1-20) — no changes to `:root`.

**Existing animation class in codebase** — none currently; `transition-all duration-300` used inline in `ProgressBar.tsx` line 19 via Tailwind utility. For the toast and step transitions, define named keyframes here and reference via Tailwind's arbitrary animation syntax `animate-[name_duration_easing]`.

**Keyframes to add** (after line 112):
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

These are consumed by:
- `DraftSavedToast`: `animate-[fadeIn_150ms_ease-out]` on entry
- Transition wrapper in `NewOrderPage` / `FixOrderPage`: `animate-[slideInLeft_200ms_ease-out]` or `animate-[slideInRight_200ms_ease-out]` based on direction

---

## Shared Patterns

### Translation Hook
**Source:** `src/components/ProgressBar.tsx` line 1 + line 9
**Apply to:** `DraftSavedToast.tsx`
```typescript
import { useLanguage } from '../context/LanguageContext'
// ...
const { t } = useLanguage()
// Use: t('draft_saved')
```

### CSS Variable Color Tokens
**Source:** `src/components/FormField.tsx` lines 26-32, `src/index.css` lines 2-17
**Apply to:** `DraftSavedToast.tsx`
```typescript
// Always reference CSS variables via Tailwind arbitrary value syntax:
'bg-[var(--color-success)]'    // green chip background (#16a34a)
'text-[var(--color-text)]'     // body text
'border-[var(--color-border)]' // borders
// Never use hardcoded hex values in component classNames
```

### Fixed Positioning + Z-Layer
**Source:** `src/components/BottomNav.tsx` lines 39-41
**Apply to:** `DraftSavedToast.tsx`
```typescript
// BottomNav uses z-50; toast must use z-40 to remain below it:
className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
// RTL-safe: left-1/2 + -translate-x-1/2 centers in both LTR and RTL
// (BottomNav uses left-0 right-0 which is also RTL-safe for full-width)
```

### useRef First-Render Guard
**Source:** `src/pages/NewOrderPage.tsx` lines 36-40
**Apply to:** direction tracking addition in both page files
```typescript
const isFirstRender = useRef(true)
useEffect(() => {
  if (isFirstRender.current) { isFirstRender.current = false; return }
  // ... action only on subsequent renders
}, [dep])
```

### Context Hook Interface
**Source:** `src/context/OrderFormContext.tsx` lines 73-77 / `src/context/FixFormContext.tsx` lines 73-77
**Apply to:** `DraftSavedToast.tsx` (receives `form` as prop — do not call context hook inside toast; caller passes it down)
```typescript
// Both contexts expose identical shape:
const { form, step, totalSteps, updateField } = useOrderForm()
const { form, step, totalSteps, updateField } = useFixForm()
// form object changing triggers the draft-saved toast debounce
```

---

## No Analog Found

All files have analogs. No files require falling back to RESEARCH.md patterns exclusively.

| File | Note |
|------|------|
| `DraftSavedToast.tsx` | No existing toast component — synthesized from ProgressBar (translation) + BottomNav (fixed positioning). Debounce pattern is new but is standard `useEffect + setTimeout`. |
| `src/index.css` keyframes | No existing `@keyframes` in codebase — new addition, but `transition-all duration-300` in ProgressBar confirms Tailwind animation conventions are in use. |

---

## Metadata

**Analog search scope:** `src/components/`, `src/pages/`, `src/context/`, `src/i18n/`, `src/index.css`
**Files read:** 10
**Pattern extraction date:** 2026-04-20

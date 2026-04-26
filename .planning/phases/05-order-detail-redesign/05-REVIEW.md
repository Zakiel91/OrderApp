---
phase: 05-order-detail-redesign
reviewed: 2026-04-26T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/index.css
  - src/i18n/he.json
  - src/i18n/en.json
  - src/i18n/ru.json
  - src/components/FieldEditSheet.tsx
  - src/pages/OrderDetailPage.tsx
  - src/lib/types.ts
findings:
  critical: 0
  warning: 5
  info: 4
  total: 9
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-04-26
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Phase 5 delivers a clean iOS-style redesign of `OrderDetailPage` with a sticky header, four-tab layout, and a `FieldEditSheet` bottom sheet for tap-to-edit. The implementation is generally solid: TypeScript types are correct, the RTL CSS rule is in place, image URLs are properly escaped via `encodeURIComponent`, and the save/error state flow is coherent.

Five warnings require attention before shipping:

1. A save error is silently swallowed in `handleFieldSave` — the user never learns a PATCH failed.
2. The WhatsApp URL opens with unvalidated phone data from the server — a `tel:` or `javascript:` value in `client_phone` would escape the intended scheme.
3. The tab bar's sticky offset (`top: 96`) is a hardcoded pixel value that will break on devices where the header renders taller or shorter.
4. `FieldEditSheet` always aligns its input `text-align: right`, which is wrong for LTR users (English / Russian).
5. `openSheet` silently ignores taps on non-editable orders with no user feedback, even though the tap target is still visually present.

Four informational items are also noted.

---

## Warnings

### WR-01: Save errors are silently swallowed — user gets no feedback on failure

**File:** `src/pages/OrderDetailPage.tsx:101-127`

`handleFieldSave` has a `try/finally` block with no `catch`. When `updateOrder` throws (e.g. 401 expired token, 403 non-new status, network error), the sheet closes, `saving` resets to `false`, and the user sees nothing — the sheet just disappears as if the save succeeded. The success toast at line 122 also fires only inside the `try`, so at least it does not false-positive, but the failure case is invisible.

**Fix:**
```tsx
const handleFieldSave = async (field: string, value: string) => {
  if (!order) return
  setSaving(true)
  setSaveError(null)   // add state: const [saveError, setSaveError] = useState<string | null>(null)
  try {
    const payload: Record<string, unknown> = { id: order.id, [field]: value }
    if (field === 'price_to_client' || field === 'advance_amount') {
      payload[field] = value ? parseFloat(value) : undefined
    }
    await updateOrder(payload)
    setOrder(prev =>
      prev
        ? {
            ...prev,
            [field]:
              field === 'price_to_client' || field === 'advance_amount'
                ? value ? parseFloat(value) : undefined
                : value,
          }
        : prev
    )
    setSheet(null)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  } catch {
    setSaveError(t('save_error'))   // surface in a toast or under the sheet header
  } finally {
    setSaving(false)
  }
}
```

---

### WR-02: WhatsApp URL built from unvalidated server-supplied phone number

**File:** `src/pages/OrderDetailPage.tsx:194`

```tsx
onClick={() => window.open(`https://wa.me/${order.client_phone!.replace(/\D/g, '')}`, '_blank')}
```

`order.client_phone` comes from the API response. The `.replace(/\D/g, '')` strips non-digits, so a pure-text value (e.g. `"javascript:alert(1)"`) would be stripped to an empty string producing `https://wa.me/` — which is harmless in that case. However, a carefully crafted value like `"00972521234567"` containing a script payload in a query fragment could theoretically survive depending on how browsers handle `wa.me`. More practically: if `client_phone` is somehow null/undefined despite the `&&` guard (e.g., the field becomes `""` after a save), `order.client_phone!` with the non-null assertion will throw at runtime.

Defensively validate before opening:

**Fix:**
```tsx
onClick={() => {
  const digits = (order.client_phone ?? '').replace(/\D/g, '')
  if (digits.length >= 7) {
    window.open(`https://wa.me/${digits}`, '_blank', 'noopener,noreferrer')
  }
}}
```
Adding `noopener,noreferrer` to `window.open` is also best practice any time opening an external URL from user data.

---

### WR-03: Tab bar sticky offset is a hardcoded pixel value

**File:** `src/pages/OrderDetailPage.tsx:233`

```tsx
style={{
  position: 'sticky',
  top: 96,
  ...
}}
```

`96px` is the measured height of the sticky header on the device used during development. It will be wrong if the header grows (e.g., longer salesman name wraps to two lines, or the quick-actions strip changes height), causing the tab bar to slide under the header on some devices/viewports, or leaving a gap on others.

**Fix:** Measure the header with a `ref` and write the offset to a CSS variable, or use a CSS `calc` with named tokens. The simplest approach:

```tsx
// At the top of OrderDetailPage:
const headerRef = useRef<HTMLDivElement>(null)
const [headerHeight, setHeaderHeight] = useState(96)

useEffect(() => {
  if (!headerRef.current) return
  const ro = new ResizeObserver(([entry]) => setHeaderHeight(entry.contentRect.height))
  ro.observe(headerRef.current)
  return () => ro.disconnect()
}, [])

// Apply ref to the sticky header div, and use headerHeight:
<div ref={headerRef} style={{ position: 'sticky', top: 0, zIndex: 10, ... }}>
// Tab bar:
<div style={{ position: 'sticky', top: headerHeight, zIndex: 9, ... }}>
```

---

### WR-04: FieldEditSheet input is always right-aligned, breaking LTR users

**File:** `src/components/FieldEditSheet.tsx:94`

```tsx
style={{
  border: 'none',
  borderBottom: '2px solid var(--color-primary)',
  textAlign: 'right',
}}
```

The inline `textAlign: 'right'` overrides the document's natural text direction. Hebrew users (RTL) are fine, but English and Russian users (LTR) will see their typed text align to the right of the input, which is visually jarring and unexpected.

**Fix:** Remove the hardcoded `textAlign` and let the CSS `[dir="rtl"]` rule in `index.css` handle alignment naturally. If you need an explicit rule, use logical properties:

```tsx
// Remove: textAlign: 'right'
// The [dir="rtl"] { text-align: right } in index.css already handles RTL.
// For the input specifically, you can add:
className="w-full text-[17px] bg-transparent outline-none pb-2 text-[var(--color-text)] rtl:text-right ltr:text-left"
```

---

### WR-05: Non-editable tappable rows give no feedback — silently blocked

**File:** `src/pages/OrderDetailPage.tsx:129-137`

`openSheet` guards editing with `if (order?.status !== 'new') return` at the function level. However, `FieldRow` still renders with `editable={isEditable}` (false) and `onTap={() => {}}`, so the chevron `›` indicator is hidden — that part is fine. But the outer `div` still has `cursor: editable ? 'pointer' : 'default'` which correctly changes the cursor. The gap is that the `onTap` prop is passed as `() => {}` unconditionally even when not editable, meaning the component's `onClick` calls an empty function — that's correct but a code smell that could mask future bugs.

More importantly, `openSheet` checks the status internally but `FieldRow.onTap` is always provided. If `isEditable` is ever wrong (e.g., `order.status` is `'new'` for a non-owner), the sheet silently respects the guard. This is not a current security issue (authorization is enforced server-side on `PUT`), but the double-guard pattern makes the intent unclear.

**Fix:** Pass `onTap` conditionally and keep the status guard exclusively in `openSheet`:

```tsx
<FieldRow
  label={t('client_name')}
  value={clientName}
  editable={isEditable}
  onTap={isEditable ? () => openSheet('client_name_raw', t('client_name'), clientName, 'text') : () => {}}
/>
```

Or simplify `FieldRow` to not call `onTap` when `!editable`:

```tsx
onClick={editable ? onTap : undefined}  // already done — this is correct
```

The actual issue: the guard inside `openSheet` (`if (order?.status !== 'new') return`) is redundant with `editable={isEditable}` on `FieldRow`. Consider removing the internal guard from `openSheet` and trusting the caller — or keep it as a defense-in-depth safety net and add a comment explaining that.

---

## Info

### IN-01: `handleFieldSave` does not close the sheet on error, but does on success — inconsistency

**File:** `src/pages/OrderDetailPage.tsx:121`

`setSheet(null)` is inside the `try` block so the sheet closes on success. On a (currently silent) error, the sheet stays open. Once WR-01 is fixed and error feedback is added, this becomes the right behavior — keep the sheet open so the user can retry. Just confirm this is intentional when implementing WR-01.

---

### IN-02: `id` from `useParams` is not validated before `parseInt`

**File:** `src/pages/OrderDetailPage.tsx:81`

```tsx
getOrder(parseInt(id))
```

`id` from `useParams()` is `string | undefined`. The `if (id)` guard prevents calling on `undefined`, but `parseInt('abc')` returns `NaN`, which would be passed to `getOrder` and produce a confusing API error rather than a clear "bad route" message. In practice the router only routes numeric segments here, so this is low risk. Still worth a guard:

```tsx
const numId = id ? parseInt(id, 10) : NaN
if (!id || isNaN(numId)) { setError('Invalid order ID'); setLoading(false); return }
getOrder(numId).then(...)
```

Also note `parseInt` is called without a radix. `parseInt(id)` (no second argument) is fine for digit-only strings but `parseInt(id, 10)` is explicit and avoids any ambiguity.

---

### IN-03: `saveSuccess` toast sits at `z-40` while the overlay is `z-[100]`

**File:** `src/pages/OrderDetailPage.tsx:319`

When the sheet is open and a save completes (sheet closes, toast shows), both are rendered in the same frame. `z-40` for the toast and `z-[100]` for the sheet overlay means if the sheet closing animation overlaps the toast appearing, the sheet overlay could visually occlude the toast. The sheet closes synchronously (`setSheet(null)`) before `setSaveSuccess(true)`, so in practice there is no overlap. But defensively, raising the toast to `z-[110]` would make the intent explicit.

---

### IN-04: `STATUS_COLORS` map uses dark-theme Tailwind opacity classes but the app has a light theme

**File:** `src/pages/OrderDetailPage.tsx:11-22`

```tsx
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  ...
  completed: 'bg-green-500/20 text-green-400',
}
```

`text-blue-400`, `text-green-400`, `text-red-400` are the light variants of these Tailwind colors — they look dim/muted on a white surface background, which is fine on a dark theme but appear washed out on the light iOS background used here. The iOS design tokens in `index.css` already define `--status-new-bg`, `--status-new-text`, etc. specifically for this purpose but they are not used by `STATUS_COLORS`. This is purely a visual inconsistency, not a bug, but the tokens exist for a reason.

**Fix:** Replace the Tailwind opacity classes with the existing CSS variables:

```tsx
const statusStyle = (status: string): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string }> = {
    new:           { bg: 'var(--status-new-bg)',        color: 'var(--status-new-text)' },
    received:      { bg: 'var(--status-new-bg)',        color: 'var(--status-new-text)' },
    in_production: { bg: 'var(--status-production-bg)', color: 'var(--status-production-text)' },
    completed:     { bg: 'var(--status-done-bg)',       color: 'var(--status-done-text)' },
    // ...
  }
  return map[status] ?? { bg: 'rgba(120,120,128,0.12)', color: '#8a8a8e' }
}
```

---

_Reviewed: 2026-04-26_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

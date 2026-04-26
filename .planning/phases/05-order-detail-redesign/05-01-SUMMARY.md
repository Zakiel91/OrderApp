---
phase: 05-order-detail-redesign
plan: "01"
subsystem: frontend-styles
tags: [css-tokens, i18n, ios-design, animations]
dependency_graph:
  requires: []
  provides:
    - "iOS CSS design tokens via var(--color-ios-bg) etc."
    - "slideUp @keyframes animation for bottom sheet"
    - "i18n keys: tab_client, tab_item, tab_payment, tab_notes, cancel, save_success, whatsapp_action, status_change_action"
  affects:
    - src/pages/OrderDetailPage.tsx
    - src/components/FieldEditSheet.tsx
tech_stack:
  added: []
  patterns:
    - "CSS custom properties in :root for design tokens"
    - "JSON i18n flat key-value structure"
key_files:
  created: []
  modified:
    - src/index.css
    - src/i18n/he.json
    - src/i18n/en.json
    - src/i18n/ru.json
decisions:
  - "iOS system gray #f2f2f7 as page background token (--color-ios-bg)"
  - "slideUp keyframe uses translateY only (no opacity) — matches iOS sheet feel"
  - "status pill tokens scoped with --status-new/production/done prefix for clarity"
metrics:
  duration: "7 minutes"
  completed: "2026-04-26T01:09:54Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Phase 5 Plan 01: CSS Tokens + i18n Foundation Summary

**One-liner:** Added 13 iOS design tokens, `slideUp` keyframe animation, and 8 i18n translation keys (3 languages) as the shared foundation for the Order Detail redesign.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add iOS tokens and slideUp keyframe to index.css | 9a60333 | src/index.css |
| 2 | Add i18n keys to he.json, en.json, ru.json | 0a3b2d0 | src/i18n/he.json, src/i18n/en.json, src/i18n/ru.json |

---

## What Was Built

### Task 1 — src/index.css

Added to `:root` block after `--color-error`:

- `--color-ios-bg: #f2f2f7` — iOS system gray page background
- `--color-separator: rgba(60,60,67,0.18)` — iOS separator lines
- `--color-text-secondary: rgba(60,60,67,0.6)` — secondary text
- `--radius-lg: 16px` — card/button radius
- `--radius-full: 9999px` — pill radius
- `--shadow-sm` — subtle card shadow
- `--shadow-sheet` — bottom sheet entry shadow (`0 -2px 20px rgba(0,0,0,0.12)`)
- `--status-new-bg/text`, `--status-production-bg/text`, `--status-done-bg/text` — status pill colors

Added after `@keyframes slideInRight`:
- `@keyframes slideUp` — `translateY(100%) → translateY(0)` for bottom sheet slide-in

### Task 2 — i18n files (he.json / en.json / ru.json)

Added 8 keys to each file:

| Key | Hebrew | English | Russian |
|-----|--------|---------|---------|
| tab_client | לקוח | Client | Клиент |
| tab_item | פריט | Item | Товар |
| tab_payment | תשלום | Payment | Оплата |
| tab_notes | הערות | Notes | Примечания |
| cancel | ביטול | Cancel | Отмена |
| save_success | השינוי נשמר | Change saved | Изменение сохранено |
| whatsapp_action | WhatsApp | WhatsApp | WhatsApp |
| status_change_action | סטטוס | Status | Статус |

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None — this plan adds only CSS tokens and static translation strings; no UI data wiring involved.

---

## Threat Flags

None — changes are limited to static CSS custom properties and static JSON translation strings with no runtime logic or trust boundary crossing.

---

## Self-Check: PASSED

- `src/index.css` modified — confirmed by `grep "color-ios-bg"` returning `--color-ios-bg: #f2f2f7`
- `@keyframes slideUp` present — confirmed
- `--color-primary: #1a3a5c` unchanged — confirmed
- All three JSON files valid — `node -e JSON.parse(...)` returned "all valid"
- `tab_client` in he.json = `"לקוח"`, ru.json = `"Клиент"` — confirmed
- Task 1 commit 9a60333 exists
- Task 2 commit 0a3b2d0 exists

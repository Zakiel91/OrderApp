---
status: partial
phase: 02-mobile-ux-foundation
source: [02-VERIFICATION.md]
started: 2026-04-20T00:00:00Z
updated: 2026-04-20T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Scroll reset при переходе шагов
expected: Прокрутить шаг вниз, нажать Next — страница прыгает вверх мгновенно (без анимации)
result: [pending]

### 2. BottomNav wizard mode — визуальная проверка
expected: На /orders/new и /orders/fix — Back/Next/Submit вместо вкладок; Back скрыт на шаге 1; Submit на последнем шаге
result: [pending]

### 3. Submit end-to-end через BottomNav
expected: Пройти весь визард, нажать Submit в BottomNav — заказ отправляется, кнопка disabled во время отправки
result: [pending]

### 4. Standard tab mode без регрессии
expected: На /orders показываются 4 вкладки (не wizard mode); переходы между разделами работают
result: [pending]

### 5. Touch targets в Step2Client на телефоне
expected: Нажатие Clear, Person/Company toggle, Search icon без промахов — tap zone ≥ 48px
result: [pending]

### 6. Touch targets в Step4Stones на телефоне
expected: Нажатие ✕ на камне и элементы результатов поиска — tap zone ≥ 48px, нет промахов
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps

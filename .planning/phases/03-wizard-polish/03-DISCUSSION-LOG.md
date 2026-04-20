# Phase 3: Wizard Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 03-wizard-polish
**Areas discussed:** Step Indicator, Draft Saved

---

## Step Indicator (UX-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Достаточно (текущий ProgressBar) | Текст "Step X of Y" + полоска уже покрывают требование | ✓ |
| Добавить точки/кружки | Новый UI рядом с текстом | |
| Названия шагов | "Step 2 of 5 · Client Info" | |

**User's choice:** Текущий ProgressBar достаточен — никаких изменений в компоненте не нужно.
**Notes:** ProgressBar уже отображает "Step X of Y" + анимированную полосу с gradient. UX-02 закрыт без новой разработки.

---

## Draft Saved Indicator (UX-04)

### Расположение

| Option | Description | Selected |
|--------|-------------|----------|
| Toast верху экрана | Всплывающее уведомление сверху | ✓ |
| В ProgressBar | Рядом с "Step X of Y" справа | |
| В BottomNav | Рядом с кнопками Back/Next | |

**User's choice:** Toast сверху экрана.

### Задержка и длительность

| Option | Description | Selected |
|--------|-------------|----------|
| 2с после паузы (500ms debounce) | Появляется после 500мс без активности, висит 2с | ✓ |
| 3с, появляется сразу | Сразу на каждое изменение, 3с | |
| Claude решает | Делегировать UX Claude | |

**User's choice:** 500ms debounce → появляется → висит 2с → fade out.

### Частота появления

| Option | Description | Selected |
|--------|-------------|----------|
| На каждом шаге | Каждый шаг имеет своё состояние localStorage | ✓ |
| Только на первом | Один раз при открытии визарда | |

**User's choice:** На каждом шаге.

### Внешний вид

| Option | Description | Selected |
|--------|-------------|----------|
| Зелёный чип | Маленький rounded badge, top center, зелёный | ✓ |
| Полный toast-баннер | Широкая полоска под шапкой | |

**User's choice:** Зелёный чип, top center, переведённый текст через `t('draft_saved')`.

---

## Claude's Discretion

- Механизм direction-aware переходов (UX-05) — плановик выбирает подход
- Debounce реализация в DraftSavedToast — inline useEffect + setTimeout
- Tailwind keyframes для slide+fade — расширить config или inline @keyframes

## Deferred Ideas

None.

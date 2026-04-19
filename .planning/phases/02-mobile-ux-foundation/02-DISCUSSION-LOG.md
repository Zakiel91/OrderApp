# Phase 2: Mobile UX Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 02-mobile-ux-foundation
**Areas discussed:** Размещение кнопок навигации, Охват tap targets, Сброс скролла

---

## Размещение кнопок навигации (UX-06)

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky-панель над BottomNav | Отдельная фиксированная полоса с кнопками прямо над BottomNav (fixed position). Контент прокручивается под ней. Обе страницы получают одинаковый паттерн. | |
| Wizard заменяет BottomNav | Пока открыт wizard, BottomNav показывает Back/Next вместо вкладок. Экономит вертикальное пространство, но Back/Next живут в другом компоненте. | ✓ |

**User's choice:** Wizard заменяет BottomNav

### Follow-up: последний шаг

| Option | Description | Selected |
|--------|-------------|----------|
| Back и кнопка отправки | [← Back] [✓ Submit] — две кнопки как всегда. Submit переезжает из Step6Review в BottomNav. | ✓ |
| Back и пустой Next | [← Back] [—] — Next есть, но задизаблен. Submit остаётся внутри Step6Review. | |
| Только Back | [← Back] — одна кнопка на последнем шаге. Submit остаётся внутри Step6Review. | |

**User's choice:** Back и кнопка отправки (Submit в BottomNav)

---

## Охват tap targets (UX-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Только область нажатия, визуал прежний | min-h-[48px] + padding, но визуальный размер ✕/Clear остаётся маленьким. Есть куда тыкать, выглядит как раньше. | ✓ |
| Увеличить визуальный размер | min-h-[48px] даёт больше padding и видимую область кнопки. Явнее для пальцев, но чипы станут высокими. | |

**User's choice:** Только область нажатия, визуал прежний

---

## Сброс скролла (UX-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Мгновенно | window.scrollTo(0,0) без behavior:'smooth'. Визуально чисто — новый шаг просто начинается сверху. | ✓ |
| С анимацией | behavior:'smooth'. Плавно, но оценка — если UX-05 (плавные переходы) в Phase 3, лучше не делать двойную анимацию сейчас. | |

**User's choice:** Мгновенно

---

## Claude's Discretion

- Механизм передачи step state и submit handler в BottomNav (expose через context, callback registration, или dedicated wizard nav context)
- Позиция ProgressBar в новом layout

## Deferred Ideas

Нет — дискуссия осталась в рамках фазы.

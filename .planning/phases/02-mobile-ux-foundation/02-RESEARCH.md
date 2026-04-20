# Phase 2: Mobile UX Foundation — Research

**Researched:** 2026-04-20
**Domain:** React 19 PWA — мобильный UX: прокрутка, фиксированная навигация, зоны касания
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Пока открыт визард (`/orders/new` или `/orders/fix`), `BottomNav` заменяет иконки вкладок на кнопки Back/Next. Панель вкладок НЕ отображается во время визарда — её место занимают Back/Next.

**D-02:** На последнем шаге визарда (Step 6 Review для New Order, Step 3 Review для Fix Order): BottomNav показывает `[← Back]` и `[✓ Submit]`. Логика Submit сейчас живёт в `Step6Review.tsx` / `FixStep3Review.tsx` — её нужно поднять в BottomNav (механизм на усмотрение планировщика).

**D-03:** Встроенные кнопки `div.p-4.flex.gap-3` Back/Next внутри `NewOrderPage.tsx` и `FixOrderPage.tsx` удаляются — BottomNav берёт на себя эту ответственность.

**D-04:** При каждой смене шага — мгновенный скролл вверх, без анимации (`window.scrollTo(0, 0)`).

**D-05:** Без `behavior: 'smooth'` — Phase 3 реализует плавные переходы (UX-05); двойная анимация конфликтует.

**D-06:** Применяется к обоим визардам через `useEffect` с `step` как зависимостью.

**D-07:** Все интерактивные элементы — не менее 48px высоты. Основные кнопки (`buttonClass`, `secondaryButtonClass`) и поля (`inputClass`) уже соответствуют — без изменений.

**D-08:** Мелкие элементы управления, которые нужно исправить:
- Кнопка `Clear` в `Step2Client.tsx` (сейчас `px-2 py-1`)
- Переключатели `Person / Company` в `Step2Client.tsx` (сейчас `px-3 py-1`)
- Кнопка удаления камня `✕` в `Step4Stones.tsx` (маленькая иконка)
- Кнопка-иконка поиска внутри поля имени клиента (`Step2Client.tsx`, `p-1`)
- Список результатов поиска камней (`min-h-[44px]` → нужно `min-h-[48px]`)

**D-09:** Подход: расширить только **область касания** через `min-h-[48px]` + padding. Визуальный размер иконки/текста не меняется.

### Claude's Discretion

- Как BottomNav получает доступ к состоянию шага и обработчику Submit из контекстов визарда (`OrderFormContext`, `FixFormContext`) — планировщик выбирает чистый паттерн (экспозиция через контекст, callback prop, или выделенный wizard nav context).
- Остаётся ли `ProgressBar` над скролируемым контентом или перемещается в зону BottomNav — планировщик решает исходя из лейаута.

### Deferred Ideas (OUT OF SCOPE)

None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-01 | Scroll position resets to top on step change | `window.scrollTo(0, 0)` в `useEffect([step])` — подтверждено анализом кода: App не использует overflow-контейнеры, скролл идёт по `window` |
| UX-03 | All tap targets ≥ 48px height | Конкретные элементы определены в D-08; патерн `min-h-[48px]` — уже используется в проекте (см. buttonClass) |
| UX-06 | Bottom navigation stays fixed — buttons never scroll off screen | BottomNav уже fixed-position z-50; нужно добавить wizard mode с детекцией по `location.pathname` |
</phase_requirements>

---

## Summary

Фаза 2 — чисто фронтендовая: три самостоятельных улучшения мобильного UX без зависимостей между собой. Кодовая база полностью прочитана; все ключевые файлы идентифицированы.

**UX-01 (Скролл):** Проще всего из трёх. `window.scrollTo(0, 0)` в `useEffect` на изменение `step` в `NewOrderPage.tsx` и `FixOrderPage.tsx`. App не использует overflow-контейнеры — скролл действительно идёт по `window`.

**UX-06 (BottomNav wizard mode):** Самая сложная задача фазы. BottomNav рендерится в `App.tsx` вне дерева `OrderFormProvider`/`FixFormProvider`. Чтобы читать `step`/`totalSteps` и вызывать `setStep`/`handleSubmit`, нужно либо (а) поднять провайдер выше в дереве, либо (б) передавать callback через контекст, либо (в) создать отдельный легковесный `WizardNavContext`. Submit-обработчики (`handleSubmit` в `Step6Review` и `FixStep3Review`) — локальный state компонентов; их нужно поднять в контекст или зарегистрировать через ref/callback.

**UX-03 (Tap targets):** Точечные правки Tailwind-классов в `Step2Client.tsx` и `Step4Stones.tsx`. Все проблемные элементы идентифицированы в D-08.

**Primary recommendation:** Реализовать в порядке UX-01 → UX-03 → UX-06 (по возрастанию сложности). Начать с простых и независимых задач, оставив архитектурную работу по BottomNav напоследок.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Scroll reset on step change | Frontend (React component) | — | `window` scroll; управляется из page-компонентов |
| Fixed wizard navigation (Back/Next/Submit) | Frontend (shared component) | React Context | BottomNav — shared UI; step/submit state — из контекста визарда |
| Touch target sizing | Frontend (CSS/Tailwind) | — | Чистые стилевые правки; логика не затрагивается |
| Submit handler surfacing | React Context (OrderFormContext / FixFormContext) | Frontend component | Поднятие из локального state компонента в общий контекст |

---

## Standard Stack

### Core (уже в проекте, изменений не требуется)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI framework | Уже используется; `useEffect`, `useContext` — нужные примитивы |
| react-router | 7.13.1 | Routing + `useLocation` | `location.pathname` — механизм определения wizard mode в BottomNav |
| Tailwind CSS | 4.2.2 | Styling | Все tap target правки через классы Tailwind |

### Supporting

Никаких новых зависимостей не требуется. Все задачи фазы решаются существующим стеком.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Поднятие submit в контекст | Глобальный event emitter | Контекст — стандартный React-паттерн; event emitter — усложнение без выгод |
| `window.scrollTo(0, 0)` | `scrollIntoView` на первом элементе | `window.scrollTo` проще и прямолинейнее для данного случая |
| Отдельный `WizardNavContext` | Расширение существующих контекстов | Оба варианта жизнеспособны — см. раздел Architecture Patterns |

---

## Architecture Patterns

### System Architecture Diagram

```
NewOrderPage / FixOrderPage
         │
         ├─ useEffect([step]) ──────────► window.scrollTo(0, 0)     [UX-01]
         │
         ├─ renders StepComponent
         │         │
         │         └─ Step6Review / FixStep3Review
         │                   │
         │                   └─ handleSubmit ──► (нужно поднять) ──┐
         │                                                           │
OrderFormContext / FixFormContext                                    │
         │                                                           │
         ├─ step, setStep, totalSteps (уже экспортируются)           │
         └─ submitHandler ◄──────────────────────────────────────────┘
                  │
                  ▼
            BottomNav (рендерится в App.tsx, вне Provider)
                  │
                  ├─ читает location.pathname ──► wizard mode?
                  ├─ если wizard: показывает [← Back] [Next →] / [← Back] [✓ Submit]
                  └─ если обычный: показывает вкладки
                                                               [UX-06]

Step2Client.tsx / Step4Stones.tsx
    └─ точечные Tailwind-правки min-h-[48px] + padding   [UX-03]
```

### Recommended Project Structure

Изменений в структуре каталогов нет. Правки только в существующих файлах:

```
src/
├── components/
│   └── BottomNav.tsx          # wizard mode — главное изменение фазы
├── context/
│   ├── OrderFormContext.tsx    # добавить registerSubmitHandler или submitOrder
│   └── FixFormContext.tsx      # то же
├── pages/
│   ├── NewOrderPage.tsx        # удалить inline Back/Next, добавить useEffect scroll
│   └── FixOrderPage.tsx        # то же
├── steps/
│   ├── Step2Client.tsx         # tap target правки
│   ├── Step4Stones.tsx         # tap target правки
│   └── Step6Review.tsx         # переместить handleSubmit в контекст
└── fix-steps/
    └── FixStep3Review.tsx      # то же
```

### Pattern 1: Scroll Reset

**Что:** `useEffect` с `step` в зависимостях, вызывает `window.scrollTo(0, 0)`.

**Когда использовать:** В `NewOrderPage.tsx` и `FixOrderPage.tsx`.

```typescript
// [VERIFIED: прямой анализ кодовой базы] — App использует window scroll
useEffect(() => {
  window.scrollTo(0, 0)
}, [step])
```

Размещение: добавить к существующим `useEffect`-хукам в обоих page-компонентах (не заменяя их).

### Pattern 2: BottomNav Wizard Mode — обнаружение

**Что:** Проверка `location.pathname` — уже используется в BottomNav для активного состояния вкладки.

```typescript
// [VERIFIED: прямой анализ BottomNav.tsx]
const isWizard = location.pathname === '/orders/new' || location.pathname === '/orders/fix'
const isNewOrder = location.pathname === '/orders/new'
```

### Pattern 3: Поднятие Submit-обработчика (два варианта — см. Claude's Discretion)

**Вариант А — Расширить существующий контекст (рекомендуется как более простой):**

```typescript
// В OrderFormContext.tsx — добавить в интерфейс:
interface OrderFormContextType {
  // ... существующие поля ...
  submitOrder: (() => Promise<void>) | null
  registerSubmit: (fn: () => Promise<void>) => void
}

// В провайдере:
const [submitFn, setSubmitFn] = useState<(() => Promise<void>) | null>(null)
const registerSubmit = useCallback((fn: () => Promise<void>) => setSubmitFn(() => fn), [])

// В Step6Review.tsx — регистрировать при монтировании:
const { registerSubmit } = useOrderForm()
useEffect(() => {
  registerSubmit(handleSubmit)
  return () => registerSubmit(null as any) // cleanup
}, []) // eslint-disable-line — handleSubmit stable via useCallback
```

**Вариант Б — Выделенный WizardNavContext (чище, но больше кода):**

```typescript
// Новый src/context/WizardNavContext.tsx
interface WizardNavContextType {
  step: number
  totalSteps: number
  canGoBack: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: (() => Promise<void>) | null
  isLastStep: boolean
}
```

**Решение по этому выбору остаётся за планировщиком** согласно Claude's Discretion.

### Pattern 4: BottomNav Wizard UI

**Что:** Кнопки Back/Next занимают всё пространство BottomNav, стилизованные через `buttonClass`/`secondaryButtonClass`.

```typescript
// [VERIFIED: анализ существующего buttonClass/secondaryButtonClass]
// buttonClass имеет w-full — для wizard кнопок нужно flex + flex-1
if (isWizard) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] safe-area-bottom z-50" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
      <div className="flex gap-3 p-3 max-w-lg mx-auto">
        {step > 1 && (
          <button className={secondaryButtonClass + ' flex-1'} onClick={onBack}>
            ← {t('back')}
          </button>
        )}
        {isLastStep ? (
          <button className={buttonClass + ' flex-1'} onClick={onSubmit} disabled={submitting}>
            {submitting ? t('loading') : `✓ ${t('submit_order')}`}
          </button>
        ) : (
          <button className={buttonClass + ' flex-1'} onClick={onNext}>
            {t('next')} →
          </button>
        )}
      </div>
    </nav>
  )
}
```

**Важно:** `buttonClass` содержит `w-full`. При использовании в flex-контейнере с `flex-1` нужно убедиться, что `w-full` не конфликтует. Решение: либо добавить `flex-1` к кнопке, либо переопределить ширину.

### Pattern 5: Tap Target расширение

**Что:** Увеличение зоны касания без изменения визуального размера.

```typescript
// [VERIFIED: анализ D-08 + D-09]

// Clear button: сейчас px-2 py-1 → добавить min-h-[48px] flex items-center
<button
  className="text-xs px-2 min-h-[48px] flex items-center rounded-md"
  style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
>
  Clear
</button>

// Person/Company toggles: сейчас px-3 py-1 → добавить min-h-[48px] flex items-center justify-center
<button className="px-3 min-h-[48px] flex items-center justify-center font-medium transition-colors" ...>
  Person
</button>

// Search icon: сейчас p-1 → добавить min-h-[48px] flex items-center justify-center
<button className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[48px] flex items-center justify-center px-1 rounded-md" ...>

// Stone ✕ chip: добавить min-h-[48px] flex items-center
<button className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] text-xs ml-0.5 min-h-[48px] flex items-center" ...>

// Stone result list items: min-h-[44px] → min-h-[48px]
<li className="px-3 cursor-pointer hover:bg-[var(--color-surface-light)] text-sm min-h-[48px] flex items-center justify-between" ...>
```

**Предупреждение по toggle кнопкам:** Оба `Person`/`Company` toggles живут внутри `div.flex.rounded-lg.overflow-hidden`. При увеличении до 48px нужно проверить, что `overflow-hidden` не обрезает увеличенную зону касания. Скорее всего нужно убрать `overflow-hidden` с обёртки или перенести стиль `rounded-lg` на сами кнопки.

### Anti-Patterns to Avoid

- **Изменение визуального размера иконок ✕:** D-09 явно запрещает. Только тапабельная область растёт, иконка — нет.
- **`behavior: 'smooth'` в скролле:** D-05 явно запрещает. Phase 3 отвечает за плавность.
- **Показ вкладок во время wizard:** D-01 явно запрещает. В wizard mode вкладки полностью заменены кнопками Back/Next.
- **Удаление ProgressBar:** CONTEXT.md оставляет его позицию на усмотрение планировщика — удалять нельзя, только перемещать или оставлять.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll-to-top | Кастомный scroll-менеджер / useScrollPosition | `window.scrollTo(0, 0)` | Это просто однострочный вызов; проект не использует overflow-контейнеры |
| Wizard step state | Новый redux-style store | Расширить существующий `OrderFormContext` | Context уже работает; избыточное усложнение |
| Touch target sizing | JS-обёртки/HOC для больших зон касания | CSS `min-h-[48px]` + `flex items-center` | Нет логики — только стили; Tailwind достаточен |

**Key insight:** Все три требования фазы решаются стандартными React-паттернами и Tailwind — никаких новых библиотек не нужно.

---

## Common Pitfalls

### Pitfall 1: BottomNav вне Provider

**Что идёт не так:** BottomNav рендерится в `App.tsx` вне `<OrderFormProvider>` и `<FixFormProvider>`. Вызов `useOrderForm()` напрямую из BottomNav выбросит ошибку "useOrderForm must be used within OrderFormProvider".

**Почему происходит:** Провайдеры обёртывают только дочерние компоненты роутов `/orders/new` и `/orders/fix`. BottomNav — их сосед в дереве, не потомок.

**Как избежать:** Либо (а) поднять провайдеры выше в дерево `AppRoutes`, либо (б) создать отдельный легковесный `WizardNavContext` с более высоким уровнем, либо (в) передавать обработчики через props из page-компонентов. Вариант (б) — наиболее чистое решение без нарушения инкапсуляции формы.

**Признаки проблемы:** Runtime error "useOrderForm must be used within OrderFormProvider" при переходе на `/orders/new`.

### Pitfall 2: `w-full` в buttonClass конфликтует с flex-1

**Что идёт не так:** `buttonClass` содержит `w-full`. В flex-контейнере BottomNav две кнопки с `w-full` займут 100% ширины каждая, выходя за пределы контейнера.

**Почему происходит:** Tailwind `w-full = width: 100%` применяется независимо от flex-контекста.

**Как избежать:** Добавить `!w-auto flex-1` к wizard-кнопкам в BottomNav, или создать вариант класса без `w-full`, или обернуть каждую кнопку в `<div className="flex-1">`.

**Признаки проблемы:** Кнопки переполняют контейнер BottomNav визуально.

### Pitfall 3: Двойной trigger useEffect при scroll

**Что идёт не так:** Если `useEffect([step])` срабатывает при инициализации (step=1 при монтировании), скролл произойдёт при первом рендере страницы — что не нужно.

**Почему происходит:** React запускает `useEffect` при монтировании для всех зависимостей.

**Как избежать:** Использовать `useRef` для пропуска первого рендера:
```typescript
const isFirstRender = useRef(true)
useEffect(() => {
  if (isFirstRender.current) { isFirstRender.current = false; return }
  window.scrollTo(0, 0)
}, [step])
```
Либо — принять скролл при монтировании как нормальное поведение (страница уже вверху, скролл к 0 не причиняет вреда). Второй вариант проще.

### Pitfall 4: Submit state — submitting/submitted живёт в Step6Review

**Что идёт не так:** `submitting` и `submitted`/`success` — локальный state в `Step6Review` и `FixStep3Review`. Если submit вызывается из BottomNav, нужно передать эти состояния наружу, иначе BottomNav не знает, показывать ли spinner.

**Почему происходит:** Декаплинг UI-компонента от общего состояния.

**Как избежать:** При поднятии `handleSubmit` в контекст — также поднять `submitting` и `error` состояния в контекст, или вернуть их как Promise.

### Pitfall 5: ProgressBar и высота BottomNav

**Что идёт не так:** Если `pb-28` в wizard pages рассчитан на высоту BottomNav с 4 вкладками, а wizard mode показывает 2 кнопки с другим padding — контент может быть частично скрыт.

**Почему происходит:** Фиксированный padding не адаптируется к изменению высоты BottomNav.

**Как избежать:** Проверить, что высота BottomNav в wizard mode совпадает с высотой в tab mode. `p-3` + `min-h-[52px]` кнопки = примерно то же, что `py-2` + `min-h-[52px]` вкладки. Значение `pb-28` должно остаться корректным.

---

## Code Examples

### Scroll Reset (UX-01)
```typescript
// [VERIFIED: анализ NewOrderPage.tsx — useEffect уже используется]
// Добавить в NewOrderPage.tsx и FixOrderPage.tsx
const isFirstRender = useRef(true)
useEffect(() => {
  if (isFirstRender.current) { isFirstRender.current = false; return }
  window.scrollTo(0, 0)
}, [step])
```

### Расширение OrderFormContext для Submit
```typescript
// [VERIFIED: анализ OrderFormContext.tsx — паттерн расширения интерфейса]
// В интерфейс добавить:
registerSubmitHandler: (fn: (() => Promise<void>) | null) => void
submitHandler: (() => Promise<void>) | null

// В провайдер:
const [submitHandler, setSubmitHandler] = useState<(() => Promise<void>) | null>(null)
const registerSubmitHandler = useCallback((fn: (() => Promise<void>) | null) => {
  setSubmitHandler(() => fn)
}, [])
```

### BottomNav wizard mode detection
```typescript
// [VERIFIED: анализ BottomNav.tsx — location.pathname уже используется]
const isNewOrder = location.pathname === '/orders/new'
const isFixOrder = location.pathname === '/orders/fix'
const isWizard = isNewOrder || isFixOrder
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline Back/Next в page-компонентах | Back/Next в BottomNav | Phase 2 | Кнопки никогда не скроллятся из поля видимости |

**Deprecated в этой фазе:**
- `div.p-4.flex.gap-3` с Back/Next в `NewOrderPage.tsx` — удаляется согласно D-03
- `div.px-4` с Back-only на последнем шаге в обоих page — удаляется согласно D-03

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Высота BottomNav в wizard mode ≈ высоте в tab mode, поэтому `pb-28` остаётся корректным | Pitfall 5 | Нижний контент частично скрыт за BottomNav — нужно скорректировать padding |

**Все остальные утверждения верифицированы прямым анализом кодовой базы.**

---

## Open Questions

1. **Механизм передачи Submit в BottomNav**
   - Что знаем: BottomNav вне Provider; Submit-логика в Step6Review/FixStep3Review
   - Что неясно: Вариант А (расширить контекст) или Вариант Б (WizardNavContext) — оба жизнеспособны
   - Рекомендация: Планировщик выбирает. Вариант А — меньше файлов. Вариант Б — лучшая инкапсуляция.

2. **Позиция ProgressBar**
   - Что знаем: Сейчас ProgressBar внутри wizard page, над StepComponent
   - Что неясно: Оставить как есть или переместить в BottomNav area
   - Рекомендация: Оставить как есть (внутри page) — простейший вариант, не требует изменений.

---

## Environment Availability

Step 2.6: SKIPPED — фаза не имеет внешних зависимостей; только изменения кода/стилей React + Tailwind.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Не установлен (нет test runner в package.json) |
| Config file | Отсутствует |
| Quick run command | `npm run build` (TypeScript compile + Vite build = smoke test) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-01 | Scroll reset при смене шага | manual-only | — | — |
| UX-03 | Touch targets ≥ 48px | manual-only (visual) | — | — |
| UX-06 | BottomNav fixed с wizard buttons | manual-only + build | `npm run build` | ❌ Wave 0 |

**Обоснование manual-only:** UX-01 и UX-03 требуют рендеринга в браузере для проверки. Без установленного Vitest/Jest/Playwright автоматизировать их нельзя. `npm run build` проверяет TypeScript-корректность всех изменений.

### Sampling Rate

- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** `npm run build && npm run lint` зелёный перед `/gsd-verify-work`

### Wave 0 Gaps

- [ ] Нет test runner (Vitest/Jest) — установка вне scope фазы 2. Тестирование UX-требований проводится вручную в браузере.

*(Если добавить тесты: `npm install -D vitest @testing-library/react happy-dom` и создать `src/__tests__/BottomNav.test.tsx`)*

---

## Security Domain

Фаза 2 — чисто UI/стилевые изменения. Никаких изменений в аутентификации, авторизации, хранении данных, или API-вызовах нет.

**ASVS категории:** Не применимы к данной фазе.

**Исключение:** Submit-обработчик (`handleSubmit` в Step6Review) перемещается в контекст, но его реализация (API-вызов, payload) остаётся неизменной. Существующие проверки безопасности (JWT в заголовке, серверный фильтр по salesman_id) не затрагиваются.

---

## Sources

### Primary (HIGH confidence — верифицировано прямым анализом кода)

- `C:/OrderApp/src/components/BottomNav.tsx` — структура, позиционирование, tab detection
- `C:/OrderApp/src/pages/NewOrderPage.tsx` — inline buttons, step logic, useEffect pattern
- `C:/OrderApp/src/pages/FixOrderPage.tsx` — то же для Fix wizard
- `C:/OrderApp/src/context/OrderFormContext.tsx` — экспортируемые поля: step, setStep, totalSteps
- `C:/OrderApp/src/context/FixFormContext.tsx` — то же
- `C:/OrderApp/src/steps/Step6Review.tsx` — handleSubmit, submitting state, структура
- `C:/OrderApp/src/fix-steps/FixStep3Review.tsx` — то же
- `C:/OrderApp/src/steps/Step2Client.tsx` — конкретные Tailwind-классы проблемных кнопок
- `C:/OrderApp/src/steps/Step4Stones.tsx` — min-h-[44px] на list items, ✕ chip
- `C:/OrderApp/src/components/FormField.tsx` — buttonClass (min-h-[52px]), secondaryButtonClass (min-h-[50px])
- `C:/OrderApp/src/App.tsx` — BottomNav позиция в дереве, Provider scope
- `C:/OrderApp/.planning/phases/02-mobile-ux-foundation/02-CONTEXT.md` — все locked decisions

### Secondary (MEDIUM confidence)

Нет — все утверждения верифицированы первичными источниками.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — нет новых зависимостей; всё верифицировано анализом package.json и кода
- Architecture: HIGH — все файлы прочитаны, зависимости и ограничения выявлены
- Pitfalls: HIGH — выявлены из конкретных структур кода (buttonClass w-full, Provider scope, submit state)

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (стабильный стек без внешних API)

# Phase 2: Mobile UX Foundation - Pattern Map

**Mapped:** 2026-04-20
**Files analyzed:** 9 files to modify (0 new files)
**Analogs found:** 9 / 9

---

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `src/components/BottomNav.tsx` | component | request-response | `src/components/BottomNav.tsx` (self — extend existing) | exact |
| `src/context/OrderFormContext.tsx` | provider | event-driven | `src/context/FixFormContext.tsx` | exact |
| `src/context/FixFormContext.tsx` | provider | event-driven | `src/context/OrderFormContext.tsx` | exact |
| `src/pages/NewOrderPage.tsx` | page | request-response | `src/pages/FixOrderPage.tsx` | exact |
| `src/pages/FixOrderPage.tsx` | page | request-response | `src/pages/NewOrderPage.tsx` | exact |
| `src/steps/Step6Review.tsx` | step/component | request-response | `src/fix-steps/FixStep3Review.tsx` | exact |
| `src/fix-steps/FixStep3Review.tsx` | step/component | request-response | `src/steps/Step6Review.tsx` | exact |
| `src/steps/Step2Client.tsx` | step/component | request-response | `src/steps/Step4Stones.tsx` | role-match |
| `src/steps/Step4Stones.tsx` | step/component | request-response | `src/steps/Step2Client.tsx` | role-match |

---

## Pattern Assignments

### `src/context/OrderFormContext.tsx` (provider, event-driven)

**Change:** Добавить `registerSubmitHandler` и `submitHandler` в интерфейс и провайдер.

**Analog:** `src/context/FixFormContext.tsx` (зеркальная структура)

**Текущий интерфейс** (lines 4–12):
```typescript
interface OrderFormContextType {
  form: OrderFormData
  updateField: <K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => void
  updateFields: (updates: Partial<OrderFormData>) => void
  resetForm: () => void
  step: number
  setStep: (s: number) => void
  totalSteps: number
}
```

**Паттерн расширения — добавить два поля в интерфейс:**
```typescript
interface OrderFormContextType {
  // ... все существующие поля без изменений ...
  submitHandler: (() => Promise<void>) | null
  registerSubmitHandler: (fn: (() => Promise<void>) | null) => void
}
```

**Паттерн useState + useCallback** (копировать по аналогии с `useCallback` на lines 35–47):
```typescript
const [submitHandler, setSubmitHandler] = useState<(() => Promise<void>) | null>(null)
const registerSubmitHandler = useCallback((fn: (() => Promise<void>) | null) => {
  setSubmitHandler(() => fn)
}, [])
```

**Provider value** (line 50) — добавить два новых поля:
```typescript
<OrderFormContext.Provider value={{
  form, updateField, updateFields, resetForm, step, setStep, totalSteps,
  submitHandler, registerSubmitHandler,
}}>
```

**Критично:** `setSubmitHandler(() => fn)` — обязательно через стрелочную функцию, иначе React вызовет `fn` как updater вместо сохранения ссылки.

---

### `src/context/FixFormContext.tsx` (provider, event-driven)

**Change:** Идентично `OrderFormContext.tsx` — те же два поля, та же реализация.

**Analog:** `src/context/OrderFormContext.tsx` (зеркальная структура)

Интерфейс для расширения — `FixFormContextType` (lines 4–12), паттерн полностью совпадает с OrderFormContext. Применить те же изменения:
- Добавить `submitHandler` и `registerSubmitHandler` в `FixFormContextType`
- Добавить `useState` + `useCallback` в `FixFormProvider`
- Расширить `FixFormContext.Provider value`

---

### `src/pages/NewOrderPage.tsx` (page, request-response)

**Changes:**
1. Удалить `div.p-4.flex.gap-3` с кнопками Back/Next (lines 43–53 и lines 54–59)
2. Добавить `useEffect` для scroll reset

**Analog:** `src/pages/FixOrderPage.tsx` (идентичная структура)

**Текущий блок Back/Next для удаления** (lines 43–60):
```tsx
{step < totalSteps && (
  <div className="p-4 flex gap-3">
    {step > 1 && (
      <button className={secondaryButtonClass} onClick={() => setStep(step - 1)}>
        {t('back')}
      </button>
    )}
    <button className={buttonClass} onClick={() => setStep(step + 1)}>
      {t('next')}
    </button>
  </div>
)}
{step === totalSteps && step > 1 && (
  <div className="px-4">
    <button className={secondaryButtonClass} onClick={() => setStep(step - 1)}>
      {t('back')}
    </button>
  </div>
)}
```
**Эти два блока полностью удаляются** (BottomNav берёт на себя эту роль).

**Импорты после удаления:** убрать `buttonClass, secondaryButtonClass` из импорта `FormField` если они больше не используются в файле.

**Паттерн scroll reset — добавить к существующим useEffect (после line 36):**
```typescript
// UX-01: scroll to top on step change
const isFirstRender = useRef(true)
useEffect(() => {
  if (isFirstRender.current) { isFirstRender.current = false; return }
  window.scrollTo(0, 0)
}, [step])
```

**Добавить `useRef` в импорт React** (line 1):
```typescript
import { useEffect, useRef } from 'react'
```

---

### `src/pages/FixOrderPage.tsx` (page, request-response)

**Changes:** Те же два изменения, что и в `NewOrderPage.tsx`.

**Analog:** `src/pages/NewOrderPage.tsx` (зеркальная структура)

**Текущий блок Back/Next для удаления** (lines 31–49) — идентичен NewOrderPage, удалить оба условных блока целиком.

**Scroll reset useEffect** — добавить тот же паттерн с `useRef` после существующего `useEffect` (line 19–24).

**Добавить `useRef` в импорт** (line 1 — уже есть `useEffect`):
```typescript
import { useEffect, useRef } from 'react'
```

---

### `src/steps/Step6Review.tsx` (step/component, request-response)

**Change:** Зарегистрировать `handleSubmit` в `OrderFormContext` при монтировании; удалить кнопку Submit из JSX (её заменит BottomNav).

**Analog:** `src/fix-steps/FixStep3Review.tsx` (идентичная структура submit-логики)

**Текущая сигнатура handleSubmit** (lines 35–122):
```typescript
const handleSubmit = async () => {
  setSubmitting(true)
  setError('')
  try {
    // ... создание заказа, загрузка изображений, сохранение клиента ...
    setSubmitted(true)
  } catch (err) {
    setError(err instanceof Error ? err.message : t('error'))
  }
  setSubmitting(false)
}
```

**Паттерн регистрации — добавить после объявления handleSubmit:**
```typescript
const { registerSubmitHandler, submitHandler: _ } = useOrderForm()

useEffect(() => {
  registerSubmitHandler(handleSubmit)
  return () => registerSubmitHandler(null)
}, []) // handleSubmit стабилен — не меняется между рендерами
```

**Важно:** Чтобы `handleSubmit` была стабильной ссылкой, обернуть её в `useCallback`:
```typescript
const handleSubmit = useCallback(async () => {
  // ... тело без изменений ...
}, [form, t, resetForm, setSubmitting, setError, setSubmitted, setOrderNumber])
```

**Кнопка Submit для удаления из JSX** (lines 205–211):
```tsx
<button
  className={buttonClass}
  onClick={handleSubmit}
  disabled={submitting}
>
  {submitting ? t('loading') : t('submit_order')}
</button>
```
Эту кнопку удалить — BottomNav рендерит Submit на последнем шаге.

**State `submitting` и `error` остаются в компоненте** — они нужны для UI (error block line 199–203 остаётся). BottomNav получает `submitHandler` из контекста и вызывает его; `submitting` можно также поднять в контекст для управления состоянием кнопки в BottomNav (либо BottomNav сам управляет своим `loading` состоянием через Promise).

---

### `src/fix-steps/FixStep3Review.tsx` (step/component, request-response)

**Change:** Идентично Step6Review — регистрировать `handleSubmit` в `FixFormContext`, удалить кнопку Submit из JSX.

**Analog:** `src/steps/Step6Review.tsx`

**Текущая кнопка Submit для удаления** (line 148):
```tsx
<button className={buttonClass} onClick={handleSubmit} disabled={submitting}>
  {submitting ? t('submitting') : t('fix_submit')}
</button>
```

**Паттерн регистрации** (аналогично Step6Review, но через `useFixForm`):
```typescript
const { registerSubmitHandler } = useFixForm()

useEffect(() => {
  registerSubmitHandler(handleSubmit)
  return () => registerSubmitHandler(null)
}, [])
```

---

### `src/components/BottomNav.tsx` (component, request-response)

**Change:** Добавить wizard mode — при `/orders/new` или `/orders/fix` показывать Back/Next/Submit вместо вкладок.

**Сложность:** BottomNav находится в `App.tsx` (line 45) — снаружи от `<OrderFormProvider>` и `<FixFormProvider>` (lines 31–39 App.tsx). Прямой вызов `useOrderForm()` выбросит ошибку.

**Решение (Вариант Б — WizardNavContext):** Создать лёгкий `WizardNavContext`, чей провайдер поднят выше BottomNav в `AppRoutes`. `OrderFormContext` и `FixFormContext` записывают в него текущий `step`/`totalSteps`/`submitHandler`; BottomNav читает из него.

**Альтернативное решение (Вариант А — поднять провайдеры):** Переместить `<OrderFormProvider>` и `<FixFormProvider>` из route-элементов в `AppRoutes` — тогда BottomNav станет их потомком. Минус: провайдеры будут активны даже вне своих роутов.

**Аналог — текущая структура BottomNav** (lines 1–38):

```typescript
// Текущий импорт (lines 1–2) — расширить:
import { useLocation, useNavigate } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
// Добавить: import { useWizardNav } from '../context/WizardNavContext'

// Текущее определение tabs (lines 4–9) — оставить без изменений

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()
  // Добавить: const { step, totalSteps, submitHandler } = useWizardNav()

  // Существующая tab detection (lines 20–21) — использовать как образец:
  const active = location.pathname === tab.path || ...

  // Новый wizard detection (по тому же принципу):
  const isWizard = location.pathname === '/orders/new' || location.pathname === '/orders/fix'
```

**Паттерн wizard UI — добавить перед return:**
```tsx
if (isWizard) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] safe-area-bottom z-50"
      style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
      <div className="flex gap-3 p-3 max-w-lg mx-auto">
        {step > 1 && (
          <button
            className={secondaryButtonClass + ' !w-auto flex-1'}
            onClick={() => setStep(step - 1)}
          >
            {t('back')}
          </button>
        )}
        {step === totalSteps ? (
          <button
            className={buttonClass + ' !w-auto flex-1'}
            onClick={() => submitHandler?.()}
            disabled={submitting}
          >
            {submitting ? t('loading') : `✓ ${t('submit_order')}`}
          </button>
        ) : (
          <button
            className={buttonClass + ' !w-auto flex-1'}
            onClick={() => setStep(step + 1)}
          >
            {t('next')}
          </button>
        )}
      </div>
    </nav>
  )
}
```

**Предупреждение:** `buttonClass` содержит `w-full` (FormField.tsx line 30). В flex-контейнере конфликтует с `flex-1`. Решение: добавить `!w-auto flex-1` к каждой wizard-кнопке (`!w-auto` переопределяет `w-full` через Tailwind `!important`).

**Высота nav:** `p-3` (12px × 2) + `min-h-[52px]` кнопки ≈ 76px. Текущий `pb-28` (112px) на wizard pages достаточен.

---

### `src/steps/Step2Client.tsx` (step/component, request-response)

**Change:** UX-03 — расширить touch-зону трёх элементов до `min-h-[48px]`.

**Analog:** `src/steps/Step4Stones.tsx` (тот же подход к маленьким интерактивным элементам)

**1. Кнопка Clear** (lines 75–86) — текущий класс `"text-xs px-2 py-1 rounded-md"`:
```tsx
// Было:
className="text-xs px-2 py-1 rounded-md"

// Стало:
className="text-xs px-2 min-h-[48px] flex items-center rounded-md"
```

**2. Кнопки Person / Company toggle** (lines 183–192) — текущий класс `"px-3 py-1 font-medium transition-colors"`:
```tsx
// Было:
className="px-3 py-1 font-medium transition-colors"

// Стало:
className="px-3 min-h-[48px] flex items-center justify-center font-medium transition-colors"
```

**Предупреждение:** toggle-кнопки обёрнуты в `div.flex.rounded-lg.overflow-hidden` (line 181). При `min-h-[48px]` нужно убрать `overflow-hidden` с обёртки и перенести скругления на сами кнопки, иначе touch-зона будет обрезана:
```tsx
// Было:
<div className="flex rounded-lg overflow-hidden border border-[var(--color-border)] text-[12px]">

// Стало:
<div className="flex border border-[var(--color-border)] text-[12px] rounded-lg">
  <button ... className="px-3 min-h-[48px] flex items-center justify-center font-medium transition-colors rounded-l-lg">
    Person
  </button>
  <button ... className="px-3 min-h-[48px] flex items-center justify-center font-medium transition-colors rounded-r-lg border-l border-[var(--color-border)]">
    Company
  </button>
```

**3. Search icon button** (lines 140–153) — текущий класс `"absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md"`:
```tsx
// Было:
className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md"

// Стало:
className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[48px] flex items-center justify-center px-1 rounded-md"
```

---

### `src/steps/Step4Stones.tsx` (step/component, request-response)

**Change:** UX-03 — два элемента: ✕ chip button и list items.

**Analog:** `src/steps/Step2Client.tsx` (тот же подход к touch targets)

**1. Stone remove ✕ chip button** (lines 61–65) — текущий класс `"text-[var(--color-text-muted)] hover:text-[var(--color-error)] text-xs ml-0.5"`:
```tsx
// Было:
className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] text-xs ml-0.5"

// Стало:
className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] text-xs ml-0.5 min-h-[48px] flex items-center"
```

Визуальный размер `✕` (текст `text-xs`) не изменяется — только тappable-зона растёт вниз/вверх за счёт `min-h-[48px] flex items-center`.

**2. Stone result list items** (line 87) — текущий класс содержит `min-h-[44px]`:
```tsx
// Было:
className="px-3 py-2.5 cursor-pointer hover:bg-[var(--color-surface-light)] text-sm min-h-[44px] flex items-center justify-between"

// Стало:
className="px-3 py-2.5 cursor-pointer hover:bg-[var(--color-surface-light)] text-sm min-h-[48px] flex items-center justify-between"
```

Минимальное изменение: `min-h-[44px]` → `min-h-[48px]` (4px разница).

---

## Shared Patterns

### useCallback pattern для стабильных обработчиков
**Source:** `src/context/OrderFormContext.tsx` (lines 35–47)
**Apply to:** `Step6Review.tsx`, `FixStep3Review.tsx` — `handleSubmit` должен быть стабильной ссылкой для регистрации в контексте
```typescript
const updateField = useCallback(<K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => {
  setForm(prev => ({ ...prev, [key]: value }))
}, [])
```

### Provider context pattern
**Source:** `src/context/OrderFormContext.tsx` (lines 17–54)
**Apply to:** `OrderFormContext.tsx`, `FixFormContext.tsx` — расширение с сохранением существующего паттерна `useState` + `useCallback` + Provider value
```typescript
export function OrderFormProvider({ children }: { children: ReactNode }) {
  // ... состояние ...
  const [submitHandler, setSubmitHandler] = useState<(() => Promise<void>) | null>(null)
  const registerSubmitHandler = useCallback((fn: (() => Promise<void>) | null) => {
    setSubmitHandler(() => fn)  // ВАЖНО: стрелочная функция!
  }, [])
  return (
    <OrderFormContext.Provider value={{ ..., submitHandler, registerSubmitHandler }}>
      {children}
    </OrderFormContext.Provider>
  )
}
```

### Pathname-based mode detection
**Source:** `src/components/BottomNav.tsx` (lines 19–21)
**Apply to:** `BottomNav.tsx` — wizard mode detection по тому же принципу что active tab
```typescript
const active = location.pathname === tab.path ||
  (tab.path === '/orders' && location.pathname.startsWith('/orders/') && !location.pathname.includes('new') && !location.pathname.includes('fix'))
```

### Touch target expansion (min-h + flex)
**Source:** `src/components/FormField.tsx` (line 30–32) — уже используется `min-h-[52px]`, `min-h-[50px]`
**Apply to:** `Step2Client.tsx` (3 кнопки), `Step4Stones.tsx` (1 кнопка + 1 li)
```typescript
// Принцип: добавить min-h-[48px] flex items-center к любому интерактивному элементу
// Визуальный контент (иконка, текст) остаётся прежнего размера — растёт только область касания
export const buttonClass = '... min-h-[52px] ...'  // образец уже в проекте
```

---

## No Analog Found

Нет файлов без аналога. Все 9 изменяемых файлов — существующий код с чётко выраженными паттернами расширения.

**Если плановщик выберет Вариант Б (WizardNavContext):** потребуется создать новый файл `src/context/WizardNavContext.tsx`. Ближайший аналог по структуре — `src/context/FixFormContext.tsx` (lines 1–60): создать контекст + провайдер + хук по той же схеме, но с минимальным набором полей (`step`, `totalSteps`, `setStep`, `submitHandler`).

---

## Architecture Warning

**BottomNav находится вне обоих провайдеров** (`App.tsx` lines 30–45):
```tsx
// OrderFormProvider оборачивает только route /orders/new
<Route path="/orders/new" element={
  <OrderFormProvider>
    <NewOrderPage />
  </OrderFormProvider>
} />
// BottomNav — сосед, не потомок:
<BottomNav />  // line 45, вне обоих провайдеров
```

Это **главный архитектурный вопрос фазы**. Плановщик обязан выбрать механизм до написания кода:
- **Вариант А:** Поднять провайдеры в `AppRoutes` (выше BottomNav) — провайдеры всегда активны
- **Вариант Б:** Новый `WizardNavContext` с провайдером в `AppRoutes` — минимальное состояние, наилучшая инкапсуляция
- **Вариант В:** Передавать callback через props из page-компонентов — нарушает текущую архитектуру

---

## Metadata

**Analog search scope:** `src/components/`, `src/context/`, `src/pages/`, `src/steps/`, `src/fix-steps/`
**Files read:** 11 (BottomNav, OrderFormContext, FixFormContext, NewOrderPage, FixOrderPage, Step6Review, FixStep3Review, Step2Client, Step4Stones, FormField, App)
**Pattern extraction date:** 2026-04-20

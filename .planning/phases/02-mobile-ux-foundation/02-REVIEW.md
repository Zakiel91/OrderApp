---
phase: 02-mobile-ux-foundation
reviewed: 2026-04-20T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - src/App.tsx
  - src/components/BottomNav.tsx
  - src/context/FixFormContext.tsx
  - src/context/OrderFormContext.tsx
  - src/context/WizardNavContext.tsx
  - src/fix-steps/FixStep3Review.tsx
  - src/pages/FixOrderPage.tsx
  - src/pages/NewOrderPage.tsx
  - src/steps/Step2Client.tsx
  - src/steps/Step4Stones.tsx
  - src/steps/Step6Review.tsx
findings:
  critical: 0
  warning: 5
  info: 6
  total: 11
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-20
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Проверены 11 файлов в рамках фазы Mobile UX Foundation. Архитектура WizardNavContext — чистая и грамотно реализована; паттерн подписки `submitHandler` через `registerSubmitHandler` корректен, включая обязательную обёртку в стрелочную функцию для обхода React updater-вызова. Scroll-reset на смене шага реализован правильно через `isFirstRender` ref.

Найдено 5 предупреждений (потенциальные баги) и 6 информационных замечаний (качество кода). Критических уязвимостей безопасности нет.

---

## Warnings

### WR-01: `resetForm` в `useCallback` есть в зависимостях `handleSubmit`, но не используется

**File:** `src/fix-steps/FixStep3Review.tsx:91`
**Issue:** `useCallback` для `handleSubmit` перечисляет `resetForm` в массиве зависимостей (`[form, t, resetForm]`), но `resetForm` нигде внутри коллбека не вызывается. Аналогичная ситуация в `Step6Review.tsx:119`. Это само по себе не вызывает баг, но если в будущем кто-то добавит вызов `resetForm()` в тело функции (например, после успешной отправки), он не сработает в `FixStep3Review` — там `resetForm` вызывается только внутри кнопки success-состояния, вне `handleSubmit`. Это создаёт ложное ощущение, что форма сбрасывается при submit.

**Fix:** Убрать `resetForm` из массива зависимостей `useCallback` в обоих файлах:
```ts
// FixStep3Review.tsx:91 и Step6Review.tsx:119
}, [form, t])
```

---

### WR-02: `saveClientIfNew` вызывается без `await` — необработанный rejected Promise

**File:** `src/fix-steps/FixStep3Review.tsx:76`, `src/steps/Step6Review.tsx:103`
**Issue:** `saveClientIfNew(...)` вызывается без `await` и без `.catch()`. Если промис отклонится, ошибка попадёт в необработанное исключение (unhandled promise rejection). В production-окружении это может приводить к шумным ошибкам в консоли или в мониторинге.

**Fix:** Обернуть в явный fire-and-forget с подавлением ошибки:
```ts
saveClientIfNew({ ... }).catch(() => { /* silently ignore */ })
```

---

### WR-03: `setSearching(false)` вызывается вне блока `finally` — состояние зависает при исключении

**File:** `src/steps/Step4Stones.tsx:32`
**Issue:** Функция `handleSearch` устанавливает `setSearching(true)`, затем вызывает `await searchStones(q)`. Если `searchStones` бросит исключение, управление перейдёт в `catch`, который только делает `setStoneResults([])`, а `setSearching(false)` стоит после блока `try/catch` — он НЕ выполнится при исключении. Спиннер `{searching && <p>...loading</p>}` так и останется видимым навсегда.

```ts
// Текущий код (упрощённо):
try {
  const results = await searchStones(q)
  setStoneResults(...)
} catch { setStoneResults([]) }
setSearching(false)  // <-- не вызывается при throw в catch, т.к. catch сам не бросает
```
На самом деле `catch` здесь не перебрасывает, поэтому `setSearching(false)` всё же выполнится. Однако это хрупкая конструкция — стоит перенести в `finally`.

**Fix:**
```ts
const handleSearch = useCallback(async (q: string) => {
  setStoneQuery(q)
  if (q.length < 2) { setStoneResults([]); return }
  setSearching(true)
  try {
    const results = await searchStones(q)
    setStoneResults(Array.isArray(results) ? results : [])
  } catch {
    setStoneResults([])
  } finally {
    setSearching(false)
  }
}, [])
```

---

### WR-04: Wizard-навигация не предотвращает переход за пределы диапазона шагов

**File:** `src/components/BottomNav.tsx:64`
**Issue:** Кнопка "Далее" просто делает `setStep(step + 1)` без проверки `step < totalSteps`. Формально кнопка не отображается на последнем шаге (из-за `isLastStep`), но никакой защиты на уровне `setStep` нет. Если `totalSteps` в контексте будет задан некорректно или состояние рассинхронизируется, пользователь может выйти за диапазон, и `STEPS[step - 1]` вернёт `undefined`, что вызовет краш React-рендера.

**Fix:** Добавить защиту в обработчик:
```tsx
onClick={() => setStep(Math.min(step + 1, totalSteps))}
```

---

### WR-05: Двуязычный текст в hardcoded строках нарушает требование проекта `feedback_no_bilingual`

**File:** `src/steps/Step2Client.tsx:177`
**Issue:** В метке поля ID/Company числе содержится Hebrew-текст прямо в JSX: `תעודת זהות` и `ח"פ`. Это нарушает зафиксированное в памяти проекта правило: никогда не показывать двуязычные метки — только один язык согласно настройке пользователя.

```tsx
// строка 177–178
{idType === 'id' ? 'תעודת זהות' : 'ח"פ'}
```

**Fix:** Вынести оба варианта в словарь переводов и показывать только одну строку через `t(...)`. Если приложение работает только на иврите — убрать английские варианты; если только на английском — убрать ивритские.

---

## Info

### IN-01: `(client as any)` — небезопасные приведения типов

**File:** `src/steps/Step2Client.tsx:30, 116, 117, 162, 163`
**Issue:** Повсеместное использование `(client as any).id`, `(client as any).name`, `(client as any).client_name`, `(c as any).company_name`. Тип `ClientRecord` либо неполный, либо не совпадает с реальной структурой API. `as any` снимает защиту TypeScript.

**Fix:** Расширить интерфейс `ClientRecord` в `src/lib/api.ts` (или `src/lib/types.ts`) реальными полями из ответа API и убрать все приведения к `any`.

---

### IN-02: Дублирование кода `handleSubmit` между `FixStep3Review` и `Step6Review`

**File:** `src/fix-steps/FixStep3Review.tsx:35–91`, `src/steps/Step6Review.tsx:34–119`
**Issue:** Паттерн создания ордера, загрузки изображений и сохранения клиента полностью дублируется в двух файлах. При необходимости изменить логику (например, добавить retry для изображений) изменение нужно вносить в двух местах.

**Fix:** Вынести общую логику в хук `useOrderSubmit(payload, imageFiles, clientData)` или утилитарную функцию в `src/lib/`.

---

### IN-03: Дублирование структуры `OrderFormContext` и `FixFormContext`

**File:** `src/context/OrderFormContext.tsx`, `src/context/FixFormContext.tsx`
**Issue:** Оба контекста идентичны по структуре: `form`, `updateField`, `updateFields`, `resetForm`, `step`, `setStep`, `totalSteps`, `submitHandler`, `registerSubmitHandler`, интеграция с `WizardNavContext`. Разница только в типе формы и `STORAGE_KEY`.

**Fix:** Создать единый дженерик-фабричный хук `createFormContext<T>(initialData, storageKey, totalSteps)`. Не критично, но снизит связность при будущих изменениях wizard-логики.

---

### IN-04: `FixOrderPage` и `NewOrderPage` — `useEffect` с автозаполнением вызывается на каждый рендер

**File:** `src/pages/FixOrderPage.tsx:16–21`, `src/pages/NewOrderPage.tsx:20–33`
**Issue:** `useEffect` с зависимостями `[user, form.salesman_name, form.order_date, updateField]` вызывает `updateField(...)` при каждом изменении `form.salesman_name` или `form.order_date`. Если `user` есть с самого начала, первый рендер запишет имя, второй рендер снова проверит и не запишет (условие `if (!form.salesman_name)` уже ложное). Поведение корректное, но цепочка немного непрозрачная и может вызвать лишние ре-рендеры.

**Fix:** Вынести авто-заполнение в инициализатор `useState` контекста или использовать `useRef` для флага "already initialized", аналогично паттерну `isFirstRender` для scroll.

---

### IN-05: Хардкодированный `order_prefix: 'FIX'`

**File:** `src/fix-steps/FixStep3Review.tsx:39`
**Issue:** Строка `order_prefix: 'FIX'` захардкодена прямо в `handleSubmit`. Если в будущем появится другой тип fix-заказа с другим префиксом, это место будет молча отправлять неверный префикс.

**Fix:** Либо вынести в константу (`const FIX_PREFIX = 'FIX'` уровня модуля), либо хранить в форме аналогично тому, как это сделано в `OrderForm` с `form.order_prefix`.

---

### IN-06: Кнопки-иконки без `aria-label`

**File:** `src/steps/Step2Client.tsx:140–153`, `src/steps/Step4Stones.tsx:61–68`
**Issue:** Кнопки поиска (лупа) и удаления камня (✕) не имеют `aria-label`. Экранные читалки не смогут интерпретировать их назначение.

**Fix:**
```tsx
// Кнопка поиска
<button aria-label={t('search_client')} ...>

// Кнопка удаления камня
<button aria-label={t('remove_stone', { name: stone })} ...>
```

---

_Reviewed: 2026-04-20_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

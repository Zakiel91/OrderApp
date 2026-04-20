# Phase 4: Orders Features — Research

**Researched:** 2026-04-21
**Domain:** React SPA (orders list, detail page, new edit page) + Cloudflare Worker (ownership check)
**Confidence:** HIGH — все выводы получены прямым чтением исходного кода, без предположений

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Edit доступен только для `status === 'new'`. Для других статусов кнопка Edit не показывается.
- **D-02:** Кнопка Edit появляется в `OrderDetailPage` (верхний ряд действий рядом с Back/Delete). Переход на `/orders/:id/edit`.
- **D-03:** Экран редактирования — **плоская форма** (не переиспользование визарда). Обычные text/select поля, без многошаговой навигации.
- **D-04:** **Без client lookup** в форме редактирования. Поля клиента (name, phone, email) — редактируемые plain text inputs.
- **D-05:** Worker `handleUpdateOrder` (PUT /api/production/orders) **обязан добавить ownership check**: продавец может редактировать только свои заказы — такой же паттерн как `handleDeleteOrder` (production.ts:693).
- **D-06:** Search UI: один text input (поиск по имени клиента + номеру заказа) + один dropdown фильтр статуса. Оба ниже заголовка, выше списка.
- **D-07:** Фильтрация — **клиентская**. 200 заказов уже в памяти. Новых API вызовов нет.
- **D-08:** Счётчик заказов: показывает общее кол-во без фильтра ("7 orders"), с фильтром — ("3 of 7"). Рядом с заголовком.
- **D-09:** Когда `getOrders` выбрасывает, показывать error card вместо списка — тот же визуальный паттерн что в `OrderDetailPage`. Текущий `catch(() => {})` заменить на `catch(e => setError(e.message))`.
- **D-10:** Error state включает кнопку **Retry**, которая повторно вызывает `getOrders` — тот же паттерн перезагрузки.

### Claude's Discretion
- Какие конкретные поля включить в плоскую форму редактирования: ключевые — `client_name_raw`, `client_phone`, `client_email`, `jewelry_type`, `metal`, `size`, `description`, `main_stone_parcel`, `price_to_client`, `deadline`, `comment`. Планировщик выбирает что войдёт в чистую мобильную форму.
- Компоновка формы редактирования — секции или плоский список — решает планировщик.
- Новые i18n ключи для "edit", "save_changes", "edit_order" — планировщик добавляет во все три файла.
- Маршрут для edit page: `/orders/:id/edit` — планировщик регистрирует в `App.tsx`.

### Deferred Ideas (OUT OF SCOPE)
- Client lookup в форме редактирования (поиск по телефону/ТЗ/имени) — отложено; пользователь подтвердил только plain text поля.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FEAT-01 | Order edit UI — salespeople can edit their own pending orders | `updateOrder` в api.ts уже есть (PUT); нужна новая страница EditOrderPage + ownership check в воркере + Edit кнопка в OrderDetailPage |
| FEAT-02 | "My Orders" shows order count and has a search/filter bar | `getOrders` уже возвращает `total`; STATUS_COLORS содержит все статусы для dropdown; клиентская фильтрация по уже загруженным данным |
| FEAT-03 | Error message shown when orders fail to load (not silent empty list) | Текущий `catch(() => {})` в MyOrdersPage:48 — прямая цель замены; паттерн error state из OrderDetailPage:72-81 готов к копированию |
</phase_requirements>

---

## Summary

Фаза 4 добавляет три самостоятельные функции в уже работающее приложение. Кодовая база хорошо подготовлена: `updateOrder` (PUT) в api.ts уже работает, `getOrders` уже возвращает `total` (просто не используется), `STATUS_COLORS` уже содержит все статусы для dropdown, паттерн error state в OrderDetailPage готов к точному копированию.

Главный риск — worker: `handleUpdateOrder` сейчас **не получает `auth`** (строка index.ts:1241 передаёт только `request` и `env.DB`), тогда как `handleDeleteOrder` получает третий аргумент `auth` (строка 1243). Ownership check нужно добавить в двух местах: сигнатура функции в production.ts и вызов в index.ts.

Все UI компоненты доступны из существующих экспортов FormField.tsx без установки новых пакетов. Нет внешних зависимостей для установки.

**Главная рекомендация:** Начать с воркера (D-05 — ownership check) как самого критичного для безопасности, затем EditOrderPage, затем MyOrdersPage изменения (FEAT-02, FEAT-03).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Edit order form (FEAT-01) | Frontend (React SPA) | API / Worker | UI в EditOrderPage.tsx; сохранение через PUT /api/production/orders |
| Ownership check для редактирования (D-05) | API / Worker | — | Проверка прав должна быть на сервере, не в браузере |
| Клиентская фильтрация заказов (FEAT-02) | Frontend (React SPA) | — | 200 записей уже в памяти; фильтрация без API |
| Счётчик заказов (FEAT-02) | Frontend (React SPA) | — | `total` уже возвращается из API; нужна только отрисовка |
| Error state при загрузке (FEAT-03) | Frontend (React SPA) | — | catch block в MyOrdersPage; кнопка Retry повторяет fetch |

---

## Standard Stack

### Core (все уже установлено)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | (существующий) | SPA компоненты | Весь проект на React |
| react-router | (существующий) | Маршрутизация | Используется во всём приложении |
| TypeScript | (существующий) | Типизация | Весь проект на TS |

### Reusable UI Assets (из существующего кода)
| Export | File | Purpose |
|--------|------|---------|
| `inputClass` | FormField.tsx:26 | Все text inputs в EditOrderPage |
| `selectClass` | FormField.tsx:28 | Status filter dropdown, jewelry_type select |
| `buttonClass` | FormField.tsx:30 | Save Changes (primary CTA) |
| `secondaryButtonClass` | FormField.tsx:32 | Cancel, Back, Retry, Edit кнопки |
| `FormField` | FormField.tsx:11 | Враппер с label для всех полей |
| `STATUS_COLORS` | MyOrdersPage.tsx:8 | Ключи для dropdown статусов |

**Installation:** Ничего устанавливать не нужно. Всё используется из существующего кода.

---

## Детальные находки по FEAT

### FEAT-01 — Edit Order

#### handleUpdateOrder в production.ts (строки 641-689)

**Текущая сигнатура:**
```typescript
// production.ts:641
export async function handleUpdateOrder(request: Request, db: D1Database): Promise<Response>
```

**Проблема:** Нет параметра `auth` — ownership check невозможен без него.

**Текущий вызов в index.ts (строка 1241):**
```typescript
if (request.method === 'PUT')
  return addCorsHeaders(await handleUpdateOrder(request, env.DB), origin);
```

**Нужный вызов (по образцу DELETE на строке 1243):**
```typescript
if (request.method === 'PUT')
  return addCorsHeaders(await handleUpdateOrder(request, env.DB, auth), origin);
```

**Updatable поля** (production.ts:652-662) — поля, которые воркер принимает в PUT body:
```
order_date, client_name_raw, jeweller_name_raw, description, model_code,
jewelry_type, metal, size, main_stone_parcel, cat_claw, valigara_sku,
barak_job_bag, barak_upid, buy_supply, buy_supply_cost, modelling_cost,
print_3d_cost, certificate_cgl_price, jeweller_work_wage, paid_to_jeweller,
price_to_client, deadline, comment, image_urls,
salesman_name, client_phone, client_email,
payment_status, payment_method, hold_reason, cancel_reason,
metal_cost, setting_cost_plus20, paid_to_jeweller_bool, from_scratch,
min_sale_price, metal_weight_g, total_item_weight_g, total_carat_weight
```

Все нужные для edit формы поля (`client_name_raw`, `client_phone`, `client_email`, `jewelry_type`, `metal`, `size`, `description`, `main_stone_parcel`, `price_to_client`, `deadline`, `comment`) присутствуют в списке updatable.

**Ownership check из handleDeleteOrder (production.ts:699-704):**
```typescript
if (auth?.role === 'salesman') {
  const order = await db.prepare(
    'SELECT order_prefix, salesman_name FROM orders WHERE id = ?'
  ).bind(id).first<{ order_prefix: string; salesman_name: string }>();
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });
  const ownsOrder = order.order_prefix === auth.order_prefix ||
    order.salesman_name?.toLowerCase() === auth.name?.toLowerCase();
  if (!ownsOrder) return Response.json({ error: 'Forbidden: not your order' }, { status: 403 });
}
```

Для PUT ownership check нужно выполнить до UPDATE. В `handleUpdateOrder` уже есть запрос к БД `existing` (строка 645), так что можно добавить ownership check сразу после проверки `if (!existing)`.

#### updateOrder в api.ts (строка 80-85)

```typescript
export async function updateOrder(data: Record<string, unknown>): Promise<{ success: boolean }> {
  return fetchJson('/api/production/orders', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
```

Принимает `Record<string, unknown>` — значит достаточно передать `{ id, client_name_raw, ..., comment }`.

#### Order type — поля для формы редактирования (types.ts:13-62)

Редактируемые поля с маппингом Order → форма:
```
Order.client_name_raw → input type="text"
Order.client_phone    → input type="tel"
Order.client_email    → input type="email"
Order.jewelry_type    → select (существующие опции из wizard)
Order.metal           → input type="text" (свободный ввод)
Order.size            → input type="text"
Order.description     → textarea rows={3}
Order.main_stone_parcel → input type="text"
Order.price_to_client → input type="number" (числовое, в Order — number)
Order.deadline        → input type="date"
Order.comment         → textarea rows={3}
```

Read-only поля (не показывать в форме редактирования):
`id`, `order_number`, `order_prefix`, `order_date`, `order_type`, `salesman_name`, `status`, `created_at`, `updated_at`, `image_urls`, `display_name`

#### Паттерн error state в OrderDetailPage (строки 72-81)

```tsx
if (error || !order) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <p className="text-[var(--color-text-muted)]">{error || t('error')}</p>
      <button className={secondaryButtonClass + ' mt-4'} onClick={() => navigate('/orders')}>
        {t('back')}
      </button>
    </div>
  )
}
```

Для EditOrderPage: если заказ не найден или `status !== 'new'` — показать такой же error state с кнопкой Back, навигирующей обратно на `/orders/${id}`.

#### Топ action row в OrderDetailPage (строки 88-99)

```tsx
<div className="flex gap-2 mb-4">
  <button className={secondaryButtonClass} onClick={() => navigate('/orders')}>
    {t('back')}
  </button>
  <button
    onClick={handleDelete}
    disabled={deleting}
    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50"
  >
    {deleting ? '...' : t('delete')}
  </button>
</div>
```

Для FEAT-01: добавить Edit кнопку с `secondaryButtonClass + ' w-auto px-4'`, только когда `order.status === 'new'`. Кнопка встаёт после Delete в том же `flex gap-2 mb-4`.

#### Routing в App.tsx

Текущие маршруты (App.tsx:31-45):
```tsx
<Route path="/orders" element={<MyOrdersPage />} />
<Route path="/orders/new" element={<OrderFormProvider>...</OrderFormProvider>} />
<Route path="/orders/fix" element={<FixFormProvider>...</FixFormProvider>} />
<Route path="/orders/:id" element={<OrderDetailPage />} />
<Route path="/settings" element={<SettingsPage />} />
```

Новый маршрут добавляется **без провайдеров** (не wizard):
```tsx
<Route path="/orders/:id/edit" element={<EditOrderPage />} />
```

Важно: `/orders/:id/edit` должен быть **перед** `/orders/:id`, иначе роутер может его перехватить. (В react-router v6 порядок имеет значение при точном совпадении, но `/orders/:id/edit` более специфичен и не конфликтует — можно ставить после, но безопаснее до или в любом порядке с react-router v6 который использует ranking).

---

### FEAT-02 — Search/Filter в MyOrdersPage

#### Текущее состояние MyOrdersPage (строки 1-113)

**State:**
```typescript
const [orders, setOrders] = useState<Order[]>([])
const [loading, setLoading] = useState(true)
// error state ОТСУТСТВУЕТ — это FEAT-03 добавляет
```

**Вызов getOrders (строка 46-48):**
```typescript
getOrders(1, 200).then(res => {
  setOrders(res.orders || [])
}).catch(() => {}).finally(() => setLoading(false))
```

`res.total` возвращается но **не деструктурируется** — нужно добавить `setTotal(res.total || 0)`.

**STATUS_COLORS keys** (строки 8-19) — доступные статусы для dropdown:
```
'new', 'received', 'in_production', 'completed', 'delivered',
'cancelled', 'on_hold', 'paid', 'sold', 'in_stock'
```

**Текущий header row (строки 64-71):**
```tsx
<div className="flex justify-between items-center mb-4">
  <h1 className="text-lg font-bold">{t('nav_orders')}</h1>
  {user && (
    <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-1 rounded-lg">
      {user.prefix} · {user.name}
    </span>
  )}
</div>
```

Согласно 04-UI-SPEC.md: счётчик ставится **между** h1 и salesman badge. Нужно вставить `<span>` с `text-xs text-[var(--color-text-muted)]`.

**Новые state переменные для FEAT-02:**
```typescript
const [total, setTotal] = useState(0)
const [searchText, setSearchText] = useState('')
const [statusFilter, setStatusFilter] = useState('all')
```

**Логика filteredOrders:**
```typescript
const filteredOrders = orders.filter(o => {
  const matchesSearch = !searchText ||
    (o.order_number?.toLowerCase().includes(searchText.toLowerCase())) ||
    (o.client_name_raw || o.client_name || '').toLowerCase().includes(searchText.toLowerCase())
  const matchesStatus = statusFilter === 'all' || o.status === statusFilter
  return matchesSearch && matchesStatus
})
const isFiltered = searchText !== '' || statusFilter !== 'all'
```

---

### FEAT-03 — Error State в MyOrdersPage

**Текущий catch (строка 48):**
```typescript
}).catch(() => {}).finally(() => setLoading(false))
```

**Замена:**
```typescript
const [error, setError] = useState<string | null>(null)
// ...
}).catch(e => setError(e.message)).finally(() => setLoading(false))
```

**handleRetry функция:**
```typescript
const handleRetry = () => {
  setError(null)
  setLoading(true)
  getOrders(1, 200).then(res => {
    setOrders(res.orders || [])
    setTotal(res.total || 0)
  }).catch(e => setError(e.message)).finally(() => setLoading(false))
}
```

**Error card JSX (из 04-UI-SPEC.md, подтверждён паттерном OrderDetailPage:72-81):**
```tsx
<div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
  <p className="text-[var(--color-text-muted)] text-center mb-4">{t('orders_load_error')}</p>
  <button className={secondaryButtonClass + ' w-auto px-6'} onClick={handleRetry}>
    {t('retry')}
  </button>
</div>
```

Error card **заменяет только область списка** — заголовок и search bar остаются видны.

---

## i18n System

#### Как работает (из src/context/LanguageContext — выведено из использования)

```typescript
const { t } = useLanguage()
t('key')                         // простой ключ
t('order_created', { number })   // с интерполяцией
```

Интерполяция по паттерну `{variable}` в JSON строках (как `"order_created": "Order {number} has been created successfully."`).

#### Существующие ключи, которые МОЖНО переиспользовать без изменений

| i18n ключ | Значение EN | Использование в Edit форме |
|-----------|-------------|---------------------------|
| `client_name` | "Client Name" | FormField label для client_name_raw |
| `client_phone` | "Phone Number" | FormField label для client_phone |
| `client_email` | "Email" | FormField label для client_email |
| `jewelry_type` | "Type of Jewelry" | FormField label для jewelry_type |
| `metal` | "Gold Type" | FormField label для metal |
| `size` | "Size" | FormField label для size |
| `main_stone` | "Main Stone(s)" | FormField label для main_stone_parcel |
| `price_to_client` | "Price for Customer (if closed)" | FormField label для price_to_client |
| `deadline` | "Deadline" | FormField label для deadline |
| `comment` | ... | НЕТ ключа `comment` в текущих файлах — нужно добавить |
| `back` | "Back" | Cancel и Back кнопки |
| `loading` | "Loading..." | Loading state |
| `error` | "Something went wrong" | General error |
| `no_orders` | "No orders yet" | Пустой результат фильтрации |

**Ключ `description`**: Есть `fix_description` ("Additional Details") но нет просто `description`. Нужно добавить новый ключ.

#### Новые ключи, которые нужно добавить во ВСЕ три файла

| Ключ | EN | RU | HE | Feature |
|------|----|----|----|----|
| `edit_order` | "Edit Order" | "Редактировать заказ" | "ערוך הזמנה" | FEAT-01 |
| `save_changes` | "Save Changes" | "Сохранить изменения" | "שמור שינויים" | FEAT-01 |
| `save_error` | "Failed to save. Please try again." | "Не удалось сохранить. Попробуйте снова." | "שמירה נכשלה. נסה שוב." | FEAT-01 |
| `description` | "Description" | "Описание" | "תיאור" | FEAT-01 (поле формы) |
| `comment` | "Comment" | "Комментарий" | "הערה" | FEAT-01 (поле формы) |
| `search_orders` | "Search orders..." | "Поиск заказов..." | "חיפוש הזמנות..." | FEAT-02 |
| `all_statuses` | "All statuses" | "Все статусы" | "כל הסטטוסים" | FEAT-02 |
| `orders_count` | "{count} orders" | "{count} заказов" | "{count} הזמנות" | FEAT-02 |
| `orders_filtered` | "{filtered} of {total}" | "{filtered} из {total}" | "{filtered} מתוך {total}" | FEAT-02 |
| `orders_load_error` | "Could not load orders. Check your connection and try again." | "Не удалось загрузить заказы. Проверьте соединение и попробуйте снова." | "לא ניתן לטעון הזמנות. בדוק את החיבור ונסה שוב." | FEAT-03 |
| `retry` | "Retry" | "Повторить" | "נסה שוב" | FEAT-03 |

Итого: **11 новых ключей** × 3 файла = 33 записи.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Стили input/button | Свои CSS классы | `inputClass`, `selectClass`, `buttonClass`, `secondaryButtonClass` из FormField.tsx | Уже содержат touch targets, focus ring, RTL-safe padding |
| Label wrappe | Голый `<label>` | `<FormField label={...}>` | Показывает (optional) / * автоматически |
| Status dropdown опции | Hardcoded список | `Object.keys(STATUS_COLORS)` из MyOrdersPage | Синхронизирован с реальными статусами |
| API вызовы | Прямой `fetch` | `updateOrder`, `getOrder` из api.ts | Уже обрабатывает auth header, ошибки |

---

## Common Pitfalls

### Pitfall 1: handleUpdateOrder без auth в index.ts
**Что идёт не так:** Ownership check добавляется в production.ts, но index.ts вызывает функцию без третьего аргумента `auth` — check никогда не срабатывает.
**Почему:** index.ts:1241 передаёт только `(request, env.DB)`. DELETE на строке 1243 передаёт `(request, env.DB, auth)`.
**Как избежать:** Изменить ОБА места — сигнатуру функции И вызов в index.ts.
**Признаки:** Ownership check в коде есть, но любой продавец может редактировать чужие заказы.

### Pitfall 2: `total` не сохраняется в state
**Что идёт не так:** `getOrders` возвращает `{ orders, total }`, но код присваивает только `res.orders` в state. `total` нужен для счётчика FEAT-02.
**Почему:** Текущий код (строка 47): `setOrders(res.orders || [])` — `res.total` игнорируется.
**Как избежать:** Добавить `const [total, setTotal] = useState(0)` и `setTotal(res.total || 0)` при загрузке.

### Pitfall 3: Маршрут `/orders/:id/edit` перехватывается без правильного порядка
**Что идёт не так:** В react-router v6 специфичные маршруты ранжируются выше `:id`, но безопаснее поставить `/orders/:id/edit` перед `/orders/:id`.
**Как избежать:** Зарегистрировать маршрут edit **перед** маршрутом detail в App.tsx.

### Pitfall 4: price_to_client — тип number в Order, но string в форме
**Что идёт не так:** `Order.price_to_client` — `number | undefined`. Если хранить в state формы как string и отправлять как string — воркер примет (поле `price_to_client` в updatable без принудительного типа), но лучше привести к number перед отправкой.
**Как избежать:** При сабмите: `price_to_client: formData.price_to_client ? parseFloat(formData.price_to_client) : undefined`.

### Pitfall 5: `catch(() => {})` в handleRetry тоже нужно заменить
**Что идёт не так:** Если handleRetry написан с новым catch, но исходный useEffect оставлен нетронутым — при первой загрузке ошибки всё ещё проглатываются.
**Как избежать:** Вынести логику fetch в отдельную функцию `loadOrders()`, которую вызывают и useEffect, и handleRetry.

### Pitfall 6: `description` поле — два разных имени
**Что идёт не так:** В `Order` тип поле называется `description`. В `OrderFormData` поле `comment` переименовано в "Comments" (строка types.ts:102 — комментарий говорит "was 'description' - renamed to Comments"). Форма редактирования работает напрямую с `Order`, не с `OrderFormData` — использовать имя `description`.
**Как избежать:** В EditOrderPage использовать `order.description`, отправлять как `description` в PUT body.

---

## Architecture Patterns

### Рекомендуемая структура EditOrderPage

```
src/pages/EditOrderPage.tsx
```

```
EditOrderPage
├── useEffect: getOrder(id) → setOrder / setError
├── Loading state (mirrors OrderDetailPage loading)
├── Error/wrong-status state (mirrors OrderDetailPage error state)
└── Form layout:
    ├── Top action row: h1(order_number) | Save | Cancel
    ├── Inline save error banner (conditional)
    └── Card: bg-[var(--color-surface)] rounded-xl p-4 mb-4
        └── FormField wrappers for each editable field
```

### Рекомендуемая структура изменений MyOrdersPage

```
MyOrdersPage state additions:
├── total: number
├── error: string | null
├── searchText: string
└── statusFilter: string ('all' | status keys)

Derived:
└── filteredOrders: orders filtered by searchText + statusFilter

JSX additions:
├── Header row: h1 | count label | salesman badge
├── Search/filter bar: [searchText input] [statusFilter select]
├── Error card (conditional, replaces list)
└── Empty filter result message (conditional, in list area)
```

---

## Validation Architecture

`nyquist_validation: true` — секция обязательна.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Нет автоматических тестов (нет jest.config, vitest.config, __tests__ в проекте) |
| Config file | Не обнаружен |
| Quick run command | Ручная проверка в браузере |
| Full suite command | Ручная проверка + dev build |

Проект не имеет test infrastructure. Все Wave 0 тесты будут ручными.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Verification Method | Automated? |
|--------|----------|-----------|--------------------|----|
| FEAT-01-a | Edit кнопка видна на pending (status=new) заказе | manual | Открыть OrderDetailPage с заказом status=new, убедиться что кнопка Edit видна | ❌ ручная |
| FEAT-01-b | Edit кнопка НЕ видна на не-pending заказе | manual | Открыть OrderDetailPage с заказом status=in_production, убедиться что кнопки нет | ❌ ручная |
| FEAT-01-c | EditOrderPage загружает данные заказа в поля | manual | Перейти на /orders/:id/edit, проверить pre-populated поля | ❌ ручная |
| FEAT-01-d | Save Changes сохраняет изменения и возвращает на detail | manual | Изменить поле, нажать Save Changes, убедиться что данные обновились в detail | ❌ ручная |
| FEAT-01-e | Cancel возвращает на detail без сохранения | manual | Изменить поле, нажать Cancel, убедиться что изменения не сохранились | ❌ ручная |
| FEAT-01-f | Worker отклоняет PUT для чужого заказа | manual | Попытаться обновить заказ другого продавца через API, получить 403 | ❌ ручная (curl или DevTools) |
| FEAT-01-g | Save error показывает inline banner | manual | Симулировать сетевую ошибку (DevTools → offline), нажать Save, увидеть banner | ❌ ручная |
| FEAT-02-a | Header показывает общее кол-во заказов | manual | Загрузить MyOrdersPage, увидеть "N orders" рядом с заголовком | ❌ ручная |
| FEAT-02-b | Поиск по тексту фильтрует список | manual | Ввести имя клиента в search input, убедиться что список сузился | ❌ ручная |
| FEAT-02-c | Поиск по номеру заказа фильтрует список | manual | Ввести часть номера заказа, убедиться что список сузился | ❌ ручная |
| FEAT-02-d | Dropdown статуса фильтрует список | manual | Выбрать статус в dropdown, убедиться что только соответствующие заказы видны | ❌ ручная |
| FEAT-02-e | Счётчик показывает "N of M" при активном фильтре | manual | Включить фильтр, проверить что счётчик изменился на "X of Y" | ❌ ручная |
| FEAT-02-f | Нет результатов фильтрации показывает no_orders | manual | Ввести несуществующий текст, увидеть сообщение об отсутствии заказов | ❌ ручная |
| FEAT-03-a | Network error показывает error card | manual | DevTools → Network → Offline, обновить страницу, увидеть error card | ❌ ручная |
| FEAT-03-b | Retry повторяет запрос и восстанавливает список | manual | После error card вернуть сеть, нажать Retry, увидеть список | ❌ ручная |
| FEAT-03-c | Header остаётся виден при error state | manual | Убедиться что error card заменяет только список, заголовок виден | ❌ ручная |

### Wave 0 Gaps

- [ ] Нет test infrastructure — все проверки ручные
- [ ] Нет mock setup для тестирования error state без реального сервера — использовать DevTools Network throttling/offline

### Sampling Rate

- **Per task commit:** Ручная smoke-проверка изменённого компонента в браузере
- **Per wave merge:** Полный ручной тест всех трёх FEAT сценариев
- **Phase gate:** Все 15 тест-сценариев выше пройдены вручную перед `/gsd-verify-work`

---

## Environment Availability

Step 2.6: SKIPPED — фаза включает только изменения кода/конфигурации. Все внешние зависимости (Cloudflare Worker, D1 database) уже работают и обслуживают текущее приложение.

---

## Security Domain

`security_enforcement` не выключен — секция обязательна.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | нет (login уже реализован) | — |
| V3 Session Management | нет (JWT уже реализован) | — |
| V4 Access Control | **да** — ownership check для PUT | `auth.role === 'salesman'` проверка + `order.order_prefix === auth.order_prefix` |
| V5 Input Validation | **да** — поля формы редактирования | Нет валидации на клиенте (поля optional по паттерну проекта), воркер принимает updatable fields |
| V6 Cryptography | нет | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Продавец редактирует чужой заказ | Tampering | Ownership check в handleUpdateOrder (D-05) — `auth.role === 'salesman'` проверка |
| Обход статус-фильтра на клиенте | Tampering | Edit кнопка проверяет `order.status === 'new'` на клиенте + воркер может проверять статус на сервере (опционально) |
| Инъекция SQL через поля формы | Tampering | D1 prepared statements с bind() уже используются в handleUpdateOrder |

**Критическая заметка:** Текущий handleUpdateOrder также не проверяет `status` заказа на сервере — любой продавец (после ownership check) сможет редактировать заказы в любом статусе. D-01 говорит что Edit кнопка скрыта на клиенте для не-new статусов, но воркер это не enforces. Это потенциальный gap, который планировщик должен осознавать — решение зависит от требований пользователя.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | — | — | — |

**Таблица пустая:** Все утверждения в этом исследовании верифицированы прямым чтением кода. Никаких ASSUMED claims нет.

---

## Open Questions

1. **Проверка статуса на сервере при PUT**
   - Что знаем: D-01 говорит Edit button скрыт для не-new заказов на клиенте. D-05 требует ownership check.
   - Неясно: Должен ли воркер также reject PUT если `existing.status !== 'new'`?
   - Рекомендация: Добавить server-side status check (`if (existing.status !== 'new') return 403`) — defence in depth, не нарушает никакие decisions.

2. **`description` vs `comment` поле**
   - Что знаем: В `Order` тип — оба поля существуют (`description` и `comment`). В форме wizard `comment` использовался как "Comments". В `OrderDetailPage` оба показаны раздельно.
   - Неясно: Нужно ли показывать оба поля в edit форме?
   - Рекомендация: Показать оба — `description` (textarea, "Description") и `comment` (textarea, "Comment") — разные поля в БД.

---

## Sources

### Primary (HIGH confidence — прямое чтение файлов)
- `C:\OrderApp\src\pages\MyOrdersPage.tsx` — полная структура, STATE_COLORS, текущий catch
- `C:\OrderApp\src\pages\OrderDetailPage.tsx` — error state pattern строки 72-81, action row строки 88-99
- `C:\Dashboard\worker\src\routes\production.ts` — handleUpdateOrder строки 641-689, handleDeleteOrder строки 693-712, updatable fields список строки 652-662
- `C:\Dashboard\worker\src\index.ts` — вызовы handleUpdateOrder (1241) и handleDeleteOrder (1243), отсутствие auth в PUT
- `C:\OrderApp\src\lib\api.ts` — updateOrder сигнатура строки 80-85, getOrders возврат строки 53-60
- `C:\OrderApp\src\lib\types.ts` — Order interface строки 13-62, OrderFormData строки 83-143
- `C:\OrderApp\src\App.tsx` — текущие маршруты строки 31-45
- `C:\OrderApp\src\i18n\en.json`, `ru.json`, `he.json` — все существующие ключи
- `C:\OrderApp\src\components\FormField.tsx` — все экспортируемые классы строки 26-32
- `C:\Dashboard\worker\src\security\auth.ts` — AuthContext interface строки 6-12

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — прямое чтение всех файлов
- Architecture: HIGH — все паттерны подтверждены кодом
- Worker changes: HIGH — сигнатура и вызов верифицированы
- i18n: HIGH — все три файла прочитаны, новые ключи из 04-UI-SPEC.md

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (stable codebase)

---

## RESEARCH COMPLETE

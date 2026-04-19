---
phase: 01-security-data-integrity
fixed_at: 2026-04-20T00:00:00Z
review_path: .planning/phases/01-security-data-integrity/01-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-04-20
**Source review:** `.planning/phases/01-security-data-integrity/01-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 5 (2 Critical + 3 Warning)
- Fixed: 5
- Skipped: 0

## Fixed Issues

### CR-01: Unauthenticated role/prefix trust — API response drives authorization without validation

**Files modified:** `src/context/AuthContext.tsx`
**Commit:** 30961b1
**Applied fix:** Добавлен allowlist `['admin', 'salesman']` перед сохранением роли. Если `data.role` отсутствует или не входит в список — сессия отклоняется с сообщением `'Invalid session data. Please contact support.'`. Убрана небезопасная конструкция `(data.role as User['role']) || 'salesman'`.

---

### CR-02: Hardcoded Google OAuth Client ID in source code

**Files modified:** `src/context/AuthContext.tsx`, `.gitignore`, `.env.example`
**Commit:** 1e79c00
**Applied fix:** `GOOGLE_CLIENT_ID` перенесён в `import.meta.env.VITE_GOOGLE_CLIENT_ID` с runtime-проверкой (`throw new Error` при отсутствии значения). Создан `.env` с реальным значением (добавлен в `.gitignore`), создан `.env.example` с placeholder для документации. В `.gitignore` добавлены строки для `.env`, `.env.local`, `.env.*.local`.

---

### WR-01: Unbounded recursive retry loop for Google SDK polling

**Files modified:** `src/context/AuthContext.tsx`
**Commit:** 1ff9e40
**Applied fix:** Цикл `initGoogle` ограничен `MAX_ATTEMPTS = 30` (~6 секунд при интервале 200мс). При достижении лимита пользователю показывается сообщение `'Google Sign-In failed to load. Please refresh the page.'`. `timerId` сохраняется и отменяется через `clearTimeout(timerId)` в cleanup-функции `useEffect`.

---

### WR-02: Unsafe JSON.parse of localStorage user data — no schema validation

**Files modified:** `src/context/AuthContext.tsx`
**Commit:** d641ba6
**Applied fix:** Инициализатор `useState` обёрнут в `try/catch`. Добавлена минимальная валидация формы: проверка `typeof parsed?.email === 'string'`, `typeof parsed?.token === 'string'` и наличие роли в allowlist `['admin', 'salesman']`. При невалидных данных или ошибке парсинга вызывается `localStorage.removeItem('user')` и возвращается `null`.

---

### WR-03: authError displays raw backend error strings

**Files modified:** `src/context/AuthContext.tsx`
**Commit:** 30961b1 (зафиксирован совместно с CR-01)
**Applied fix:** Вместо `data.error || 'Access denied'` применяется маппинг HTTP-статусов на фиксированные строки: 403 → `'Access denied. Your account is not authorized.'`, 429 → `'Too many attempts. Please wait and try again.'`, иначе → `'Authentication failed. Please try again.'`. Сырые строки из API-ответа больше не передаются пользователю.

---

## Skipped Issues

Нет — все 5 находок в области видимости успешно исправлены.

---

**TypeScript verification:** `npx tsc --noEmit` завершился без ошибок после всех исправлений.

---

_Fixed: 2026-04-20_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_

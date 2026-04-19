---
phase: 01-security-data-integrity
reviewed: 2026-04-20T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/pages/LoginPage.tsx
  - src/context/AuthContext.tsx
  - src/context/OrderFormContext.tsx
findings:
  critical: 2
  warning: 3
  info: 2
  total: 7
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-20
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Three files were reviewed: the login page, the auth context, and the order form context. The login page itself is minimal and clean. The auth and form contexts carry the real risk surface. Two critical issues were found: user data from the API is trusted and stored without validation (enabling privilege escalation via a compromised or spoofed API response), and the Google Client ID is hardcoded in source — a public repository would expose it permanently. Three warnings cover a potential infinite retry loop in the Google SDK polling, an unsanitized `authError` rendered directly, and unsafe `JSON.parse` of localStorage user data with no schema validation. Two informational items cover a stale comment and a minor `void` idiom.

---

## Critical Issues

### CR-01: Unauthenticated role/prefix trust — API response drives authorization without validation

**File:** `src/context/AuthContext.tsx:60-67`

**Issue:** The `role` and `order_prefix` fields returned by the backend are accepted and stored verbatim with no client-side validation. If the API endpoint is compromised, returns unexpected data, or a man-in-the-middle attack occurs (e.g., missing certificate pinning), an attacker can return `role: "admin"` for any authenticated user. The `isAdmin` flag computed at line 132 is derived entirely from this stored value — there is no secondary check.

More concretely: the cast on line 65 (`data.role as User['role']`) silently accepts any string. If `data.role` is `"superuser"` or `undefined`, the cast does not throw; TypeScript erases it at runtime. The fallback `|| 'salesman'` only fires for falsy values, not for arbitrary strings that aren't `'admin'` or `'salesman'`.

**Fix:** Allowlist the role before storing it, and reject the session if the value is not recognized:

```typescript
const ALLOWED_ROLES: User['role'][] = ['admin', 'salesman']
const rawRole = data.role

if (!rawRole || !ALLOWED_ROLES.includes(rawRole as User['role'])) {
  setAuthError('Invalid session data. Please contact support.')
  setIsLoading(false)
  return
}

const newUser: User = {
  email: data.email || '',
  name: data.name || '',
  picture: data.picture || '',
  prefix: data.order_prefix || 'INNO',
  role: rawRole as User['role'],
  token: data.token,
}
```

Additionally, ensure all admin-gated operations are enforced server-side and treat the client-side `isAdmin` flag as display-only.

---

### CR-02: Hardcoded Google OAuth Client ID in source code

**File:** `src/context/AuthContext.tsx:3`

**Issue:** `GOOGLE_CLIENT_ID` is hardcoded as a string literal. If this repository is or ever becomes public, this ID is permanently embedded in git history and cannot be safely rotated without also rotating the OAuth app. Even in a private repo this is a poor practice — the ID should be supplied at build time via an environment variable so it can differ between environments and be rotated without code changes.

**Fix:**

```typescript
// In .env (committed as .env.example, actual .env in .gitignore)
// VITE_GOOGLE_CLIENT_ID=834868664035-f5kq50i6lb6etvm3v7bh63heft2tttja.apps.googleusercontent.com

// In AuthContext.tsx
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
if (!GOOGLE_CLIENT_ID) throw new Error('VITE_GOOGLE_CLIENT_ID is not configured')
```

The same applies to `API_BASE` at line 4, though a base URL is lower-risk than an OAuth credential.

---

## Warnings

### WR-01: Unbounded recursive retry loop for Google SDK polling

**File:** `src/context/AuthContext.tsx:78-90`

**Issue:** `initGoogle` calls itself via `setTimeout(initGoogle, 200)` indefinitely until `window.google.accounts.id` exists. If the Google Identity Services script never loads (network failure, ad-blocker, CSP block), this loop runs forever — every 200 ms — for the lifetime of the component. There is no maximum retry count, no timeout, and no user-facing error. The effect cleanup function does not cancel pending timeouts, so after `AuthProvider` unmounts the timer can still fire against a dead component.

**Fix:**

```typescript
useEffect(() => {
  let attempts = 0
  const MAX_ATTEMPTS = 30 // 6 seconds
  let timerId: ReturnType<typeof setTimeout>

  const initGoogle = () => {
    if (!(window as any).google?.accounts?.id) {
      if (++attempts >= MAX_ATTEMPTS) {
        setAuthError('Google Sign-In failed to load. Please refresh the page.')
        return
      }
      timerId = setTimeout(initGoogle, 200)
      return
    }
    (window as any).google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: true,
    })
  }

  initGoogle()
  return () => clearTimeout(timerId)
}, [handleGoogleResponse])
```

---

### WR-02: Unsafe `JSON.parse` of localStorage user data — no schema validation

**File:** `src/context/AuthContext.tsx:27-30`

**Issue:** On initial mount, `localStorage.getItem('user')` is parsed and used directly as the `User` object with no validation:

```typescript
const saved = localStorage.getItem('user')
return saved ? JSON.parse(saved) : null
```

`localStorage` is writable by any JavaScript running on the same origin (e.g., a browser extension, an XSS payload on another page, or direct manipulation in DevTools). A crafted `user` object with `role: "admin"` stored in localStorage would immediately grant admin privileges on page load — bypassing the Google auth flow entirely. The `JSON.parse` also throws on malformed JSON, which is unhandled here (unlike the equivalent in `OrderFormContext` which uses `try/catch`).

**Fix:**

```typescript
const [user, setUser] = useState<User | null>(() => {
  try {
    const saved = localStorage.getItem('user')
    if (!saved) return null
    const parsed = JSON.parse(saved)
    // Minimal shape + role validation
    const ALLOWED_ROLES: User['role'][] = ['admin', 'salesman']
    if (
      typeof parsed?.email !== 'string' ||
      typeof parsed?.token !== 'string' ||
      !ALLOWED_ROLES.includes(parsed?.role)
    ) {
      localStorage.removeItem('user')
      return null
    }
    return parsed as User
  } catch {
    localStorage.removeItem('user')
    return null
  }
})
```

Note: even with this fix, treat the client-side role as a UX hint only. Server-side authorization is the real enforcement layer.

---

### WR-03: `authError` rendered without XSS mitigation

**File:** `src/pages/LoginPage.tsx:34-39` / `src/context/AuthContext.tsx:55`

**Issue:** `authError` originates from `data.error` — a string returned by the backend API. It is rendered directly in JSX:

```tsx
{authError && (
  <div ...>
    {authError}
  </div>
)}
```

React's JSX text interpolation (`{authError}`) is safe against XSS on its own — React escapes string children. However, the risk pattern is that `authError` is set from `data.error || 'Access denied'` (line 55 of AuthContext), and `data` is a raw API response cast with `as { ... error?: string }`. If the API is ever compromised or the error field contains a URL or special characters, they will render as visible text (safe), but if this ever gets changed to `dangerouslySetInnerHTML` or a rich-text renderer, it becomes dangerous. The immediate concern is that error messages from a third-party backend should be treated as untrusted and ideally mapped to a fixed set of user-facing strings.

**Fix:** Map backend error strings to safe, localized messages rather than displaying them verbatim:

```typescript
// In handleGoogleResponse:
const userMessage =
  res.status === 403 ? 'Access denied. Your account is not authorized.' :
  res.status === 429 ? 'Too many attempts. Please wait and try again.' :
  'Authentication failed. Please try again.'

setAuthError(data.allowed === false ? userMessage : 'Authentication failed. Please try again.')
```

---

## Info

### IN-01: Stale comment — `totalSteps` discrepancy

**File:** `src/context/OrderFormContext.tsx:26`

**Issue:** The comment `// Was 6, Step1 removed (all automatic)` is an inline changelog note. It reveals a past architectural decision but has no runtime value. The comment being in source rather than git history means it will accumulate over time and is easily missed during future refactors.

**Fix:** Remove the inline comment. The git history captures this context. If a note is warranted, it belongs in the git commit message or a component-level JSDoc.

---

### IN-02: `void image_files` idiom is non-standard — use `_` prefix naming instead

**File:** `src/context/OrderFormContext.tsx:30-31`

**Issue:**

```typescript
const { image_files, ...rest } = form
void image_files
```

Using `void expr` to suppress an "unused variable" lint warning is unconventional in TypeScript/React projects. The standard approach is to use an underscore-prefixed name to signal intentional discard.

**Fix:**

```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { image_files: _imageFiles, ...rest } = form
```

Or, if your tsconfig/eslint supports it:

```typescript
const { image_files: _, ...rest } = form
```

---

_Reviewed: 2026-04-20_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

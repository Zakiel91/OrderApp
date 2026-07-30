# Innovation Diamonds — Order App

Mobile-first PWA where salespeople file jewelry **production** and **repair** orders.
Production: <https://orders.innovationdia.com>

> Hard rules, permanent decisions and non-obvious causes live in [`CLAUDE.md`](./CLAUDE.md).
> This file is orientation; that file is binding.

---

## Architecture

This repository is **frontend only**.

| Piece | Location | Deploys to |
|---|---|---|
| This app | `C:\OrderApp` | Cloudflare Pages project **`order-app`** |
| API | `C:\Dashboard\worker` | Worker **`innovation-diamonds-api`** |
| Database | Cloudflare D1 `innovation-diamonds` | — |
| Order photos | Cloudflare R2 `order-app-images` | — |

The worker is **shared with the Innovation Dashboard**. Never create a second worker for
the Order App — every backend change goes into `C:\Dashboard\worker`, and
`C:\Dashboard\CLAUDE.md` is authoritative for worker rules, schema and infra.

There is no separate staging environment. `dev` runs against the production worker.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind 4 · react-router 7 · vite-plugin-pwa

## Getting started

```bash
npm install
npm run dev
```

`.env` (gitignored) needs:

```
VITE_GOOGLE_CLIENT_ID=<Google OAuth client id>
VITE_API_BASE=                # optional; defaults to the production worker
```

Without `VITE_GOOGLE_CLIENT_ID` the app still renders and reports the misconfiguration
on the login screen instead of failing blank.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b && vite build` — fails on any type error |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the built `dist/` |
| `npm run deploy` | Build, then push `dist/` to Pages project `order-app` |

There are **no automated tests in this repo**. Verification is `tsc` + `build` + `lint`
plus manual UAT. The worker has its own suite (`npm test` in `C:\Dashboard\worker`).

## Layout

```
src/
  pages/        route-level screens (orders list, detail, edit, settings, login)
  steps/        production wizard, 5 steps
  fix-steps/    repair wizard, 3 steps
  components/   shared UI; measurements/ holds the per-jewelry-type sizers
  context/      Auth, Language, OrderForm, FixForm, WizardNav
  hooks/        useClientLookup (debounced client search with race guards)
  lib/          api, validation, config, constants, types, measurements, imageUtils
  i18n/         en / he / ru — keys must exist in all three
```

## How it works

**Two wizards, one navigation contract.** `WizardNavContext` holds the current step,
the submit handler and the validation errors. `BottomNav` renders Back/Next/Submit and
is the single gate: "Next" validates the current step, "Submit" re-validates every step
and jumps back to the first failure. Rules live in `lib/validation.ts` — a `required`
marker in the UI without a matching rule there is decorative and therefore a bug.

**Drafts.** Both wizards persist to `localStorage` (`order_draft`, `fix_draft`), debounced,
and clear the draft on successful submit. Attached files are never persisted.

**Auth.** Google Sign-In → the worker mints a JWT valid for 30 days. A 401 clears the
session and says so; an expired token is detected at startup.

**Order numbers.** A single global counter across all prefixes — only the prefix changes
per salesperson. See `CLAUDE.md` before touching anything related.

**Photos.** Compressed in-browser, uploaded to R2 through authenticated worker endpoints.
Because `<img src>` cannot send a JWT, stored photos render via `AuthImage`, which fetches
the bytes and wraps them in a blob URL.

**Languages.** English, Hebrew (RTL) and Russian, selected in Settings. One language at a
time — never render two languages side by side in the same label.

## Deploying

Order matters: **worker first**, then the frontend. Shipping the frontend against an older
worker means the UI calls endpoints that do not exist yet.

```powershell
# 1. API — from C:\Dashboard\worker, following that repo's auth rule
. C:\Dashboard\.cloudflare-token.ps1; cd C:\Dashboard\worker; npx wrangler deploy

# 2. Frontend
cd C:\OrderApp; npm run deploy
```

**Cloudflare Pages decides production vs preview from the current git branch.** Deploying
while checked out on a feature branch produces a *preview* URL and silently leaves
production untouched — the command still prints success. Merge to `main` first, or pass
`--branch main` deliberately. Verify with:

```powershell
npx wrangler pages deployment list --project-name order-app
```

## Known state

- ESLint reports 8 `react-refresh/only-export-components` errors. Every context file
  exports a provider and its hook from one module; clearing them means splitting the
  context layer across three files each. Dev-only (Fast Refresh), does not affect builds.
- Unused: `components/AutoComplete.tsx`, `lib/api.ts → getFilters()`.
- Form fields with no UI and no submit path: `necklace_has_pendant`,
  `necklace_pendant_drop`, `bracelet_fit`, `earring_wire_thickness`.
- The orders list pages client-side; search and status filters apply only to loaded rows.

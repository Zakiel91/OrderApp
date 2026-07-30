# CLAUDE.md — Innovation Diamonds Order App

Hard rules, permanent decisions, and critical architecture facts.
> **Meta-rule:** When a new decision is made or a bug fixed with non-obvious cause, add it here immediately.

## Environment
- User's terminal: **Windows PowerShell**. Use PowerShell syntax for any commands suggested to the user (e.g., `$env:VAR`, `;` not `&&`, backslashes in paths). Use the `PowerShell` tool (not `Bash`) for interactive commands unless bash is explicitly needed.

## Design Skills
- **Sketch findings for OrderApp** → `Skill("sketch-findings-OrderApp")`

---

## Architecture

### Two repos, one shared API worker
- **This repo** (`C:\OrderApp`): React PWA frontend — `orders.innovationdia.com`
- **API worker** (`C:\Dashboard\worker`): shared Cloudflare Worker for Dashboard + Order App
- **Never create a separate worker for the Order App.** All backend changes go to `C:\Dashboard\worker`.
- `C:\Dashboard\CLAUDE.md` is authoritative for worker rules, DB schema, and infra. Check it before touching backend.

### Deploy
**Worker first, frontend second.** Shipping the frontend against an older worker means the
UI calls endpoints that don't exist yet.

```powershell
# 1. API worker — dot-source the token in the SAME command (C:\Dashboard\CLAUDE.md rule:
#    do NOT rely on `wrangler login`, the OAuth identity drifts between accounts)
. C:\Dashboard\.cloudflare-token.ps1; cd C:\Dashboard\worker; npx wrangler deploy

# 2. Frontend → Cloudflare Pages project "order-app" (NOT "orders-innovationdia")
cd C:\OrderApp; npm run deploy
```

**Pages picks production vs preview from the current git branch.** Deploying from a
feature branch creates a *preview* deployment, prints a normal success message, and leaves
production untouched — silent no-op. Merge to `main` before deploying, or pass
`--branch main` on purpose. Confirm afterwards, never assume:
```powershell
npx wrangler pages deployment list --project-name order-app   # top row must be Production / main
```
Happened 2026-07-30: a deploy from `fix/frontend-audit-2026-07-30` looked successful while
`orders.innovationdia.com` stayed on a three-month-old build.

---

## Order Numbering (DO NOT REVERT)
Global counter across all prefixes — only the prefix changes per salesman.
- `handleCreateOrder` takes `MAX(numeric suffix)` over all **active production prefixes**
  (`INNO,JOR,RAV,MOR,AMIT,RAN,ROM,IDO,DAN,TOM,GRE`) with a floor of `1858`.
  It is deliberately **not** per-prefix, and deliberately **not** `ORDER BY id DESC LIMIT 1`
  (that was fooled by out-of-sequence imports).
- Example: last order INNO1818 → next for Ravid is RAV1819

---

## Order App Users
- Roles: `salesman` (own prefix only) or `admin` (all orders)
- Managed in Dashboard → Settings → Order App Users
- JWT lifetime: **30 days** — 401 means token expired → manual logout/login (auto-logout not implemented)

### Identity (DO NOT REVERT)
`NewOrderPage` force-sets `order_prefix` and `salesman_name` from JWT — stale localStorage draft cannot override.

### Fields saved on creation (DO NOT REVERT)
`handleCreateOrder` saves `salesman_name`, `client_phone`, `client_email` — required for ownership filter in `handleListOrders`.

---

## Prefixes

### Adding a new prefix — update TWO places
1. `C:\Dashboard\worker\src\routes\orderAppUsers.ts` — `PREFIXES` array (unknown prefix silently falls back to `INNO`)
2. `C:\OrderApp\src\lib\constants.ts` — `ACTIVE_PREFIXES` array

`FIX` is in `constants.ts` only (repair orders only, not assignable to users).

### Active
`INNO`, `JOR`, `RAV`, `MOR`, `AMIT`, `RAN`, `ROM`, `IDO`, `DAN`, `TOM`, `GRE`, `FIX`

### Inactive (do not use)
`MAL`, `GABI`, `ERP`, `SKU`, `SAB`

Format: `PREFIX####` (e.g., `RAV1819`), global counter ~18xx.

---

## localStorage keys
| Key | Content |
|---|---|
| `user` | `{ email, name, picture, prefix, role, token }` — JWT session |
| `order_draft` | New production order in progress |
| `fix_draft` | Fix/repair order in progress |

Logout clears all three.

---

## Delete
Visible for all orders on `OrderDetailPage`; server rejects with 403 if `status ≠ 'new'`.

---

## Order images (R2)
- Frontend: `src/lib/imageUtils.ts` → `POST /api/images/upload`, `GET /api/images/get?key=…`.
- Both endpoints **require the JWT**. `<img src>` cannot send headers, so stored
  images are rendered through `AuthImage` (authenticated fetch → blob URL, revoked
  on unmount). Never switch back to a bare `<img src={apiUrl}>`.
- Worker side lives in `C:\Dashboard\worker\src\routes\orderImages.ts` and needs the
  `ORDER_IMAGES` R2 binding in `wrangler.toml`. Keys are `orders/<order_id>/<uuid>.<ext>`;
  the key pattern is validated server-side and ownership is checked per order.
- Upload failures must stay visible: the wizard shows `images_upload_failed` instead of
  swallowing the error (it silently discarded every photo for months).

## Wizard validation (DO NOT REVERT)
`required` markers are enforced in `src/lib/validation.ts`, gated in `BottomNav`:
- "Next" runs `validateStep(step)`; "Submit" runs `validateAll()` and jumps back to the
  first failing step. Errors surface via `WizardNavContext` → `FormField error=`.
- Before this, the asterisks were decorative and an order could be created with no
  client name and no deadline.

## One field, one state
Several inputs used to share `form.comment` and overwrote each other. Each now owns a field:
- `other_type` — free text for jewelry type "other" (sent as `description`)
- `finger_notes` — RingSizer note (appended to `comment` on submit; no DB column)
- `comment` — the Comments textarea only

## Never fake a selection
Do not render `value={form.x || options[0]}`. It shows a selection that is not in the
payload (this silently dropped `collection_style` and `client_country`). Use an explicit
empty `<option>` instead.

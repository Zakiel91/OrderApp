# Order App — Requirements

**Milestone:** Mobile UX Overhaul
**Last updated:** 2026-04-19

---

## Active Requirements

### UX — User Experience

| ID | Requirement | Phase | Status |
|----|-------------|-------|--------|
| UX-01 | Scroll position resets to top on step change (no mid-page start) | Phase 2 | Pending |
| UX-02 | Step indicator shows current position visually on every step screen | Phase 3 | Pending |
| UX-03 | All tap targets ≥ 48px height (thumb-friendly) | Phase 2 | Pending |
| UX-04 | Draft saved indicator visible in the wizard ("Draft saved ✓") | Phase 3 | Pending |
| UX-05 | Smooth step transitions (no jarring layout shift) | Phase 3 | Pending |
| UX-06 | Bottom navigation stays fixed — buttons never scroll off screen | Phase 2 | Pending |

### BUG — Bug Fixes

| ID | Requirement | Phase | Status |
|----|-------------|-------|--------|
| BUG-01 | JWT issued at login — API calls succeed for all users | Phase 0 | Complete |
| BUG-02 | Server-side order filtering by salesman | Phase 0 | Complete |
| BUG-03 | Delete restricted to own orders (ownership check) | Phase 0 | Complete |
| BUG-04 | Dev PIN 9119 stripped from production build | Phase 1 | Pending |
| BUG-05 | `image_files` stripped before localStorage serialise in OrderFormContext | Phase 1 | Pending |

### FEAT — New Features

| ID | Requirement | Phase | Status |
|----|-------------|-------|--------|
| FEAT-01 | Order edit UI — salespeople can edit their own pending orders | Phase 4 | Pending |
| FEAT-02 | "My Orders" shows order count and has a search/filter bar | Phase 4 | Pending |
| FEAT-03 | Error message shown when orders fail to load (not silent empty list) | Phase 4 | Pending |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 0 | Complete |
| BUG-02 | Phase 0 | Complete |
| BUG-03 | Phase 0 | Complete |
| BUG-04 | Phase 1 | Pending |
| BUG-05 | Phase 1 | Pending |
| UX-01 | Phase 2 | Pending |
| UX-03 | Phase 2 | Pending |
| UX-06 | Phase 2 | Pending |
| UX-02 | Phase 3 | Pending |
| UX-04 | Phase 3 | Pending |
| UX-05 | Phase 3 | Pending |
| FEAT-01 | Phase 4 | Pending |
| FEAT-02 | Phase 4 | Pending |
| FEAT-03 | Phase 4 | Pending |

**Coverage: 14/14 — 100%**

---

## Out of Scope

| Item | Reason |
|------|--------|
| Hard mandatory field blocking | User preference: salespeople stay flexible; soft errors only |
| Pagination | 200-order limit per salesman is acceptable |
| Offline support / service worker caching | Not in milestone scope |
| Push notifications | Not in milestone scope |

---

## Validated (Existing Features)

- New Order wizard (5 steps)
- Fix Order wizard (3 steps)
- Google One Tap login
- Multi-language (Hebrew, English, Russian)
- My Orders list
- Order detail + delete
- Draft saved in localStorage

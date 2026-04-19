# Order App — Mobile UX Overhaul

**Type:** Brownfield improvement milestone
**Codebase:** `C:\OrderApp` — React 19 PWA, Cloudflare Pages + Worker + D1
**Live URL:** `https://orders.innovationdia.com`
**Date:** 2026-04-20

---

## What This Is

A focused improvement milestone for the **Innovation Diamonds Order App** — an internal PWA used by salespeople to create jewelry production orders on their phones (Android + iPhone).

The app already works, but the mobile UX is rough: screens jump on navigation, buttons are too small for fingers, and there's no feedback that a draft is being saved. This milestone fixes that, plus addresses key bugs from the codebase audit and adds missing features.

---

## Core Value

**A salesperson should be able to create a complete order in under 2 minutes on their phone, without confusion, without lost data, and without UI fighting them.**

---

## Users

- **Salespeople** — primary users. Use the app in the field, on Android and iPhone. Not tech-savvy. Need large tap targets, clear flow, fast navigation.
- **Admin** — uses the Dashboard to view all orders. Not a user of this app directly.

---

## Problems Being Solved

| Problem | Impact | Source |
|---------|--------|--------|
| Screen scrolls to top on step navigation | Disorienting on phone | User report |
| Step transitions feel slow | Frustration | User report |
| No visual indicator that draft is saved | Anxiety — "did I lose my work?" | User report |
| Everything too small for fingers | Mis-taps, frustration | User report |
| No form validation — empty orders can be submitted | Bad data in DB | Concerns.md |
| JWT not issued at login — API calls fail with 401 | App broken for new users | Bug audit |
| Client-side order filtering — >200 orders missed | Salespeople miss their own orders | Bug audit |
| Delete has no ownership check | Any salesman can delete any order | Security |
| Dev PIN 9119 in production build | Security risk | Concerns.md |

---

## Requirements

### Validated (already exists)
- ✓ New Order wizard (5 steps)
- ✓ Fix Order wizard (3 steps)
- ✓ Google One Tap login
- ✓ Multi-language (Hebrew, English, Russian)
- ✓ My Orders list
- ✓ Order detail + delete
- ✓ Draft saved in localStorage

### Active (this milestone)
- [ ] **UX-01** Scroll position resets to top on step change (no more jumping)
- [ ] **UX-02** Step indicator shows current position visually on every step screen
- [ ] **UX-03** All tap targets ≥ 48px height (thumb-friendly)
- [ ] **UX-04** Draft saved indicator visible in the wizard (e.g. "Draft saved ✓")
- [ ] **UX-05** Smooth step transitions (no jarring layout shift)
- [ ] **UX-06** Bottom navigation stays fixed — buttons never scroll off screen
- [ ] **BUG-01** JWT issued at login — API calls succeed for all users
- [ ] **BUG-02** Server-side order filtering by salesman (already done ✓)
- [ ] **BUG-03** Delete restricted to own orders (already done ✓)
- [ ] **BUG-04** Dev PIN 9119 stripped from production build
- [ ] **BUG-05** `image_files` stripped before localStorage serialise in OrderFormContext
- [ ] **FEAT-01** Order edit UI — salespeople can edit their own pending orders
- [ ] **FEAT-02** "My Orders" shows order count and has a search/filter bar
- [ ] **FEAT-03** Error message shown when orders fail to load (not silent empty list)

### Out of Scope
- Hard mandatory field blocking ("next" always works) — user preference
- Pagination (200 limit is fine per salesman)
- Offline support / service worker caching
- Push notifications

---

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No hard validation blocking | User wants salespeople to stay flexible | Soft errors only (highlight missing fields, allow proceed) |
| Server-side salesman filter | Already implemented in this session | Done |
| Brownfield — existing code preserved | Milestone adds on top of existing app | Additive changes only |

---

## Tech Context (from Obsidian docs)

- **Stack:** React 19, TypeScript, Vite, Tailwind CSS, PWA
- **Backend:** Cloudflare Worker (shared with Dashboard), D1 database
- **Auth:** Google One Tap → JWT → localStorage
- **State:** Context providers (OrderFormContext, FixFormContext, AuthContext, LanguageContext)
- **Wizard pattern:** `STEPS[step-1]` component swap, Back/Next in page component
- **Codebase docs:** `D:\Dropbox\OBS\Order App\`

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-20 after initialization*

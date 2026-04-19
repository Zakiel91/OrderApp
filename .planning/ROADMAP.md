# Order App — Mobile UX Overhaul: Roadmap

**Milestone:** Mobile UX Overhaul
**Granularity:** Standard (5-8 phases)
**Coverage:** 11/11 active requirements mapped (3 already complete)

---

## Phases

- [x] **Phase 0: Completed This Session** — BUG-01, BUG-02, BUG-03 resolved in prior session work
- [ ] **Phase 1: Security & Data Integrity** — Strip dev PIN from production; prevent image blobs in localStorage
- [ ] **Phase 2: Mobile UX Foundation** — Scroll resets, fixed bottom nav, thumb-friendly tap targets
- [ ] **Phase 3: Wizard Polish** — Step indicator, draft saved indicator, smooth step transitions
- [ ] **Phase 4: Orders Features** — Edit UI for pending orders, search/filter bar, error states

---

## Phase Details

### Phase 0: Completed This Session
**Goal**: Security and data bugs resolved in the active development session
**Depends on**: Nothing
**Requirements**: BUG-01, BUG-02, BUG-03
**Success Criteria** (what must be TRUE):
  1. A salesperson can log in with Google One Tap and all subsequent API calls succeed (JWT issued at login)
  2. My Orders list shows all of a salesperson's orders regardless of total order count in the database
  3. A salesperson cannot delete an order that belongs to a different salesperson
**Plans**: Complete
**Status**: Done

---

### Phase 1: Security & Data Integrity
**Goal**: The production build contains no development backdoors and draft state never bloats localStorage with binary data
**Depends on**: Phase 0
**Requirements**: BUG-04, BUG-05
**Success Criteria** (what must be TRUE):
  1. Entering PIN 9119 on the production login screen does not grant access (dev shortcut is gone)
  2. After filling in the order wizard (including attaching images), localStorage draft data contains no binary image content — only metadata
  3. The app bundle ships to production with no hardcoded PIN constant visible in the compiled output
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Remove IS_DEV, DEV_CODE, loginWithDevCode from LoginPage.tsx and AuthContext.tsx (BUG-04)
- [ ] 01-02-PLAN.md — Strip image_files before localStorage write in OrderFormContext.tsx (BUG-05)

---

### Phase 2: Mobile UX Foundation
**Goal**: Navigating between wizard steps feels natural on a phone — no jumps, no off-screen buttons, no mis-taps
**Depends on**: Phase 1
**Requirements**: UX-01, UX-03, UX-06
**Success Criteria** (what must be TRUE):
  1. When a salesperson taps Next or Back, the new step renders with scroll position at the top (no mid-page start)
  2. The Back and Next buttons are always visible without scrolling, regardless of step content length
  3. Every tappable control in the wizard (buttons, inputs, selects, checkboxes) has a touch target of at least 48px in height
**Plans**: TBD
**UI hint**: yes

---

### Phase 3: Wizard Polish
**Goal**: The wizard communicates clearly where the salesperson is and that their work is safe
**Depends on**: Phase 2
**Requirements**: UX-02, UX-04, UX-05
**Success Criteria** (what must be TRUE):
  1. On every wizard step, the salesperson can see which step they are on (e.g. "Step 2 of 5") without scrolling
  2. After any input change, a "Draft saved" indicator becomes visible in the wizard within 1 second
  3. Moving between steps shows a smooth visual transition with no jarring layout shift or flash
**Plans**: TBD
**UI hint**: yes

---

### Phase 4: Orders Features
**Goal**: Salespeople can find, edit, and understand the state of their orders without confusion
**Depends on**: Phase 3
**Requirements**: FEAT-01, FEAT-02, FEAT-03
**Success Criteria** (what must be TRUE):
  1. A salesperson can tap an order in "My Orders" that is still pending and edit its details, then save the changes
  2. My Orders shows the total count of orders and a search/filter bar that narrows the list as the salesperson types or selects a filter
  3. When the orders list fails to load (network error, server error), the salesperson sees a clear error message — not a silent empty list
**Plans**: TBD
**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Completed This Session | 3/3 | Done | 2026-04-19 |
| 1. Security & Data Integrity | 0/2 | Not started | - |
| 2. Mobile UX Foundation | 0/2 | Not started | - |
| 3. Wizard Polish | 0/2 | Not started | - |
| 4. Orders Features | 0/3 | Not started | - |

---

## Coverage Map

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

**Total: 14/14 requirements mapped. Coverage: 100%.**

# Order App — Mobile UX Overhaul: Roadmap

**Milestone:** Mobile UX Overhaul
**Granularity:** Standard (5-8 phases)
**Coverage:** 11/11 active requirements mapped (3 already complete)

---

## Phases

- [x] **Phase 0: Completed This Session** — BUG-01, BUG-02, BUG-03 resolved in prior session work
- [x] **Phase 1: Security & Data Integrity** — Strip dev PIN from production; prevent image blobs in localStorage
- [x] **Phase 2: Mobile UX Foundation** — Scroll resets, fixed bottom nav, thumb-friendly tap targets (complete 2026-04-20)
- [x] **Phase 3: Wizard Polish** — Step indicator, draft saved indicator, smooth step transitions (complete 2026-04-20)
- [x] **Phase 4: Orders Features** — Edit UI for pending orders, search/filter bar, error states (complete 2026-04-21)
- [x] **Phase 5: Order Detail Redesign** — iPhone-native order detail page: sticky header, tabs, bottom sheet editing (complete 2026-04-26)

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
- [x] 01-01-PLAN.md — Remove IS_DEV, DEV_CODE, loginWithDevCode from LoginPage.tsx and AuthContext.tsx (BUG-04)
- [x] 01-02-PLAN.md — Strip image_files before localStorage write in OrderFormContext.tsx (BUG-05)

---

### Phase 2: Mobile UX Foundation
**Goal**: Navigating between wizard steps feels natural on a phone — no jumps, no off-screen buttons, no mis-taps
**Depends on**: Phase 1
**Requirements**: UX-01, UX-03, UX-06
**Success Criteria** (what must be TRUE):
  1. When a salesperson taps Next or Back, the new step renders with scroll position at the top (no mid-page start)
  2. The Back and Next buttons are always visible without scrolling, regardless of step content length
  3. Every tappable control in the wizard (buttons, inputs, selects, checkboxes) has a touch target of at least 48px in height
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — WizardNavContext + extend OrderFormContext/FixFormContext + register submit in Step6Review/FixStep3Review (UX-06 foundation)
- [x] 02-02-PLAN.md — BottomNav wizard mode (Back/Next/Submit) + scroll reset + remove inline buttons (UX-01, UX-06)
- [x] 02-03-PLAN.md — Touch target fixes in Step2Client and Step4Stones (UX-03)
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
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — DraftSavedToast component + draft_saved i18n keys (en/he/ru) + CSS keyframes (fadeIn, slideInLeft, slideInRight) (UX-04, UX-05 foundations)
- [x] 03-02-PLAN.md — Wire toast + direction-aware transitions into NewOrderPage and FixOrderPage; verify UX-02 (UX-02, UX-04, UX-05)
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
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md — Worker ownership + status checks (T-4-01, T-4-02) + i18n keys + EditOrderPage + OrderDetailPage Edit button + App.tsx route (FEAT-01)
- [x] 04-02-PLAN.md — MyOrdersPage: search/filter bar, order count, error card with Retry (FEAT-02, FEAT-03)
**UI hint**: yes

---

### Phase 5: Order Detail Redesign
**Goal**: The order detail page feels like a native iPhone receipt — sticky header with quick actions, tabbed sections, and tap-to-edit fields that open a bottom sheet
**Depends on**: Phase 4
**Requirements**: DET-01, DET-02, DET-03, DET-04
**Success Criteria** (what must be TRUE):
  1. The order detail page shows a sticky header with the order number, status pill, and quick-action buttons (WhatsApp, Edit, Delete) that remain visible while scrolling
  2. Content is organized in 4 tabs (Client / Item / Payment / Notes) — no single long scroll
  3. Tapping any editable field opens a bottom sheet; salesperson edits the value and taps Save; the change is persisted to the server
  4. The page uses the iOS system palette (`#f2f2f7` background, white cards, `var(--color-primary)` blue), SF Pro font stack, and 50px minimum row height
**Plans**: 3 plans
**Design**: `.claude/skills/sketch-findings-OrderApp/` (validated design decisions from sketch sessions 001, 002)

Plans:
- [x] 05-01-PLAN.md — iOS design tokens + slideUp keyframe in index.css + 8 new i18n keys in he/en/ru (DET-04)
- [x] 05-02-PLAN.md — Create FieldEditSheet.tsx component — bottom sheet with slideUp animation, save/cancel logic (DET-03, DET-04)
- [x] 05-03-PLAN.md — Rewrite OrderDetailPage.tsx — sticky header, 4 tabs, FieldEditSheet integration, PUT via updateOrder (DET-01, DET-02, DET-03, DET-04)

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Completed This Session | 3/3 | Done | 2026-04-19 |
| 1. Security & Data Integrity | 2/2 | Done | 2026-04-20 |
| 2. Mobile UX Foundation | 3/3 | Done | 2026-04-20 |
| 3. Wizard Polish | 2/2 | Done | 2026-04-20 |
| 4. Orders Features | 2/2 | Done | 2026-04-21 |
| 5. Order Detail Redesign | 3/3 | Done | 2026-04-26 |

---

## Coverage Map

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 0 | Complete |
| BUG-02 | Phase 0 | Complete |
| BUG-03 | Phase 0 | Complete |
| BUG-04 | Phase 1 | Complete |
| BUG-05 | Phase 1 | Complete |
| UX-01 | Phase 2 | Complete |
| UX-03 | Phase 2 | Complete |
| UX-06 | Phase 2 | Complete |
| UX-02 | Phase 3 | Complete |
| UX-04 | Phase 3 | Complete |
| UX-05 | Phase 3 | Complete |
| FEAT-01 | Phase 4 | Complete |
| FEAT-02 | Phase 4 | Complete |
| FEAT-03 | Phase 4 | Complete |

| DET-01 | Phase 5 | Complete |
| DET-02 | Phase 5 | Complete |
| DET-03 | Phase 5 | Complete |
| DET-04 | Phase 5 | Complete |

**Total: 18/18 requirements mapped. Coverage: 100%.**

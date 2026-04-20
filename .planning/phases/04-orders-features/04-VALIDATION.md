---
phase: 4
slug: orders-features
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-21
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — no jest.config / vitest.config / __tests__ detected |
| **Config file** | none |
| **Quick run command** | Manual smoke-check in browser |
| **Full suite command** | Manual walkthrough of all 15 test scenarios below |
| **Estimated runtime** | ~10 minutes (manual) |

---

## Sampling Rate

- **After every task commit:** Manual smoke-check of the changed component in browser (dev server at localhost)
- **After every plan wave:** Run full manual scenario walkthrough for all FEATs in that wave
- **Before `/gsd-verify-work`:** All 15 scenarios in Per-Task Verification Map manually verified ✅
- **Max feedback latency:** Per task (each commit gets a smoke-check before next task starts)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Manual Scenario | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-----------------|--------|
| 4-01-01 | 01 | 1 | FEAT-01 | T-4-01 | handleUpdateOrder rejects 403 if auth.order_prefix ≠ order.order_prefix | manual | curl PUT /api/production/orders with wrong salesman JWT → expect 403 | ⬜ pending |
| 4-01-02 | 01 | 1 | FEAT-01 | — | N/A | manual | Open OrderDetailPage with status=new order → Edit button visible | ⬜ pending |
| 4-01-03 | 01 | 1 | FEAT-01 | — | N/A | manual | Open OrderDetailPage with status=in_production order → no Edit button | ⬜ pending |
| 4-01-04 | 01 | 1 | FEAT-01 | — | N/A | manual | Navigate /orders/:id/edit → form pre-populated with order data | ⬜ pending |
| 4-01-05 | 01 | 1 | FEAT-01 | — | N/A | manual | Edit a field → Save Changes → verify changes on detail page | ⬜ pending |
| 4-01-06 | 01 | 1 | FEAT-01 | — | N/A | manual | Click Cancel → navigate back → no changes saved | ⬜ pending |
| 4-01-07 | 01 | 1 | FEAT-01 | — | N/A | manual | DevTools offline → Save Changes → see inline save_error banner | ⬜ pending |
| 4-02-01 | 02 | 1 | FEAT-02 | — | N/A | manual | Load MyOrdersPage → see "N orders" count label in header row | ⬜ pending |
| 4-02-02 | 02 | 1 | FEAT-02 | — | N/A | manual | Type client name in search → list narrows to matching orders | ⬜ pending |
| 4-02-03 | 02 | 1 | FEAT-02 | — | N/A | manual | Type order number partial string → list narrows to matching orders | ⬜ pending |
| 4-02-04 | 02 | 1 | FEAT-02 | — | N/A | manual | Select status in dropdown → only orders with that status visible | ⬜ pending |
| 4-02-05 | 02 | 1 | FEAT-02 | — | N/A | manual | Active filter → count shows "X of Y" format | ⬜ pending |
| 4-02-06 | 02 | 1 | FEAT-02 | — | N/A | manual | Type non-matching text → see no_orders message in list area | ⬜ pending |
| 4-03-01 | 02 | 1 | FEAT-03 | — | N/A | manual | DevTools → Network → Offline → refresh page → see error card (not empty list) | ⬜ pending |
| 4-03-02 | 02 | 1 | FEAT-03 | — | N/A | manual | After error card → restore network → click Retry → list loads | ⬜ pending |
| 4-03-03 | 02 | 1 | FEAT-03 | — | N/A | manual | Error card visible → header and search bar still visible above error card | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — all verifications are manual (no test infrastructure in project).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Edit button conditional on status=new | FEAT-01 | No component test framework; browser-only verification | Open OrderDetailPage with new/non-new orders; check Edit button presence |
| Worker ownership check (PUT 403) | FEAT-01 (D-05) | Requires real JWT + real D1 — no test harness | Use DevTools Network or curl with salesman JWT to test cross-ownership PUT |
| Search/filter client-side filtering | FEAT-02 | No unit tests for React components | Use browser with 2+ orders; verify filter behavior manually |
| Error card replaces list only | FEAT-03 | Browser-only; requires network simulation | DevTools → offline; verify header visible above error card |
| Retry button restores list | FEAT-03 | Requires real network toggle | DevTools offline → online → click Retry |

---

## Validation Sign-Off

- [ ] All tasks have manual verify scenario documented
- [ ] Sampling continuity: every task commit gets browser smoke-check
- [ ] No automated test infrastructure needed (none exists in project)
- [ ] Wave 0 requirements: "none — no framework to install"
- [ ] Feedback latency: manual check per commit (< 5 min)
- [ ] `nyquist_compliant: true` set in frontmatter after all scenarios pass

**Approval:** pending

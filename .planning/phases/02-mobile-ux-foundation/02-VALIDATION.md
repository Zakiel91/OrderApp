---
phase: 2
slug: mobile-ux-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — no test runner installed |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd-verify-work`:** Full suite must be green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | UX-01 | — | N/A | manual | `npm run build` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | UX-03 | — | N/A | manual | `npm run build` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 2 | UX-06 | — | N/A | manual + build | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm run build` passes after each task — TypeScript compile as smoke test

*No test framework installed — UX behaviors require manual browser verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Scroll resets to top on step change | UX-01 | Requires browser rendering — no test runner | Navigate wizard, tap Next/Back, verify page starts at top |
| All tap targets ≥ 48px | UX-03 | Visual/touch inspection — no test runner | Use browser DevTools to inspect computed height of Clear, toggle, search icon, ✕ chip, stone list items |
| Back/Next/Submit always visible without scrolling | UX-06 | Requires mobile viewport — no test runner | Open /orders/new on mobile (or DevTools mobile emulation), fill long form, verify buttons stay fixed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

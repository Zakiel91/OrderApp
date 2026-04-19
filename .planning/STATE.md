# Order App — Project State

**Last updated:** 2026-04-19
**Milestone:** Mobile UX Overhaul

---

## Project Reference

**Core value:** A salesperson should be able to create a complete order in under 2 minutes on their phone, without confusion, without lost data, and without UI fighting them.

**Codebase:** `C:\OrderApp` — React 19 PWA, Cloudflare Pages + Worker + D1
**Live URL:** https://orders.innovationdia.com

---

## Current Position

**Current phase:** Phase 1 — Security & Data Integrity
**Current plan:** None started
**Status:** Ready to plan Phase 1

```
Progress: [##........] Phase 0 complete (3/14 requirements done)
```

**Phase 0 complete** (BUG-01, BUG-02, BUG-03 — done in this session)
**Phase 1 up next** (BUG-04, BUG-05)

---

## Accumulated Context

### Decisions Made

| Decision | Rationale | Date |
|----------|-----------|------|
| No hard validation blocking | User wants salespeople to stay flexible — soft errors only | 2026-04-19 |
| Server-side salesman filter (BUG-02) | Already implemented in this session | 2026-04-19 |
| JWT issued at login (BUG-01) | Fixed in this session | 2026-04-19 |
| Delete ownership check (BUG-03) | Fixed in this session | 2026-04-19 |
| Phase 0 created retroactively | Three bugs were already resolved; captured as completed phase | 2026-04-19 |

### Known Constraints

- Two worker dirs exist: `C:\Dashboard\worker` is canonical; `C:\OrderApp\Dashboard\worker` is stale — never copy FROM stale to canonical
- Worker is shared with the Dashboard app — changes affect both
- Brownfield: all changes must be additive, no breaking rewrites
- No pagination (200 order limit per salesman is acceptable)
- No offline/service worker caching in scope

### Open Questions

None at this time.

---

## Session Continuity

**To resume this project:**
1. Read `C:\OrderApp\.planning\PROJECT.md` for full context
2. Read `C:\OrderApp\.planning\ROADMAP.md` for phase structure
3. Check progress table in ROADMAP.md to find current phase
4. Run `/gsd-plan-phase 1` to plan Phase 1 work

**Key files:**
- Planning: `C:\OrderApp\.planning\`
- Worker (canonical): `C:\Dashboard\worker\src\`
- Frontend: `C:\OrderApp\src\`
- Docs: `D:\Dropbox\OBS\Order App\`

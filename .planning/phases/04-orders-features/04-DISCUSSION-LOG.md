# Phase 4: Orders Features - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 04-orders-features
**Areas discussed:** Editable statuses, Ownership check, Search/filter, Error state, Edit entry point, Edit client fields

---

## Editable Statuses

| Option | Description | Selected |
|--------|-------------|----------|
| Only 'new' | Fresh orders only — once in production, editing closes | ✓ |
| new + received + on_hold | Broader: all pre-production statuses | |
| Any status | Always editable by salesperson | |

**User's choice:** Only 'new'
**Notes:** Once a jeweller picks up the order, editing should close.

---

## Ownership Check on PUT

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — add ownership check | Same pattern as handleDeleteOrder | ✓ |
| No — skip for now | Internal app, salespeople trust each other | |

**User's choice:** Yes — add ownership check
**Notes:** Auth param needs to be passed to handleUpdateOrder in production.ts, just like handleDeleteOrder.

---

## Search / Filter in My Orders

| Option | Description | Selected |
|--------|-------------|----------|
| Text search + status filter | Input + dropdown, client-side filtering | ✓ |
| Text search only | No status dropdown | |

**User's choice:** Text search + status filter

---

## Order Count Display

| Option | Description | Selected |
|--------|-------------|----------|
| Total + filtered count | "3 of 7" when searching | ✓ |
| Total only | Just the total badge | |

**User's choice:** Total + filtered count

---

## Error State

| Option | Description | Selected |
|--------|-------------|----------|
| Error card + Retry button | Replaces list area, matches OrderDetailPage style | ✓ |
| Inline error banner | Banner at top, empty list stays | |

**User's choice:** Error card + Retry button

---

## Edit Entry Point

| Option | Description | Selected |
|--------|-------------|----------|
| Edit button on OrderDetail page | Opens /orders/:id/edit | ✓ |
| Inline on detail page | In-place editing, no new screen | |

**User's choice:** Edit button on OrderDetailPage → separate /orders/:id/edit screen

---

## Client Lookup in Edit Form

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — include client lookup | Same autocomplete as new order wizard | |
| No — edit form fields only | Plain text inputs, no DB search | ✓ |

**User's choice:** No — plain text fields only

---

## Claude's Discretion

- Edit form field selection (which fields to expose in flat form)
- Edit form layout (sections vs flat list)
- New i18n keys for edit screen
- Exact count label positioning

## Deferred Ideas

- Client lookup in edit form (phone/TZ/name search) — noted, not in scope for Phase 4

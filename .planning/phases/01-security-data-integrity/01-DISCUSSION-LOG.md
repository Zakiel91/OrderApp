# Phase 1: Security & Data Integrity - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 01-security-data-integrity
**Areas discussed:** Dev auth approach, Image draft metadata

---

## Dev auth approach (BUG-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Vite import.meta.env.DEV | Keep dev login for localhost; Vite strips entire block from prod build. PIN not visible in compiled output. | |
| Удалить полностью | Remove DEV_CODE, dev login form, and loginWithDevCode from AuthContext entirely. Devs use Google Auth on localhost. | ✓ |

**User's choice:** Удалить полностью
**Notes:** Devs authenticate via Google One Tap on localhost — same as production. Cleaner, no dead code in bundle.

---

## Image draft metadata (BUG-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Стирать полностью | Strip image_files field entirely from localStorage — no names, no sizes. Matches FixFormContext pattern. | ✓ |
| Сохранять имена файлов | Store [{name, size}] metadata as a reminder that photos were attached. | |

**User's choice:** Стирать полностью
**Notes:** Consistent with existing FixFormContext implementation. Simplest fix — 2 lines of code.

---

## Claude's Discretion

- Whether to check for other non-serialisable fields in OrderFormData beyond image_files
- Exact TypeScript/ESLint suppressions for the void pattern

## Deferred Ideas

None.

# Phase 1: Security & Data Integrity - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove the development backdoor from the production build entirely, and prevent binary image data from being serialised into localStorage when saving order wizard drafts.

Two bugs. Both are security/data-integrity fixes. No new features. No UI changes.

</domain>

<decisions>
## Implementation Decisions

### BUG-04: Dev PIN removal
- **D-01:** Delete the dev auth code **completely** — remove `DEV_CODE = '9119'` constant, the entire `{IS_DEV && ...}` dev login block from `LoginPage.tsx`, and the `loginWithDevCode` callback from `AuthContext.tsx`
- **D-02:** Also remove the `IS_DEV` constant (no longer needed once dev block is gone)
- **D-03:** Developers on localhost will authenticate via Google One Tap, same as production — no special shortcut needed
- **D-04:** The `loginWithDevCode` method must be removed from the `AuthContextType` interface as well (not just the implementation)

### BUG-05: image_files in localStorage
- **D-05:** Strip `image_files` completely before writing to localStorage — no metadata, no file names, no sizes
- **D-06:** Follow the exact pattern already present in `FixFormContext.tsx`:
  ```ts
  const { image_files, ...rest } = form
  void image_files
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
  ```
- **D-07:** Apply only to `OrderFormContext.tsx` — `FixFormContext.tsx` already has the correct implementation

### Claude's Discretion
- Whether to also check for any other non-serialisable fields in OrderFormData (beyond `image_files`) — safe to assess during implementation
- Exact ESLint/TypeScript suppressions needed for `void image_files` line

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

### Files to read before touching anything
- `src/pages/LoginPage.tsx` — contains DEV_CODE, IS_DEV, handleDevLogin, dev UI block
- `src/context/AuthContext.tsx` — contains loginWithDevCode, AuthContextType interface
- `src/context/OrderFormContext.tsx` — contains the useEffect that saves to localStorage (line 28-30)
- `src/context/FixFormContext.tsx` — reference implementation for correct localStorage pattern (lines 29-33)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FixFormContext.tsx` lines 29-33: exact pattern to replicate in OrderFormContext for BUG-05

### Established Patterns
- `LoginPage.tsx` already uses `IS_DEV` as a guard — the entire `{IS_DEV && ...}` JSX block can be deleted in one operation
- `AuthContextType` interface must be updated in sync with `AuthProvider` implementation — both are in `AuthContext.tsx`

### Integration Points
- `LoginPage.tsx` calls `loginWithDevCode` — once that method is removed from AuthContext, the call site in LoginPage must also go (it will be inside the deleted IS_DEV block anyway)
- `AuthContext.tsx` exports `loginWithDevCode` via context — consumers must not reference it after removal (only LoginPage currently does)

</code_context>

<specifics>
## Specific Ideas

- The `void image_files` line in FixFormContext suppresses the "unused variable" lint warning cleanly — use the same idiom in OrderFormContext
- Google One Tap works on localhost (`localhost` is allowed as an origin in Google Console) — no dev workflow disruption expected from removing the PIN shortcut

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-security-data-integrity*
*Context gathered: 2026-04-20*

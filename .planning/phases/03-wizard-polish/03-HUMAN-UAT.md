---
status: partial
phase: 03-wizard-polish
source: [03-VERIFICATION.md]
started: 2026-04-21T00:00:00Z
updated: 2026-04-21T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Step indicator visibility
expected: "Step X of Y" text is visible without scrolling on every step in both /orders/new and /orders/fix wizards
result: [pending]

### 2. Draft saved toast — New Order wizard
expected: After any field change in /orders/new, a small green chip appears within ~500ms at top-center, stays ~2 seconds, then disappears
result: [pending]

### 3. Draft saved toast — Fix Order wizard
expected: Same behavior as above in /orders/fix wizard
result: [pending]

### 4. Step transition animation feel
expected: Tapping Next animates new step sliding in from the right (~200ms); tapping Back animates from the left; no jarring flash or layout shift
result: [pending]

### 5. RTL toast centering
expected: In Hebrew layout (dir="rtl"), the toast stays horizontally centered — does not drift to the left or right edge
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps

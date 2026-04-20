---
status: partial
phase: 04-orders-features
source: [04-VERIFICATION.md]
started: 2026-04-21T00:00:00Z
updated: 2026-04-21T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Edit Form Pre-Population
expected: Navigate to a status=new order, tap Edit Order button — all 11 fields (client name, phone, email, jewelry type, metal, size, description, main stone, price, deadline, comment) are pre-populated with the order's existing values. No fields are empty unless the original order had no value.
result: [pending]

### 2. Retry Cycle After Network Recovery
expected: DevTools → Network → Offline → refresh My Orders page → error card appears with Retry button (not empty list). Restore network → click Retry → orders list loads, error card disappears.
result: [pending]

### 3. Worker Ownership Rejection (Security — T-4-01)
expected: PUT /api/production/orders with a JWT belonging to salesman A for an order owned by salesman B → HTTP 403 `{"error":"Forbidden: not your order"}`.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

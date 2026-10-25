# DDP-092 – Final Defect and Regression Summary

**Issue:** `darshana-opticals-osms/infra#14`
**Version:** 0.1
**Prepared:** 25 October 2026
**Status:** In Progress
**Working Branch:** `fix/92-final-defect-regression`

---

## 1. Purpose

This document coordinates final defect triage and regression evidence for DDP-092.

The objective is to:

- Record verified Sprint 3 defects.
- Link each defect to its original testing or review source.
- Record severity and affected modules.
- Track fixes and regression results.
- Identify release-blocking defects.
- Preserve final regression evidence for DDP-087 and DDP-090.

No defect is considered verified only because its implementation issue is closed. Fix and retest evidence must be traceable.

---

## 2. Current Evidence Sources

| Source | Status | DDP-092 Use |
| --- | --- | --- |
| DDP-084 – System Integration and E2E Testing (`infra#11`) | Complete | E2E and regression evidence available |
| DDP-085 – OWASP Security Verification (`backend#91`) | Complete | Security regression and release-gate evidence available |
| DDP-086 – Performance and Reliability Testing (`backend#92`) | Complete | Performance/reliability evidence available |
| DDP-091 – Final UAT and Demonstration (`infra#13`) | Open | Final UAT findings pending |
| DDP-096 – Checkout Classification Defect (`backend#97`) | Closed | Verified defect/fix and automated regression evidence available |

---

## 3. Centralized Defect Register

### DEF-001 – Invalid Order Item Classification Could Block Paid Order Completion

**Source:** DDP-096 – `darshana-opticals-osms/backend#97`
**Fix PR:** `darshana-opticals-osms/backend#99`
**Affected Module:** Checkout / Orders / Loyalty / Payment
**DDP-092 Severity:** Critical
**Reason:** The defect affected payment/order integrity because a Customer could successfully pay for an Order that Staff could not later complete.

### Original Problem

The checkout workflow could create OrderItem snapshots containing an invalid or `UNKNOWN` item classification.

A Customer could complete payment successfully, but when Staff attempted:

`PICKED_UP → COMPLETED`

the backend could return:

`409 LOYALTY_ITEM_CLASSIFICATION_REQUIRED`

This prevented the paid Order from completing correctly.

### Expected Behaviour

Inventory item classification must be validated before the Order is persisted and before payment proceeds.

Only supported classifications must be accepted.

Invalid classification data must fail safely without:

- Creating an invalid Order.
- Persisting invalid OrderItems.
- Deducting stock incorrectly.
- Deleting the Cart.
- Allowing a payment flow for an Order that cannot later complete.

### Fix

The checkout service was updated to validate authoritative item classification inside the checkout transaction.

Supported classifications are restricted to:

- `MERCHANDISE`
- `CLINICAL`

Invalid or unsupported classifications are rejected before Order persistence.

The fix preserves the existing:

- Order lifecycle.
- Loyalty calculation rules.
- PayHere payment verification.
- Transaction boundaries.
- Successful API contracts.

### Automated Regression Evidence

Backend PR #99 records the following successful verification:

- Checkout service unit tests: **19/19 passed**
- Checkout API integration tests: **36/36 passed**
- Loyalty regression tests: **87/87 passed**
- Payment regression tests: **48/48 passed**
- Order lifecycle/service regression tests: **passed**
- ESLint: **passed**
- Prettier formatting check: **passed**

### Current DDP-092 Disposition

**Fixed – automated regression verified.**

Final DDP-092 sign-off will also consider the integrated E2E/UAT results before declaring the complete system regression-ready.

---

## 4. Completed Regression Evidence

### Authentication and Authorization

DDP-085 completed system-level security verification including:

- Authentication failure handling.
- Account lockout.
- JWT rejection.
- Role-based access control.
- Customer ownership restrictions.
- Branch-level isolation.
- Privileged operation protection.
- Runtime authentication/security logging.
- HTTPS, HSTS, CORS, and security headers.

DDP-085 completed with the security release gate marked **PASS**.

No unresolved Critical or High dependency vulnerabilities remained in the final DDP-085 assessment.

### Checkout, Payment, Order and Loyalty

DDP-096 provides targeted automated regression evidence for the classification defect that previously affected paid Order completion.

Automated checkout, loyalty, payment, and Order lifecycle regression tests passed after the fix.

### System Integration and E2E

DDP-084 has been completed, peer reviewed, approved, and merged through `darshana-opticals-osms/infra#19`.

Final DDP-084 verification recorded:

- Playwright E2E: **10/10 passed**
- Backend integration: **645/645 passed**
- Frontend regression: **202/202 passed**
- Manual appointment cancellation: **PASS**
- Manual Doctor Session overlap prevention: **PASS**
- Authentication and authorization retest: **7/7 passed**

The DDP-084 execution used fictional non-production test data and documented the approved hosted testing environment.

The deployed PayHere successful-payment completion was not verified because of the current hosting/domain configuration limitation.

This limitation was documented transparently and was not reported as a passed deployed payment scenario.

No confirmed application defect was established from this limitation. It remains an environment/deployment verification limitation for release documentation.

### Performance and Reliability

DDP-086 has been completed and provides the authoritative performance and reliability evidence for final QA documentation.

Performance findings should not be duplicated here unless they represent an identified defect requiring regression tracking.

---

## 5. Pending Regression Inputs

The following source is still open and must be reviewed before final DDP-092 sign-off:

### DDP-091 – Final UAT and Demonstration

Pending UAT findings must be reviewed for:

- Functional defects.
- Cross-module integration problems.
- User-visible workflow failures.
- Deployment-specific failures.
- Demonstration blockers.

Any material UAT defect must be linked and triaged before final DDP-092 sign-off.

---

## 6. Current Release-Blocker Assessment

Based on the completed DDP-084, DDP-085, and DDP-086 evidence and the currently verified defect records:

- No unresolved Critical security finding is currently identified.
- No unresolved High security dependency vulnerability is currently identified.
- DDP-096 has been fixed with automated regression evidence.
- DDP-084 completed with 10/10 Playwright tests, 645/645 backend integration tests, and 202/202 frontend regression tests passing.
- No additional confirmed release-blocking defect was identified from the completed DDP-084 execution.
- No additional release-blocking defect is recorded in this DDP-092 register at this stage.

However, this is **not yet the final DDP-092 release-regression sign-off**.

Final sign-off remains dependent on reviewing the completed findings from DDP-091 and recording any resulting defects or explicitly confirming that no additional release blockers were identified.

---

## 7. Defect Disposition Rules

Every relevant Sprint 3 finding must end with one of the following dispositions:

- Resolved and verified.
- Fixed – awaiting retest.
- Accepted non-critical deferral.
- Duplicate with linked issue.
- Not reproducible with supporting evidence.
- Open and release-blocking.

No finding may be silently discarded.

---

## 8. Final Sign-Off

**Current status:** In Progress

Final DDP-092 sign-off will be completed after:

1. DDP-091 final UAT findings are reviewed.
2. Any newly identified defects are triaged.
3. Required fixes are retested.
4. Critical regression areas are confirmed.
5. Remaining non-critical limitations are documented.
6. Final release-blocker status is recorded for release documentation.
7. Final regression evidence is provided to DDP-087.

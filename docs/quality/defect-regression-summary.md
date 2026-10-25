# DDP-092 – Final Defect and Regression Summary

**Issue:** `darshana-opticals-osms/infra#14`
**Version:** 1.0
**Prepared:** 25 October 2026
**Status:** Complete
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
| DDP-091 – Final UAT and Demonstration (`infra#13`) | Evidence merged | Final UAT findings reviewed |
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

## 5. Final UAT Review

DDP-091 UAT documentation was peer reviewed, approved, and merged through `darshana-opticals-osms/infra#25`.

The reviewed UAT report records:

- Hosted non-payment UAT scenarios: **21 PASS**
- Hosted functional failures reported: **0**
- Hosted PayHere payment verification: **1 Pending**
- Localhost PayHere Sandbox payment: **PASS**
- Customer, Branch Assistant, Branch Manager, Optometrist, System Administrator, cross-role, and negative workflows were reported as successfully exercised.

No additional confirmed application defect was reported by the reviewed UAT evidence.

### Hosted PayHere Limitation

Successful payment completion through the current hosted Vercel frontend remains unverified because the current Vercel-provided subdomain could not complete the intended PayHere website-domain registration.

The payment workflow was successfully tested in the approved localhost PayHere Sandbox configuration.

For the current academic demonstration scope:

- Hosted non-payment workflows remain available for demonstration.
- The successfully verified PayHere Sandbox workflow is demonstrated separately through localhost.
- The hosted PayHere result is **not** represented as PASS.
- The hosted limitation is retained as a deployment/integration limitation rather than classified as a confirmed application defect.
- Final hosted payment verification remains future client-deployment work after suitable domain configuration.

The merged UAT documentation still owns its detailed execution-evidence and final client-acceptance records. Those documentation activities do not create an additional DDP-092 application defect.

## 6. Final Release-Blocker Assessment

The final DDP-092 assessment incorporates the completed DDP-084, DDP-085, DDP-086, DDP-096 remediation, and the merged DDP-091 UAT evidence.

Final findings:

- DDP-096 checkout classification defect was fixed and verified through automated regression testing.
- DDP-084 completed with 10/10 Playwright E2E tests, 645/645 backend integration tests, and 202/202 frontend regression tests passing.
- DDP-085 completed with the security release gate marked PASS and no unresolved Critical or High dependency vulnerabilities.
- DDP-086 completed and provides the authoritative performance and reliability assessment.
- DDP-091 reports 21 hosted non-payment UAT scenarios PASS and 0 other hosted functional failures.
- No additional confirmed Critical or High application defect was identified from the reviewed UAT evidence.
- No additional confirmed release-blocking regression was identified from the completed Sprint 3 testing evidence.
- Hosted PayHere completion remains pending and is documented separately as an environment/domain integration limitation.

### Final DDP-092 Release Decision

For the current academic demonstration and verified release scope:

**PASS – no unresolved Critical release-blocking application defect is identified.**

The hosted PayHere limitation must remain visible in final QA, UAT, and release documentation and must not be represented as a successfully verified hosted payment flow.

Future client-facing payment deployment still requires custom-domain configuration and successful hosted PayHere verification before final client acceptance.

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

**Current status:** Complete

DDP-092 final defect triage and regression coordination is complete for the current verified project release scope.

Final status:

1. Relevant Sprint 3 findings were reviewed and triaged.
2. DDP-096 was resolved and verified through targeted automated regression testing.
3. DDP-084 integration and E2E evidence was reviewed.
4. DDP-085 security evidence was reviewed.
5. DDP-086 performance and reliability evidence was reviewed.
6. DDP-091 merged UAT evidence was reviewed.
7. No unresolved Critical release-blocking application defect is currently identified.
8. No newly confirmed High release-blocking application defect was reported by the reviewed final UAT evidence.
9. The hosted PayHere limitation remains explicitly documented and deferred as deployment/integration verification work.
10. Final regression evidence is available for DDP-087 QA documentation and final project evidence.

**DDP-092 disposition: PASS – regression coordination complete.**

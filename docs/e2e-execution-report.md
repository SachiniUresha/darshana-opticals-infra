# DDP-084 E2E Execution Report

## 1. Purpose

This document records the execution evidence for DDP-084 critical system
integration and end-to-end workflows.

Prepared test automation does not count as a successful execution.

A scenario may be marked `Pass` only after it has been executed against the
approved integrated OSMS staging environment and the expected result has been
verified.

## 2. Target Environment

| Item | Target |
|---|---|
| Frontend | Vercel staging deployment |
| Backend | AWS App Runner staging service |
| Database | Dedicated MongoDB Atlas staging database |
| Payment | PayHere sandbox only |
| Test data | Fictional staging data only |
| Browser automation | Playwright / Chromium |

Current environment status:

**Blocked — integrated staging deployment is not yet available for final
DDP-084 execution.**

## 3. Execution Safety Rules

- Never use production customer, patient, payment, or clinical data.
- Never use production payment credentials or perform a real charge.
- Use only approved fictional staging accounts.
- Do not commit E2E credentials, tokens, secrets, or provider credentials.
- Store runtime credentials only in the approved local/CI secret environment.
- Sanitize screenshots, traces, logs, and defect evidence before sharing.
- Do not mark an unexecuted scenario as passed.
- Failed application behavior must be raised through a separate defect/fix
  issue rather than silently changing production code inside DDP-084.

## 4. Critical Execution Register

| Test Case ID | Automated Coverage | Actual Result | Status | Evidence | Defect |
|---|---|---|---|---|---|
| E2E-AUTH-01 | `tests/e2e/auth.spec.js` | Not executed against integrated staging yet. | Blocked | Pending | — |
| E2E-PURCHASE-01 | `tests/e2e/purchase.spec.js` | Not executed against integrated staging/PayHere sandbox yet. | Blocked | Pending | — |
| E2E-PURCHASE-02 | Backend integration coverage plus controlled staging failure/recovery verification required. | Not executed against integrated staging yet. | Blocked | Pending | — |
| E2E-APPOINTMENT-01 | `tests/e2e/appointment.spec.js` | Not executed against integrated staging yet. | Blocked | Pending | — |
| E2E-APPOINTMENT-02 | Existing conflict/cancellation integration coverage plus controlled staging verification required. | Not executed against integrated staging yet. | Blocked | Pending | — |
| E2E-PRESCRIPTION-01 | `tests/e2e/prescription.spec.js` | Not executed against integrated staging yet. | Blocked | Pending | — |
| E2E-AUTHZ-01 | `tests/e2e/authorization.spec.js` plus existing backend authorization integration tests. | Not executed against integrated staging yet. | Blocked | Pending | — |

## 5. Browser Test Inventory

Current prepared Playwright files:

- `tests/e2e/auth.spec.js`
- `tests/e2e/authorization.spec.js`
- `tests/e2e/purchase.spec.js`
- `tests/e2e/appointment.spec.js`
- `tests/e2e/prescription.spec.js`

The Playwright suite currently contains ten discovered browser tests.

Test discovery alone is not execution evidence.

## 6. Required Runtime Configuration

The staging run must supply required values through environment variables.
Do not store real values in this repository.

Required as applicable:

- `E2E_BASE_URL`
- `E2E_CUSTOMER_EMAIL`
- `E2E_CUSTOMER_PASSWORD`
- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`
- `E2E_MANAGER_EMAIL`
- `E2E_MANAGER_PASSWORD`
- `E2E_ASSISTANT_EMAIL`
- `E2E_ASSISTANT_PASSWORD`
- `E2E_OPTOMETRIST_EMAIL`
- `E2E_OPTOMETRIST_PASSWORD`
- `E2E_PRODUCT_ID`
- `E2E_APPOINTMENT_DATE`
- `E2E_APPOINTMENT_START`
- `E2E_APPOINTMENT_END`

Optional configuration:

- `E2E_BILLING_CITY`
- `E2E_APPOINTMENT_CAPACITY`

The configured appointment slot must be a dedicated future staging slot,
outside the applicable booking restriction and free from conflicting sessions.

The configured product must be a designated fictional staging inventory item
with valid classification and sufficient stock.

## 7. Planned Staging Execution

After DDP-082 and DDP-083 provide the approved integrated staging deployment:

1. Confirm frontend, backend, database, and sandbox provider health.
2. Confirm only fictional staging test data/accounts are being used.
3. Configure E2E environment variables without exposing secrets.
4. Execute Playwright against the staging frontend.
5. Capture Playwright output and failure evidence.
6. Perform required controlled PayHere sandbox verification.
7. Perform representative failure/recovery checks that require staging.
8. Link any discovered defect to its issue/PR.
9. Retest repaired defects.
10. Update this register with actual result, status, evidence, and defect references.

## 8. Execution Record

### Run Metadata

| Field | Value |
|---|---|
| Execution date/time | Pending |
| Executor | Pending |
| Frontend staging URL | Pending |
| Backend staging target | Pending |
| Frontend revision | Pending |
| Backend revision | Pending |
| Infra revision | Pending |
| Browser/project | Chromium |
| PayHere environment | Sandbox |
| Overall result | Blocked |

### Playwright Result

Command: `npm run test:e2e`

Result: **Not executed against integrated staging yet.**

### Manual / Controlled Verification

PayHere sandbox completion, payment cancellation/failure/recovery, and other
provider/state-dependent checks:

**Not executed against integrated staging yet.**

## 9. Defect Evidence Requirements

For each failure record:

- DDP-084 Test Case ID.
- Date/time and staging revision.
- Expected result.
- Actual result.
- Sanitized screenshot, trace, log, or response evidence.
- Severity.
- Linked defect issue.
- Linked fix PR/commit when available.
- Retest result.

Do not include passwords, tokens, connection strings, payment secrets, real
customer data, or unnecessary clinical information.

## 10. Final Release-Gate Rule

DDP-084 must not be reported as complete merely because the Playwright files
exist or because tests are discoverable.

Final completion requires execution against the approved integrated staging
environment, documented actual results, required external-sandbox verification,
defect handling/retesting where applicable, and final evidence suitable for
DDP-087.

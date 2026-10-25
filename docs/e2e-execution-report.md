# DDP-084 E2E Execution Report

## 1. Purpose

This document records the actual execution evidence for DDP-084 critical system integration and end-to-end workflows.

The existing Playwright suite contains 10 automated browser tests across 5 specification files. All 10 distinct tests have passed in individual executions against the deployed OSMS application.

Passing the automated suite does not, by itself, demonstrate complete DDP-084 acceptance. Controlled payment completion, failure/recovery testing, and final release verification remain separately tracked.

## 2. Target Environment

| Item               | Environment                                                 |
| ------------------ | ----------------------------------------------------------- |
| Frontend           | https://darshana-opticals.vercel.app                        |
| Backend            | https://osms-backend-staging.onrender.com                   |
| Database           | MongoDB Atlas staging database — based on team confirmation |
| Payment            | PayHere sandbox — based on team confirmation                |
| Test data          | Fictional staging accounts and records                      |
| Browser automation | Playwright / Chromium                                       |
| Execution method   | Local PowerShell, headed Chromium                           |

The integrated frontend/backend application was successfully used for the executed Playwright scenarios.

Independent configuration verification of the database isolation and payment sandbox remains subject to the final environment evidence.

## 3. Execution Safety Rules

- Use only fictional staging accounts and test records.
- Never use real customer or clinical information.
- Use PayHere sandbox only, without real payment charges.
- Do not commit credentials, tokens, connection strings, or provider secrets.
- Sanitize test traces, screenshots, video recordings, and logs before sharing.
- Do not classify unexecuted scenarios as passed.
- Track genuine application defects through linked issues and appropriately scoped fixes.
- Avoid rerunning data-mutating tests without checking existing appointments, prescriptions, orders, and inventory.

## 4. Critical Execution Register

| Test Case ID        | Automated Coverage                                                                       | Actual Result                                                                                                                          | Status                          | Evidence                                       | Defect                               |
| ------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------- | ------------------------------------ |
| E2E-AUTH-01         | `tests/e2e/auth.spec.js`                                                                 | Both browser tests passed: unauthenticated profile redirect and Customer login/profile/logout                                          | PASS — 2/2                      | Local Playwright terminal output               | None outstanding                     |
| E2E-AUTHZ-01        | `tests/e2e/authorization.spec.js`                                                        | All five role-isolation browser tests passed following fictional staff-account provisioning                                            | PASS — 5/5                      | Local headed Playwright run: 5 passed in 34.0s | Earlier login prerequisites resolved |
| E2E-APPOINTMENT-01  | `tests/e2e/appointment.spec.js`                                                          | Branch Assistant created a Doctor Session and Customer booked the session successfully                                                 | PASS — 1/1                      | Local headed Playwright run: 1 passed in 26.3s | Test radio interaction corrected     |
| E2E-PRESCRIPTION-01 | `tests/e2e/prescription.spec.js`                                                         | Optometrist recorded a fictional prescription; Customer verified the record in Prescription History                                    | PASS — 1/1                      | Local headed Playwright run: 1 passed in 20.5s | None outstanding                     |
| E2E-PURCHASE-01     | `tests/e2e/purchase.spec.js`                                                             | Customer created an order and reached the PayHere handoff preparation stage; provider payment not submitted                            | PASS — scoped handoff only, 1/1 | Local headed Playwright run: 1 passed in 17.4s | Product-navigation wait corrected    |
| E2E-PURCHASE-02     | Controlled failure/recovery and existing integration evidence                            | Payment cancellation/failure, notification idempotency, stock recovery and final payment confirmation not yet consolidated or verified | PENDING                         | Pending                                        | Pending assessment                   |
| E2E-APPOINTMENT-02  | Existing conflict/cancellation integration coverage plus controlled staging verification | Appointment conflict, invalid booking and cancellation behavior not yet consolidated or verified                                       | PENDING                         | Pending                                        | Pending assessment                   |

The five executed automated test-case IDs represent 10 Playwright test instances.

**Automated execution summary: 10 distinct tests passed individually; 0 currently failing in their latest individual runs. A single final consolidated suite run has not been recorded.**

## 5. Browser Test Inventory

- `tests/e2e/auth.spec.js` — 2 passed
- `tests/e2e/authorization.spec.js` — 5 passed
- `tests/e2e/appointment.spec.js` — 1 passed
- `tests/e2e/prescription.spec.js` — 1 passed
- `tests/e2e/purchase.spec.js` — 1 passed

All 10 test instances were discovered and subsequently passed in separate local executions.

### Previous failures and corrections

**Staff-role login:** Four initial role-isolation executions failed during login. Fictional staff accounts were subsequently created through System Admin. The complete authorization suite was rerun and passed, 5/5.

**Appointment selection:** The initial test timed out while selecting a session radio button. The test was updated to click the enclosing label and verify that the radio button became checked. The subsequent appointment test passed.

**Product navigation:** The initial purchase test experienced an interrupted navigation while waiting for the full page load. Changing the product navigation to wait for `domcontentloaded` allowed the subsequent purchase test to pass.

These corrections are supported by successful subsequent executions. No unrelated application-code changes were required for these test failures.

## 6. Required Runtime Configuration

Runtime configuration uses PowerShell environment variables, not committed credentials.

Required variables include the deployed frontend URL, fictional account credentials for the five roles, and scenario-specific test data.

The executed appointment scenario used a dedicated future Doctor Session slot. The purchase test used a designated staging product.

Actual credential values must not be recorded in this report or committed to the repository.

## 7. Remaining Deployed E2E Verification

The following work remains before full DDP-084 acceptance:

1. Confirm final environment isolation and sandbox settings using approved evidence.
2. Perform controlled PayHere sandbox payment completion.
3. Verify provider notification handling, order status and inventory consistency.
4. Verify representative payment cancellation, failure and recovery scenarios.
5. Review or execute appointment conflict and cancellation verification.
6. Confirm relevant backend Jest/Supertest and frontend Vitest regression evidence.
7. Check supporting E2E scope against the approved test plan and SRS requirements.
8. Collect deployed frontend/backend revisions, CI run references and sanitized execution evidence.
9. Record and retest any outstanding material defects.
10. Obtain the required review approval and merge DDP-084 PR #19.

Existing lower-level automated coverage may support verification where appropriate, but must be linked rather than assumed.

## 8. Execution Record

### Run Metadata

| Field                    | Value                                     |
| ------------------------ | ----------------------------------------- |
| Execution date           | October 25, 2026                          |
| Executor                 | DDP-084 assigned tester (`SachiniUresha`) |
| Frontend URL             | https://darshana-opticals.vercel.app      |
| Backend target           | https://osms-backend-staging.onrender.com |
| Frontend revision        | To be recorded                            |
| Backend revision         | To be recorded                            |
| Infra revision           | To be recorded                            |
| Browser/project          | Playwright Chromium                       |
| Test mode                | Headed, serial execution                  |
| PayHere environment      | Sandbox per team confirmation             |
| Overall automated result | 10 distinct tests passed individually     |
| Full DDP-084 acceptance  | Pending additional verification           |

### Playwright Results

| Category                     | Passed |  Total |
| ---------------------------- | -----: | -----: |
| Authentication               |      2 |      2 |
| Authorization                |      5 |      5 |
| Appointment                  |      1 |      1 |
| Prescription                 |      1 |      1 |
| Purchase and payment handoff |      1 |      1 |
| **Total**                    | **10** | **10** |

The successful results were recorded across separate Playwright executions, not a single uninterrupted suite run.

### Code Validation

Prettier formatting/checking and JavaScript syntax verification passed for the modified appointment, prescription and purchase test files during their individual validation runs.

Final repository-wide formatting, relevant regression checks and CI evidence remain to be recorded.

### Manual / Controlled Verification

Successful manual System Admin login and creation of fictional Gampaha staff accounts were reported during test preparation.

Controlled PayHere sandbox payment completion, recovery testing, inventory reconciliation and appointment conflict verification have not yet been demonstrated as completed in this report.

## 9. Defect Evidence Requirements

Any remaining or newly discovered failure must record:

- Test case ID and relevant requirement.
- Date and tested environment/revision.
- Expected versus actual behavior.
- Reproduction steps and severity.
- Sanitized supporting evidence.
- Defect issue and fix PR, where needed.
- Retest status.

Playwright traces may contain test credentials and sensitive fictional records; keep raw traces private and share only sanitized evidence.

## 10. Final Release-Gate Rule

The existing 10-test Playwright suite has passed across individual runs. This establishes successful execution of the current automated scenarios.

**DDP-084 remains in progress** until outstanding release-critical payment and integration checks are verified, supporting evidence and revisions are recorded, material blockers are resolved, and the existing PR receives required approval and is merged.

Final results will support DDP-087 QA documentation, DDP-092 defect/regression coordination and DDP-090 release readiness.

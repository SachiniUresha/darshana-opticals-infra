# DDP-084 E2E Execution Report

## 1. Purpose

This document records the execution results, supporting evidence, findings, and outstanding verification activities for **DDP-084 — Critical System Integration and End-to-End Testing** of the Darshana Opticals Optical Shop Management System (OSMS).

The objective is to verify critical workflows across the integrated frontend and backend, confirm the correct behavior of important business rules, and identify any remaining issues before the final release.

Testing was performed using three complementary approaches:

- **Playwright browser E2E testing:** Critical workflows were executed against the deployed OSMS application.
- **Backend integration regression testing:** Existing Jest and Supertest tests were executed locally to verify APIs, business rules, data consistency, and failure handling.
- **Frontend regression testing:** Existing Vitest tests were executed locally to verify interface behavior, validation, and error handling.

Additional manual verification was performed against the deployed application for appointment cancellation and Doctor Session overlap prevention.

**Overall automated execution results:**

- **Backend:** 645/645 tests passed across 23 test suites.
- **Frontend:** 202/202 tests passed across 19 test files.
- **Playwright:** 10/10 browser tests passed in individual executions.

These results provide substantial regression and integration evidence. However, they do not represent complete verification of every deployed workflow.

The PayHere payment integration was reported as working in the local development environment, while deployed payment completion remains blocked by the current domain/integration configuration.

DDP-084 therefore remains in progress until its outstanding release-critical verification and evidence requirements are addressed.

---

## 2. Target Environment

### 2.1 Deployed Environment

| Item               | Environment                                                |
| ------------------ | ---------------------------------------------------------- |
| Frontend           | https://darshana-opticals.vercel.app                       |
| Backend            | https://osms-backend-staging.onrender.com                  |
| Hosting            | Vercel frontend and Render backend                         |
| Database           | MongoDB Atlas staging database, based on team confirmation |
| Payment provider   | PayHere sandbox, based on team confirmation                |
| Test data          | Fictional, non-production records                          |
| Browser automation | Playwright / Chromium                                      |
| Execution method   | Local PowerShell against deployed application              |
| Testing date       | 25 October 2026                                            |

The integrated Vercel frontend and Render backend were accessible during the executed Playwright tests.

Although the frontend is deployed through Vercel's production deployment mechanism, fictional test accounts and non-production data were used for controlled E2E testing.

The backend URL contains `staging`, but the URL alone does not establish database isolation. Final environment configuration evidence must independently confirm that the application is connected to the approved non-production database.

### 2.2 Local Regression Environment

| Item                      | Environment           |
| ------------------------- | --------------------- |
| Backend framework         | Jest / Supertest      |
| Backend database          | MongoDB Memory Server |
| Frontend framework        | Vitest                |
| Frontend test environment | jsdom                 |
| Code quality checks       | Prettier and ESLint   |
| Execution method          | Windows PowerShell    |

Backend integration tests used MongoDB Memory Server rather than the deployed MongoDB Atlas database.

The local test runs used the available MongoDB 8.3.11 binary instead of the requested 8.2.6 version. This produced non-blocking version warnings without failing the selected test suites.

### 2.3 PayHere Deployment Limitation

The team currently uses a free Vercel deployment URL and has not obtained a separately registered custom domain for its intended PayHere integration.

According to the team's latest update, PayHere integration testing was successful locally.

During deployed testing, PayHere rejected a payment request with the following message:

**"Unauthorized payment request — This is a merchant's error."**

The team has attributed this limitation to its current domain/integration arrangement. However, the exact gateway rejection cause has not been independently confirmed.

A successful local integration test does not automatically verify the deployed payment flow.

**Deployment status: BLOCKED — domain authorization/integration configuration requires resolution and retesting.**

---

## 3. Execution Safety Rules

The following rules were followed or applied when planning and conducting E2E testing:

1. Use fictional accounts and test data only.
2. Never use actual customer or clinical records for testing.
3. Perform payment testing using approved PayHere sandbox configurations without real payment charges.
4. Do not commit credentials, JWT tokens, database connection strings, Merchant Secrets, or other sensitive configuration values.
5. Review and sanitize screenshots, Playwright traces, recordings, and logs before sharing evidence.
6. Do not classify a scenario as passed unless it has actually been executed and its expected result confirmed.
7. Distinguish backend/frontend regression tests from deployed browser E2E verification.
8. Avoid unnecessarily repeating data-mutating browser tests that create appointments, prescriptions, or orders.
9. Record genuine defects or external integration blockers with reproducible evidence.
10. Verify that an existing order or appointment remains eligible before attempting further modification or retesting.

---

## 4. Critical Execution Register

The following table records the current DDP-084 critical scenario results.

| Test Case ID        | Scenario                                                      | Actual Result                                                                      | Status                          |
| ------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------- |
| E2E-AUTH-01         | Customer authentication, logout, protected routes             | Both Playwright tests passed                                                       | PASS — 2/2                      |
| E2E-AUTHZ-01        | System role isolation and access restrictions                 | All five Playwright tests passed                                                   | PASS — 5/5                      |
| E2E-APPOINTMENT-01  | Doctor Session creation and Customer appointment booking      | Session created and appointment booked successfully                                | PASS — 1/1                      |
| E2E-PRESCRIPTION-01 | Optometrist prescription entry and Customer history           | Prescription recorded and visible to Customer                                      | PASS — 1/1                      |
| E2E-PURCHASE-01     | Customer checkout and payment handoff preparation             | Order created; payment preparation reached successfully                            | PASS — 1/1, scoped              |
| E2E-PURCHASE-02     | Payment failure, recovery, callbacks, reservation consistency | Local backend regression passed; deployed gateway completion/recovery not verified | PARTIAL / BLOCKED               |
| E2E-APPOINTMENT-02  | Appointment cancellation and overlapping Doctor Sessions      | Both selected scenarios manually passed in deployed application                    | PASS — selected deployed checks |

### 4.1 Automated Test Summary

The five implemented Playwright scenario groups contain 10 browser test instances.

**All 10 tests passed in their latest individual executions.**

A single combined final Playwright suite run has not been recorded because several tests modify shared test data, including appointments, prescriptions, and orders.

### 4.2 Appointment Conflict and Cancellation Evidence

Manual testing confirmed that an existing fictional Customer appointment could be cancelled successfully.

The Cancelled status remained after refreshing the application, and the Cancel button was no longer available.

A Branch Assistant also attempted to create a Doctor Session overlapping an existing session for the same Doctor.

The system displayed an overlap error, and no duplicate session was created.

These observations establish successful deployed verification of the two selected behaviors. They do not replace every possible appointment-capacity or concurrent-booking scenario.

### 4.3 Payment Failure and Recovery Evidence

Existing backend integration tests cover:

- Rejected or forged payment notifications.
- Duplicate payment notifications and transaction handling.
- Payment failure and retry business rules.
- Recovery and reconciliation scenarios.
- Reservation expiry.
- Stock restoration.
- Insufficient-stock checkout.
- Concurrent checkout and payment-processing scenarios.

The selected backend payment and checkout regression batch passed **169/169 tests**.

However, these tests used local test infrastructure and do not establish successful deployed PayHere gateway completion.

The manual deployed payment attempt was rejected by the gateway before successful payment completion.

**Therefore, E2E-PURCHASE-02 remains partially supported by local regression evidence and blocked for deployed payment verification.**

---

## 5. Browser Test Inventory

### 5.1 Implemented Playwright Tests

| Specification File                | Test Scope                                | Result         |
| --------------------------------- | ----------------------------------------- | -------------- |
| `tests/e2e/auth.spec.js`          | Authentication and protected access       | 2/2 PASS       |
| `tests/e2e/authorization.spec.js` | Role isolation                            | 5/5 PASS       |
| `tests/e2e/appointment.spec.js`   | Doctor Session and appointment booking    | 1/1 PASS       |
| `tests/e2e/prescription.spec.js`  | Prescription entry and Customer history   | 1/1 PASS       |
| `tests/e2e/purchase.spec.js`      | Customer purchase and payment preparation | 1/1 PASS       |
| **Total**                         | **5 specification files**                 | **10/10 PASS** |

### 5.2 Authentication and Authorization

The authentication tests verified:

- An unauthenticated Customer cannot access the protected profile page.
- An authenticated Customer can log in and access protected content.
- Logout invalidates access to protected Customer routes.

The authorization suite verified role isolation for Customer, System Admin, Branch Manager, Branch Assistant, and Optometrist.

**Result:** All seven authentication and authorization tests passed.

### 5.3 Appointment Booking

The appointment test verified that a Branch Assistant could create a Doctor Session and a Customer could book the available session.

**Result:** PASS — 1/1.

### 5.4 Prescription Workflow

The prescription test verified that an Optometrist could record a prescription for a fictional Customer and that the Customer could subsequently view it in Prescription History.

**Result:** PASS — 1/1.

### 5.5 Customer Purchase Workflow

The purchase test verified:

- Customer authentication.
- Opening a designated fictional inventory product.
- Adding the product to the cart.
- Creating an order through checkout.
- Opening the payment preparation page.
- Entering required billing information.
- Reaching the PayHere handoff preparation stage.

**Result:** PASS — 1/1 for the implemented scope.

The test did not submit or complete a PayHere payment.

### 5.6 Previous Test Failures and Corrections

**Staff account prerequisites:** Initial role-isolation tests failed because the expected seeded staff accounts were unavailable. Fictional staff accounts were created through the System Admin interface. The authorization suite was rerun successfully.

**Appointment radio selection:** The original selection interaction timed out. The test was updated to select the enclosing label and confirm the radio button state. The subsequent test passed.

**Product navigation:** The purchase test initially encountered an interrupted browser navigation while waiting for a complete page-load event. The navigation wait was updated to `domcontentloaded`, and the subsequent test passed.

These corrections were verified through successful executions. No unrelated application behavior was changed.

---

## 6. Supporting Backend and Frontend Regression Evidence

### 6.1 Backend Integration Testing

Four backend integration regression batches were executed on 25 October 2026.

| Batch     | Testing Scope                                                                                 | Test Suites | Passed Tests |
| --------- | --------------------------------------------------------------------------------------------- | ----------: | -----------: |
| 1         | Appointment API and Doctor Session API                                                        |           2 |           53 |
| 2         | Payment, checkout, notification security, recovery, reservation expiry                        |           5 |          169 |
| 3         | Inventory, reorder alerts, loyalty, reporting, admin management, chatbot, order notifications |          12 |          364 |
| 4         | Staff order lifecycle, customer details, appointment-doctor API, staff/doctor security        |           4 |           59 |
| **Total** | **Selected backend integration regression**                                                   |      **23** |      **645** |

**Result: 645/645 PASS — 23/23 suites.**

All four selected batches passed Prettier and ESLint validation.

### 6.2 Backend Functional Coverage

**Appointment Management**

Tests support appointment booking rules, session capacity, concurrent bookings, cancellation handling, ownership restrictions, and Doctor Session overlap validation.

**Payment and Checkout**

Tests support payment initiation, callback validation, idempotency, duplicate transaction handling, recovery, reservation expiry, inventory restoration, and checkout consistency.

**Inventory and Reorder Alerts**

Tests support inventory APIs, reorder thresholds, alert behavior, and related authorization and consistency rules.

**Loyalty Management**

Tests support loyalty processing, customer loyalty retrieval, and related business rules.

**Reporting**

Tests support reporting APIs, access restrictions, and relevant filtering behavior.

**Staff and Doctor Management**

Tests support administrative staff and doctor management, provisioning, and lifecycle security.

**Chatbot**

Tests support chatbot APIs, session handling, and failure behavior.

**Order Management**

Tests support staff order status operations, access to order customer details, and order notification behavior.

These results establish passing local backend integration coverage for the selected test files.

They do not mean that all corresponding workflows were individually tested end-to-end against the deployed application.

### 6.3 Frontend Regression Testing

A selected set of 19 frontend test files was executed using Vitest.

| Area                   | Covered Functionality                                        |
| ---------------------- | ------------------------------------------------------------ |
| Appointment management | Booking, details, history, validation and conflict responses |
| Checkout and payment   | Checkout, payment preparation, return/result handling        |
| Order management       | Customer orders, staff orders, details and status controls   |
| Inventory              | Reorder alert interface                                      |
| Loyalty                | Customer and staff loyalty pages                             |
| Reporting              | Sales and inventory reporting                                |
| Chatbot                | Customer chatbot interaction and failure handling            |

**Result: 202/202 PASS — 19/19 test files.**

Prettier and ESLint validation also passed for the selected frontend files.

React Router future-flag warnings appeared during execution but did not cause test failures.

### 6.4 Consolidated Automated Results

| Testing Layer                                | Tests Passed | Total Executed | Result   |
| -------------------------------------------- | -----------: | -------------: | -------- |
| Backend integration                          |          645 |            645 | PASS     |
| Frontend regression                          |          202 |            202 | PASS     |
| Playwright browser E2E                       |           10 |             10 | PASS     |
| **Total recorded automated test executions** |      **857** |        **857** | **PASS** |

**Important interpretation:** The 857 passing executions combine different testing layers and multiple selected test batches. They must not be presented as 857 deployed end-to-end tests or as proof that all release requirements are fulfilled.

---

## 7. Remaining Deployed E2E Verification

### 7.1 Completed Verification

The following verification activities have been completed:

1. Playwright authentication and authorization testing.
2. Playwright Doctor Session creation and Customer booking.
3. Playwright prescription entry and history verification.
4. Playwright Customer checkout and payment handoff preparation.
5. Backend appointment integration regression testing.
6. Backend payment, checkout, recovery and reservation integration regression testing.
7. Backend inventory, loyalty, reporting, administration, chatbot and order-management regression testing.
8. Frontend workflow regression testing.
9. Manual deployed Customer appointment cancellation.
10. Manual deployed overlapping Doctor Session rejection.

### 7.2 PayHere Environment Limitation

The team reports that PayHere integration was successfully tested in its local environment.

During deployed testing, however, PayHere displayed:

**"Unauthorized payment request — This is a merchant's error."**

The attempted payment amount was **LKR 18,500.00**.

The current deployment uses a free Vercel URL, and the team has reported that it does not yet have the custom domain intended for PayHere integration.

The team attributes the deployed limitation to domain-related PayHere authorization requirements. The precise cause must still be confirmed through the applicable PayHere configuration and gateway evidence.

The present evidence supports the following classifications:

| Verification                             | Status                                 |
| ---------------------------------------- | -------------------------------------- |
| Local PayHere integration                | PASS — team-reported, evidence pending |
| Customer order creation                  | PASS                                   |
| Payment preparation/handoff              | PASS                                   |
| Deployed PayHere gateway authorization   | BLOCKED                                |
| Successful deployed sandbox payment      | NOT VERIFIED                           |
| Deployed payment notification processing | NOT VERIFIED                           |
| Final paid order state                   | NOT VERIFIED                           |
| Post-payment inventory consistency       | NOT VERIFIED                           |
| Live payment processing                  | NOT TESTED                             |

Once an approved domain and matching PayHere configuration are available, the team must repeat a controlled sandbox payment and verify backend-authoritative payment status, notification handling, order state, and inventory consistency.

### 7.3 Other Outstanding Verification

The following work remains before DDP-084 can be fully accepted:

1. Obtain supporting evidence for the team-reported successful local PayHere integration test.
2. Resolve or formally document the deployed PayHere limitation and its release impact.
3. Verify deployed payment completion, failure/cancellation behavior, and recovery when the environment permits.
4. Confirm applicable cross-service consistency and staff/customer workflow requirements using traceable evidence.
5. Attach approved SRS requirement identifiers and DDP-084 acceptance-criteria mappings for each scenario.
6. Record actual frontend/backend deployed revisions and relevant CI execution references.
7. Attach sanitized screenshots, test logs, or execution references where required.
8. Coordinate relevant defect evidence with DDP-092 and QA evidence with DDP-087.
9. Obtain required review approval for the existing DDP-084 pull request.
10. Complete the release acceptance decision based on verified evidence and documented limitations.

Existing backend and frontend tests may be referenced as supporting evidence, but must not be misclassified as deployed E2E test executions.

---

## 8. Execution Record

### 8.1 Run Metadata

| Field                         | Value                                               |
| ----------------------------- | --------------------------------------------------- |
| Execution date                | 25 October 2026                                     |
| Assigned tester               | DDP-084 assigned tester                             |
| Frontend URL                  | https://darshana-opticals.vercel.app                |
| Backend URL                   | https://osms-backend-staging.onrender.com           |
| Frontend deployed revision    | `aaf9cce` — Vercel Production, Ready (25 Oct 2026)  |
| Backend deployed revision     | `152a646` — Render, Live (25 Oct 2026, 6:17 PM IST) |
| Infra revision                | `7647730` — DDP-084 review corrections              |
| Browser                       | Playwright Chromium                                 |
| Browser E2E execution         | Individual local executions                         |
| Backend regression            | Jest / Supertest                                    |
| Frontend regression           | Vitest                                              |
| Backend test suites           | 23 passed                                           |
| Frontend test files           | 19 passed                                           |
| Playwright tests              | 10 passed                                           |
| PayHere local verification    | Team-reported pass; supporting evidence pending     |
| PayHere deployed verification | Blocked by gateway authorization                    |
| Full DDP-084 acceptance       | Not yet complete                                    |

### 8.2 Browser E2E Results

| Category                     | Passed |  Total |
| ---------------------------- | -----: | -----: |
| Authentication               |      2 |      2 |
| Authorization                |      5 |      5 |
| Appointment booking          |      1 |      1 |
| Prescription                 |      1 |      1 |
| Purchase/payment preparation |      1 |      1 |
| **Total**                    | **10** | **10** |

All tests were successful in their latest individual executions. A single combined execution was not performed.

### 8.3 Backend Regression Results

**First batch — Appointment**

- Suites: 2 passed.
- Tests: 53 passed.
- Result: PASS.

**Second batch — Payment and Checkout**

- Suites: 5 passed.
- Tests: 169 passed.
- Result: PASS.

**Third batch — Supporting Workflows**

- Suites: 12 passed.
- Tests: 364 passed.
- Result: PASS.

**Fourth batch — Staff Orders and Lifecycle Security**

- Suites: 4 passed.
- Tests: 59 passed.
- Result: PASS.

**Total: 23 suites and 645 tests passed.**

### 8.4 Frontend Regression Results

- Test files: 19 passed.
- Tests: 202 passed.
- Result: PASS.
- Execution time: approximately 45 seconds.

### 8.5 Code Validation

The following checks were performed successfully for the selected test files and documentation during the testing process:

- Prettier formatting validation.
- ESLint validation for backend/frontend regression batches.
- JavaScript syntax verification for the Playwright configuration and specification files.
- Playwright test discovery for 10 tests.
- Git whitespace validation.

Final documentation validation, applicable CI checks, and final review evidence remain to be recorded.

### 8.6 Manual Deployed Verification

**Appointment Cancellation — PASS**

- Existing fictional appointment selected.
- Cancellation completed.
- Status updated to Cancelled.
- Status persisted after refresh.
- Cancel button no longer appeared.

**Doctor Session Overlap Prevention — PASS**

- Existing fictional Doctor Session selected as the reference.
- Branch Assistant submitted an overlapping session for the same Doctor.
- Application displayed an overlap error.
- No duplicate session appeared in the list.

**PayHere Payment — BLOCKED**

- Existing fictional Customer order used.
- Gateway displayed an unauthorized payment request error.
- No successful deployed payment completion was verified.
- Local success was reported separately by the team.

---

## 9. Defect Evidence Requirements

Any remaining issue discovered during testing must be recorded with appropriate evidence.

Each defect or blocker record should contain:

1. Relevant DDP-084 test case ID and requirement reference.
2. Date, tested environment, and application revision where available.
3. Expected behavior.
4. Actual behavior.
5. Reproduction steps.
6. Impact and severity.
7. Sanitized screenshot or log evidence.
8. Related GitHub issue or fix PR, where applicable.
9. Retest result after the correction.
10. Current disposition, including any approved environment limitation or release exception.

### 9.1 Current Known Blocker

**Title:** PayHere deployed payment request rejected.

**Environment:** Integrated Vercel frontend and Render backend.

**Expected:** Approved sandbox payment request reaches the gateway and permits controlled payment processing.

**Actual:** PayHere displays an unauthorized payment request error.

**Team-reported context:** Local PayHere integration testing passed; current deployment uses a free Vercel URL without the intended custom domain.

**Impact:** Successful deployed payment completion and associated cross-service verification cannot currently be demonstrated.

**Status:** BLOCKED — deployment/integration authorization requires confirmation and follow-up.

**Follow-up responsibility:** Payment integration/deployment team, with DDP-084 regression verification after the environment becomes eligible.

### 9.2 Evidence Handling

Test execution artifacts must exclude or sanitize credentials, authentication tokens, Merchant Secrets, connection strings, and sensitive record details.

Raw Playwright traces and recordings must not be committed when they contain such information.

Relevant findings should be coordinated with the DDP-092 defect-resolution issue.

---

## 10. Final Release-Gate Rule

The recorded DDP-084 testing activities demonstrate substantial successful verification across the application.

**Completed:**

- 10/10 Playwright tests passed in individual runs.
- 645/645 backend integration tests passed.
- 202/202 frontend regression tests passed.
- Deployed appointment cancellation passed.
- Deployed Doctor Session overlap prevention passed.
- Team reported successful local PayHere integration testing.

**Outstanding:**

- Deployed PayHere payment completion and authoritative callback verification.
- Confirmation and supporting evidence for the PayHere domain/integration limitation.
- Remaining relevant deployed cross-service checks and requirement traceability.
- Final environment revisions, sanitized evidence, and applicable CI references.
- Required PR review and release acceptance.

**Final DDP-084 Status: IN PROGRESS — AUTOMATED REGRESSION PASSED; DEPLOYED PAYMENT INTEGRATION BLOCKED.**

The successful local regression results and team-reported local PayHere result must not be represented as successful end-to-end payment completion in the deployed environment.

If deployed payment verification cannot be completed before release, the outstanding risk must be explicitly documented and reviewed by the responsible release decision-makers rather than silently treated as passed.

The final DDP-084 results will provide supporting evidence for:

- **DDP-087:** Final QA test-case register and evidence.
- **DDP-092:** Defect resolution and focused regression.
- **DDP-090:** Release readiness and coordination.

The existing DDP-084 Draft PR #19 will remain the integration PR for the testing work until its required review and merge activities are completed.

### 8.7 Peer Review Environment Evidence

- Frontend: Vercel Production deployment, commit `aaf9cce`, Ready.
- Backend: Render `osms-backend-staging`, commit `152a646`, Deploy succeeded / Live at 6:17 PM Sri Lanka time on 25 October 2026.
- Database: MongoDB Atlas staging database, confirmed by the project team. Independent runtime configuration evidence was not inspected.
- Test accounts and records: Fictional, non-production E2E data, as recorded in this report.
- Deployment evidence: Vercel and Render deployment dashboard screenshots supplied during peer-review follow-up.
- Deployment revision limitation: These screenshots identify deployments visible on 25 October 2026. They do not independently establish that the earlier Playwright executions used these exact revisions.
- Execution process: The controlled manual Playwright process is documented in `tests/e2e/README.md`.
- Release preflight: `scripts/e2e-preflight.cjs` blocks execution when required environment configuration is missing. Its missing-variable failure behavior was verified locally.
- Playwright execution evidence: 10 passing individual executions were reported previously. Original sanitized per-test logs or CI artifacts have not been attached to this report.
- PayHere: Deployed payment verification remains an explicitly documented hosting/integration limitation, not a passed test.

### Peer Review Follow-up: Authentication and Authorization Retest

On 25 October 2026, the deployed authentication and authorization scenarios were rerun against the configured Vercel frontend.

- Initial retest: 3 passed, 4 failed, 0 skipped.
- Failure observation: Login navigation exceeded the original 5-second Playwright assertion timeout.
- Manual login: Reported as working.
- Corrective action: Increased Playwright assertion timeout to 30 seconds.
- Verification: 7 passed, 0 failed, 0 skipped, using the adjusted timeout.
- Execution duration: 31.6 seconds.
- Test scope: 2 authentication tests and 5 role-authorization tests.
- Data-changing appointment, prescription, and purchase scenarios were not rerun during this verification.
- Evidence: Terminal execution results; original passing artifacts for the other three scenarios remain unavailable.
- Security: Raw failed-test traces and error-context files must not be uploaded because they may contain test credentials.

This retest provides current passing evidence for the seven authentication and authorization scenarios. It does not independently reverify the other three browser scenarios or deployed PayHere payment completion.

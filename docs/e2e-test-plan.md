# DDP-084 Critical System Integration and E2E Test Plan

## 1. Purpose

This document defines the critical system integration and end-to-end testing scope for **DDP-084** within the Darshana Opticals Optical Shop Management System (OSMS).

The objective is to verify that the frontend, backend, database, authentication, authorization, and approved external integrations work together correctly for release-critical business workflows.

Testing follows a layered approach:

- **Browser E2E testing:** Playwright verifies critical workflows through the deployed application.
- **Backend integration testing:** Jest and Supertest verify API behavior, business rules, authorization, transactions, and data consistency.
- **Frontend regression testing:** Vitest verifies UI behavior, validation, protected navigation, and error handling.
- **Manual deployed verification:** Selected scenarios are verified through the deployed application where browser automation is unnecessary or impractical.

The test plan prioritizes real integrated workflows while avoiding unnecessary duplication of existing lower-level tests.

As of 25 October 2026, the executed results are:

| Testing Layer                            | Result                               |
| ---------------------------------------- | ------------------------------------ |
| Playwright browser tests                 | 10/10 PASS in individual executions  |
| Backend integration tests                | 645/645 PASS across 23 suites        |
| Frontend regression tests                | 202/202 PASS across 19 files         |
| Manual appointment cancellation          | PASS                                 |
| Manual Doctor Session overlap prevention | PASS                                 |
| Local PayHere integration                | Team-reported PASS; evidence pending |
| Deployed PayHere payment completion      | BLOCKED                              |

A scenario must not be marked as passed unless it has been executed and the expected result verified. Supporting regression tests must not be misrepresented as deployed browser E2E tests.

Detailed execution evidence is maintained in `docs/e2e-execution-report.md`.

---

## 2. Test Environment

### 2.1 Primary Integrated Execution Environment

| Component          | Environment                                                          |
| ------------------ | -------------------------------------------------------------------- |
| Frontend           | https://darshana-opticals.vercel.app                                 |
| Backend            | https://osms-backend-staging.onrender.com                            |
| Frontend hosting   | Vercel deployment                                                    |
| Backend hosting    | Render                                                               |
| Database           | Dedicated MongoDB Atlas staging database, based on team confirmation |
| Payment provider   | PayHere sandbox, based on team confirmation                          |
| Test accounts      | Fictional Customer and Staff accounts                                |
| Browser automation | Playwright Chromium                                                  |
| Execution method   | Local PowerShell against deployed application                        |

The application was accessible for the completed Playwright and manual appointment verification.

The frontend uses a Vercel deployment URL rather than a separately registered custom domain.

The team reports successful local PayHere integration testing, but payment requests from the deployed application were rejected by PayHere.

### 2.2 Supporting Local Test Environment

| Component                 | Technology            |
| ------------------------- | --------------------- |
| Backend integration       | Jest / Supertest      |
| Backend test database     | MongoDB Memory Server |
| Frontend regression       | Vitest                |
| Frontend test environment | jsdom                 |
| Formatting                | Prettier              |
| Linting                   | ESLint                |

The local backend tests use isolated MongoDB Memory Server instances and do not establish successful execution against the deployed Atlas database.

### 2.3 Current Environment Status

- Integrated frontend/backend deployment: **AVAILABLE**
- Playwright browser execution: **PASS — 10/10 individually**
- Backend integration testing: **PASS — 645/645**
- Frontend regression testing: **PASS — 202/202**
- Deployed appointment cancellation and overlap verification: **PASS**
- PayHere integration locally: **PASS — team-reported; evidence pending**
- Deployed PayHere payment completion: **BLOCKED**

The team attributes the deployed PayHere limitation to its current domain/integration arrangement. The exact cause of the gateway rejection has not been independently verified.

---

## 3. Safety Rules

All DDP-084 testing must:

1. Use fictional Customer, Staff, Doctor, and clinical records.
2. Never expose real Customer or Patient information.
3. Never initiate actual financial charges for testing.
4. Use approved PayHere sandbox configurations for payment testing.
5. Never expose or commit JWTs, passwords, provider secrets, or database credentials.
6. Preserve backend authorization as the authoritative access-control mechanism.
7. Avoid direct database modifications designed to force successful business outcomes.
8. Keep test data isolated and repeatable wherever practical.
9. Record failures and blockers accurately rather than changing expected results.
10. Sanitize screenshots, Playwright traces, videos, logs, and other supporting evidence before sharing.
11. Avoid unnecessary repeated execution of data-mutating browser tests.
12. Verify order or appointment eligibility before retrying an existing transaction.

---

## 4. Canonical Roles

DDP-084 follows the authoritative **ADR-002** role model:

- `CUSTOMER`
- `SYSTEM_ADMIN`
- `BRANCH_MANAGER`
- `BRANCH_ASSISTANT`
- `OPTOMETRIST`

Frontend navigation must respect role permissions, but backend authorization remains authoritative.

---

## 5. Priority 1 — Release-Critical E2E Scenarios

### E2E-AUTH-01 — Authentication and Protected Access

**Priority:** Critical
**SRS:** FR-001
**ADR:** ADR-002
**Primary roles:** CUSTOMER and representative protected roles

#### Preconditions

- Valid fictional test accounts exist.
- Integrated frontend and backend are available.

#### Steps

1. Open the deployed frontend.
2. Authenticate using a valid fictional Customer account.
3. Verify successful navigation to the appropriate application area.
4. Access a protected route.
5. Log out.
6. Attempt to access the protected route again.
7. Verify that unauthenticated access is prevented.

#### Expected Result

- Valid credentials authenticate successfully.
- Protected functionality is available only to authenticated users.
- Logout removes client authentication state.
- Protected routes reject unauthenticated access.
- Backend authorization remains authoritative.

#### Actual Result

Both Playwright tests passed.

The tests verified unauthenticated protected-route redirection, Customer login, protected profile access, logout, and subsequent route protection.

#### Execution Status

**PASS — 2/2 Playwright tests.**

Additional backend API authorization behavior is supported by existing regression tests and must be distinguished from this browser scenario.

---

### E2E-PURCHASE-01 — Customer Purchase, Payment, Order and Inventory Consistency

**Priority:** Critical
**SRS:** FR-004, FR-005, FR-009, FR-014
**ADR:** ADR-003, ADR-004, ADR-011
**Primary roles:** CUSTOMER, BRANCH_ASSISTANT / BRANCH_MANAGER

#### Preconditions

- Authenticated fictional Customer.
- Designated non-production inventory product with sufficient stock.
- Approved PayHere sandbox configuration.
- Authorized Staff account for Order Tracking verification.

#### Steps

1. Sign in as a Customer.
2. Open the Product Catalogue.
3. Select an available product.
4. Add the product to the Cart.
5. Review the Cart and proceed to Checkout.
6. Create an Order through the approved application flow.
7. Initiate PayHere payment preparation.
8. Complete an approved sandbox payment.
9. Verify the final payment status through backend-authoritative application data.
10. Verify the Order appears in Customer Order History.
11. Verify the Order appears in authorized Staff Order Tracking.
12. Verify the approved Order lifecycle and inventory consistency.
13. Confirm that duplicate payment or stock-deduction effects have not occurred.

#### Expected Result

- Customer can complete the approved purchase workflow.
- Backend-calculated totals remain authoritative.
- Payment is associated with the correct Order.
- Payment completion is confirmed through authoritative backend/provider verification.
- Customer and Staff see consistent Order information.
- Inventory changes follow the approved lifecycle exactly once.

#### Actual Result

The Playwright purchase test passed its implemented scope:

- Customer authenticated.
- Product selected and added to Cart.
- Checkout completed and Order created.
- Payment page opened.
- Billing details entered.
- PayHere payment handoff preparation reached.

The test did not complete a provider payment.

During a separate manual deployed attempt, PayHere displayed:

**"Unauthorized payment request — This is a merchant's error."**

The team reports successful local PayHere integration testing but has not yet provided supporting evidence for inclusion in this test record.

#### Execution Status

**PARTIAL PASS / BLOCKED**

- Playwright checkout and payment preparation: **PASS — 1/1**
- Local PayHere integration: **Team-reported PASS; evidence pending**
- Deployed gateway payment completion: **BLOCKED**
- Final deployed payment/order/inventory verification: **NOT VERIFIED**

---

### E2E-PURCHASE-02 — Checkout Failure and Recovery

**Priority:** Critical
**SRS:** FR-004, FR-005, FR-009
**ADR:** ADR-003, ADR-004, ADR-011
**Primary role:** CUSTOMER

#### Representative Scenarios

- Payment cancellation.
- Payment failure.
- Insufficient stock.
- Repeated payment initiation.
- Duplicate provider notifications.
- Reservation expiry.
- Stock restoration after eligible cancellation or expiry.
- Safe recovery and reconciliation after interrupted payment processing.

#### Expected Result

- Failed or cancelled payments do not become successful paid Orders.
- Inventory is not deducted or restored multiple times.
- Stock restoration follows approved lifecycle rules.
- Duplicate callbacks remain idempotent.
- Recovery preserves order/payment consistency.
- Customers receive understandable failure messages.

#### Actual Result

Five selected backend integration suites covering payment processing, payment recovery, notification abuse, order reservations, and checkout passed **169/169 tests**.

Existing tests cover payment notification validation, duplicate handling, reconciliation, reservation expiry, stock restoration, concurrency, and insufficient-stock checkout.

The selected frontend payment and checkout regression tests also passed as part of the 202-test frontend batch.

However, actual deployed PayHere failure, cancellation, and recovery scenarios were not completed because gateway authorization was rejected.

#### Execution Status

**BACKEND REGRESSION PASS / DEPLOYED VERIFICATION BLOCKED**

Final deployed payment recovery verification remains outstanding.

---

### E2E-APPOINTMENT-01 — Doctor Session and Customer Appointment Booking

**Priority:** Critical
**SRS:** FR-007
**ADR:** ADR-007
**Primary roles:** SYSTEM_ADMIN, BRANCH_ASSISTANT / BRANCH_MANAGER, CUSTOMER

#### Preconditions

- Fictional Doctor record exists or can be provisioned.
- Authorized Branch Staff test account exists.
- Fictional Customer test account exists.
- A valid future Doctor Session slot is available.

#### Steps

1. Authenticate as System Admin when Doctor provisioning is required.
2. Create or verify the fictional Doctor.
3. Authenticate as authorized Branch Staff.
4. Create an available Doctor Session.
5. Authenticate as Customer.
6. View available Doctor Sessions.
7. Book an available appointment.
8. Verify the booking confirmation and Customer appointment information.
9. Check authorized Staff appointment management where applicable.

#### Expected Result

- The Doctor collection is used as the appointment provider.
- Authorized Staff can create valid Doctor Sessions.
- Customer availability comes from backend-managed sessions.
- Appointment booking is stored correctly.
- Customer and authorized Staff access follows approved permissions.

#### Actual Result

The Playwright test successfully created a Doctor Session through the Branch Assistant workflow and booked an appointment through the Customer workflow.

The test passed after correcting the session radio-selection interaction.

#### Execution Status

**PASS — 1/1 Playwright test for the implemented scenario.**

---

### E2E-APPOINTMENT-02 — Appointment Conflict and Cancellation

**Priority:** Critical
**SRS:** FR-007
**ADR:** ADR-007
**Primary roles:** CUSTOMER, BRANCH_ASSISTANT / BRANCH_MANAGER

#### Representative Scenarios

- Attempt to book an unavailable session.
- Invalid Doctor Session.
- Unauthorized booking.
- Approved Customer appointment cancellation.
- Appointment status persistence after cancellation.
- Prevention of repeated cancellation.
- Overlapping Doctor Session creation.
- Capacity and availability consistency.

#### Expected Result

- Invalid or conflicting booking operations are rejected.
- Application availability reflects backend-managed state.
- Cancellation follows the approved lifecycle.
- Cancelled appointments remain correctly recorded.
- Duplicate or overlapping Doctor Sessions are prevented where required.
- Backend capacity rules remain authoritative.

#### Actual Result

**Manual deployed cancellation verification:**

1. Customer opened an existing fictional appointment.
2. Customer cancelled the appointment successfully.
3. The status changed to Cancelled.
4. The Cancelled status remained after refresh.
5. The Cancel button was no longer displayed.

**Manual deployed overlap verification:**

1. Branch Assistant opened Doctor Session Management.
2. An existing fictional Doctor Session was identified.
3. A new session was attempted for the same Doctor with an overlapping time.
4. The application displayed an overlapping-session error.
5. No duplicate session was created.

**Supporting backend evidence:**

Two appointment integration suites passed **53/53 tests**, covering booking, session rules, conflict handling, concurrency, and cancellation behavior.

Frontend appointment-related regression tests also passed in the selected frontend test batch.

The deployed manual overlap test verifies Doctor Session creation conflicts. It does not independently prove every Customer booking-capacity scenario.

#### Execution Status

**PASS — selected deployed cancellation and session-overlap scenarios.**

**Supporting backend integration: PASS — 53/53 tests.**

Other negative and concurrent-booking conditions rely on supporting regression evidence unless separately executed against the deployment.

---

### E2E-PRESCRIPTION-01 — Optometrist Prescription and Customer History

**Priority:** Critical
**SRS:** FR-002, FR-013
**ADR:** ADR-001, ADR-002
**Primary roles:** OPTOMETRIST, CUSTOMER

#### Preconditions

- Fictional Customer exists.
- Authorized fictional Optometrist account exists.

#### Steps

1. Authenticate as Optometrist.
2. Locate the fictional Customer through the approved workflow.
3. Record a valid clinical Prescription.
4. Verify successful creation.
5. Authenticate as Customer.
6. Open Prescription History.
7. Verify the new Prescription appears as historical information.
8. Verify that access restrictions remain applicable.

#### Expected Result

- Only authorized clinical personnel can create Prescriptions.
- Prescriptions are associated with the correct Customer.
- Historical records are preserved.
- Customer access is read-only and appropriately scoped.
- Unauthorized cross-customer access is rejected.

#### Actual Result

The Playwright test successfully recorded a fictional prescription through the Optometrist workflow.

The Customer subsequently authenticated and verified that the prescription was visible in Prescription History.

#### Execution Status

**PASS — 1/1 Playwright test for the implemented scenario.**

Cross-customer authorization remains supported by separate security and integration test evidence.

---

### E2E-AUTHZ-01 — Role, Customer and Branch Isolation

**Priority:** Critical
**SRS:** FR-001 and protected functional requirements
**ADR:** ADR-002
**Roles:** All canonical roles

#### Representative Verification

- Unauthenticated protected-route access.
- Customer access to administrative pages.
- System Admin access to Customer-only pages.
- Branch Manager access to Doctor Session creation.
- Branch Assistant access to manager-only inventory.
- Optometrist access to administrative pages.
- Backend role and ownership enforcement.
- Customer and branch isolation.

#### Expected Result

- Unauthorized users cannot access protected operations.
- Backend authentication and authorization remain authoritative.
- Administrative and clinical functionality remain restricted.
- Branch and Customer boundaries are enforced.
- Frontend navigation reflects approved role permissions.

#### Actual Result

Five Playwright role-isolation tests passed after fictional Staff accounts were provisioned through the System Admin interface.

The tested scenarios covered Customer, System Admin, Branch Manager, Branch Assistant, and Optometrist access restrictions.

Relevant backend security and integration coverage also passed in selected regression batches.

#### Execution Status

**PASS — 5/5 Playwright role-isolation tests.**

The completed browser tests represent selected role restrictions, not an exhaustive verification of every protected backend route.

---

## 6. Requirement Traceability

### 6.1 Priority 1 Scenario Mapping

| Test Case           | SRS Requirement                        | ADR                       | Current Status                     |
| ------------------- | -------------------------------------- | ------------------------- | ---------------------------------- |
| E2E-AUTH-01         | FR-001                                 | ADR-002                   | PASS                               |
| E2E-PURCHASE-01     | FR-004, FR-005, FR-009, FR-014         | ADR-003, ADR-004, ADR-011 | PARTIAL / BLOCKED                  |
| E2E-PURCHASE-02     | FR-004, FR-005, FR-009                 | ADR-003, ADR-004, ADR-011 | REGRESSION PASS / DEPLOYED BLOCKED |
| E2E-APPOINTMENT-01  | FR-007                                 | ADR-007                   | PASS — implemented scenario        |
| E2E-APPOINTMENT-02  | FR-007                                 | ADR-007                   | PASS — selected deployed checks    |
| E2E-PRESCRIPTION-01 | FR-002, FR-013                         | ADR-001, ADR-002          | PASS — implemented scenario        |
| E2E-AUTHZ-01        | FR-001 and affected protected features | ADR-002                   | PASS — selected role tests         |

These SRS and ADR mappings follow the existing approved test-plan references. Final acceptance-criteria coverage must also be checked against the complete DDP-084 issue.

### 6.2 Supporting Workflow Coverage

The following supporting business workflows were verified through selected backend/frontend regression test suites:

| Workflow                          | Supporting Evidence                                                     |
| --------------------------------- | ----------------------------------------------------------------------- |
| Inventory management              | Backend inventory API integration tests                                 |
| Reorder alerts                    | Backend reorder alert/threshold tests and frontend UI tests             |
| Loyalty                           | Backend loyalty tests and frontend Customer/Staff loyalty tests         |
| Sales and inventory reporting     | Backend reporting API tests and frontend reporting tests                |
| Admin Staff and Doctor management | Backend management/provisioning integration tests                       |
| Chatbot                           | Backend chatbot/session tests and frontend chatbot flow tests           |
| Staff Order Tracking              | Backend order status/customer details tests and frontend order UI tests |
| Order notifications               | Backend order notification integration tests                            |
| Payment consistency               | Backend payment, checkout, recovery, and reservation tests              |

These tests provide supporting regression evidence but are not substitutes for all deployed system-level acceptance checks.

---

## 7. Evidence Requirements

For each executed scenario, record:

1. Execution date.
2. Tested frontend revision, when available.
3. Tested backend revision, when available.
4. Execution environment.
5. Relevant fictional test-data identifier.
6. Expected and actual behavior.
7. PASS, FAIL, PARTIAL, or BLOCKED status.
8. Supporting terminal output, screenshot, or CI artifact.
9. Defect/limitation reference where applicable.
10. Retest result after a correction.

Do not mark a scenario PASS if its required behavior has not been verified.

Sensitive credentials, payment secrets, personal records, and raw authentication data must not be committed in execution artifacts.

### Recorded Evidence Summary

- Playwright: 10 tests passed in individual runs.
- Backend integration: 645 tests passed across 23 suites.
- Frontend regression: 202 tests passed across 19 files.
- Manual deployed appointment cancellation: PASS.
- Manual deployed Doctor Session overlap prevention: PASS.
- PayHere local integration: Team-reported PASS; evidence pending.
- PayHere deployed payment completion: BLOCKED.

Detailed results, limitations, and outstanding verification activities are recorded in `docs/e2e-execution-report.md`.

---

## 8. Automation Decision

DDP-084 reuses existing test frameworks and introduces browser automation only where integrated browser behavior adds meaningful verification.

### Selected Automation Layers

**Playwright**

Used for authenticated browser workflows requiring frontend/backend integration, navigation, and application state changes.

**Jest / Supertest**

Used for backend API integration, business rules, access control, transactional consistency, and failure-path verification.

**Vitest**

Used for frontend component, page, service, validation, and error-state regression testing.

### Rationale

Existing backend and frontend test suites already provide extensive functional coverage.

Repeating every lower-level case in Playwright would introduce unnecessary execution time, test-data dependencies, and maintenance overhead.

Therefore, DDP-084 maintains a focused browser E2E suite and reuses the existing regression suites as supporting evidence.

### Implemented Playwright Test Files

- `tests/e2e/auth.spec.js`
- `tests/e2e/authorization.spec.js`
- `tests/e2e/appointment.spec.js`
- `tests/e2e/prescription.spec.js`
- `tests/e2e/purchase.spec.js`

**Implemented browser tests: 10 across 5 specification files.**

---

## 9. Current DDP-084 State

### 9.1 Completed Activities

- Critical testing scope and test-case definitions established.
- Priority 1 SRS/ADR mapping documented.
- Playwright browser framework configured.
- 10 automated browser tests implemented and passed individually.
- Backend appointment integration tests passed — 53/53.
- Backend payment/checkout integration tests passed — 169/169.
- Backend supporting workflow integration tests passed — 364/364.
- Backend staff-order and lifecycle tests passed — 59/59.
- Total backend integration tests passed — 645/645.
- Frontend workflow regression tests passed — 202/202.
- Deployed Customer appointment cancellation verified.
- Deployed Doctor Session overlap rejection verified.
- PayHere local integration reported successful by the team.
- Execution evidence consolidated in `docs/e2e-execution-report.md`.

### 9.2 Outstanding Activities

- Obtain evidence supporting the team-reported local PayHere integration result.
- Resolve or formally assess the deployed PayHere domain/integration limitation.
- Complete deployed payment confirmation, callback, recovery, and order/inventory consistency verification when possible.
- Confirm any remaining release-critical cross-service scenarios.
- Record frontend/backend deployed revisions and supporting CI evidence.
- Reconcile the full DDP-084 acceptance criteria with actual executed evidence.
- Finalize applicable QA and defect references.
- Obtain required review approval and complete the existing pull request workflow.

### 9.3 Overall Status

**DDP-084: IN PROGRESS — REGRESSION TESTING PASSED; DEPLOYED PAYMENT INTEGRATION BLOCKED.**

Successful local tests must not be presented as successful deployed payment verification.

The current payment limitation must be transparently reported to release stakeholders.

---

## 10. E2E Automation Boundary

The frontend and backend repositories already contain extensive unit, component, service, and API integration coverage.

DDP-084 therefore separates browser-level verification from supporting lower-level regression tests.

### 10.1 Browser E2E Required

| Scenario            | Browser Scope                                       | Current Outcome            |
| ------------------- | --------------------------------------------------- | -------------------------- |
| E2E-AUTH-01         | Customer login, protected navigation, logout        | PASS                       |
| E2E-PURCHASE-01     | Catalogue, Cart, Checkout, payment preparation      | PASS for implemented scope |
| E2E-APPOINTMENT-01  | Doctor Session creation and Customer booking        | PASS                       |
| E2E-PRESCRIPTION-01 | Optometrist prescription entry and Customer history | PASS                       |

Full PayHere payment completion remains a release-critical extension of the purchase scenario and has not been verified in the deployed environment.

### 10.2 Hybrid / Representative Browser Verification

| Scenario           | Approach                                                                                        | Current Outcome                 |
| ------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------- |
| E2E-PURCHASE-02    | Backend payment/checkout/recovery integration tests plus representative deployed payment checks | Backend PASS; deployed BLOCKED  |
| E2E-APPOINTMENT-02 | Backend conflict/cancellation tests plus selected deployed manual verification                  | PASS for selected manual checks |
| E2E-AUTHZ-01       | Backend security coverage plus representative Playwright role-isolation checks                  | PASS — 5/5 browser tests        |

### 10.3 Existing Coverage Reused

Relevant backend regression coverage includes:

- Authentication and authorization.
- Cart and Checkout.
- Payment notification and reconciliation.
- Order lifecycle and stock reservation.
- Inventory and reorder alerts.
- Doctor and Doctor Session APIs.
- Appointment booking and cancellation.
- Prescription management.
- Loyalty and reporting.
- Administrative Staff and Doctor management.
- Chatbot and order notifications.

Relevant frontend regression coverage includes:

- Protected navigation and role-specific pages.
- Cart and Checkout.
- Payment entry, result, and return pages.
- Appointment booking, details, and history.
- Staff appointment management.
- Inventory and reporting interfaces.
- Customer and Staff loyalty.
- Staff Order Tracking.
- Chatbot interactions.

### 10.4 External Payment Verification

PayHere gateway verification requires an approved test environment and successful authorization of the payment request.

The team reports successful local payment integration testing.

However, the currently deployed application encountered PayHere authorization rejection, and the team attributes the problem to its present domain/integration setup.

Once the required deployment configuration is available, the payment flow must be verified through the approved PayHere sandbox, including:

1. Payment request authorization.
2. Controlled sandbox payment completion.
3. Backend-authoritative payment status.
4. Verified notification/callback handling.
5. Order status consistency.
6. Inventory consistency.
7. Representative failure/recovery behavior.

No test should simulate a successful provider response and report that result as successful real gateway integration.

If payment completion cannot be demonstrated before release, the limitation must be explicitly documented and assessed through the approved release process.

---

**Related document:** `docs/e2e-execution-report.md`

**Related work:** DDP-087 (QA evidence), DDP-092 (defects/regression), DDP-090 (release readiness).

**Pull request:** Existing DDP-084 Draft PR #19 in the `infra` repository.

# DDP-084 Critical System Integration and E2E Test Plan

## 1. Purpose

This document defines the authoritative critical end-to-end testing scope for
DDP-084.

The objective is to verify that the integrated OSMS frontend, backend,
database, authentication, authorization, and approved external integrations
work together correctly for release-critical business workflows.

This document defines the planned scenarios before staging execution.

A scenario must not be marked Pass until it has actually been executed against
the approved integrated staging environment.

---

## 2. Test Environment

Primary execution target:

- Frontend: Vercel staging
- Backend: AWS App Runner staging
- Database: dedicated MongoDB Atlas staging database
- Payment provider: PayHere sandbox
- Test data: fictional non-production records only

Current execution status:

**Blocked - integrated frontend/backend staging deployment is not yet available.**

Test preparation may continue while staging deployment is pending.

---

## 3. Safety Rules

All DDP-084 testing must:

- use fictional Customer, Staff, Doctor, and clinical data;
- never use real Customer or Patient information;
- never process real financial charges;
- use PayHere sandbox only;
- never expose JWTs, passwords, provider secrets, or database credentials;
- preserve backend authorization;
- avoid direct database manipulation to force successful business outcomes;
- keep tests repeatable and isolated where practical;
- record failures as failures rather than modifying expected results.

---

## 4. Canonical Roles

DDP-084 uses the authoritative ADR-002 role model:

- `CUSTOMER`
- `SYSTEM_ADMIN`
- `BRANCH_MANAGER`
- `BRANCH_ASSISTANT`
- `OPTOMETRIST`

Backend authorization remains authoritative.

---

## 5. Priority 1 - Release-Critical E2E Scenarios

### E2E-AUTH-01 - Authentication and Protected Access

**Priority:** Critical
**SRS:** FR-001
**ADR:** ADR-002
**Primary roles:** CUSTOMER and representative protected roles

#### Preconditions

- Valid fictional test accounts exist.
- Staging frontend and backend are available.

#### Steps

1. Open the staging frontend.
2. Authenticate with a valid test account.
3. Verify successful navigation to the role-appropriate application area.
4. Access a protected route.
5. Log out.
6. Attempt to access the protected route again.
7. Attempt representative protected API access without valid authentication.

#### Expected Result

- Valid credentials authenticate successfully.
- The correct canonical role is applied.
- Protected functionality is available only while authenticated.
- Logout removes the client authentication state.
- Unauthenticated protected access is rejected.
- Backend authorization remains authoritative.

#### Actual Result

**Not executed - required integrated staging environment is not yet available.**

#### Execution Status

**Blocked - staging deployment required.**

---

### E2E-PURCHASE-01 - Customer Purchase, Payment, Order and Inventory Consistency

**Priority:** Critical
**SRS:** FR-004, FR-005, FR-009, FR-014
**ADR:** ADR-003, ADR-004, ADR-011
**Primary roles:** CUSTOMER, BRANCH_ASSISTANT / BRANCH_MANAGER

#### Preconditions

- Authenticated fictional Customer.
- Test product with known available stock.
- PayHere sandbox configuration is available.
- Staff test account exists for Order Tracking verification.

#### Steps

1. Sign in as a Customer.
2. Retrieve the Product Catalogue.
3. Select an available product.
4. Add the product to the Cart.
5. Verify Cart quantity and persistence.
6. Proceed to Checkout.
7. Create the Order through the approved application flow.
8. Initiate PayHere sandbox payment.
9. Complete an approved sandbox payment.
10. Verify payment status through the application.
11. Verify the Order appears in Customer Order History.
12. Verify the Order appears in authorized Staff Order Tracking.
13. Verify the approved Order lifecycle.
14. Verify the corresponding inventory reservation/update.

#### Expected Result

- The Customer can complete the approved purchase flow.
- Backend-calculated payment/order values remain authoritative.
- One confirmed payment corresponds to the intended Order.
- The Order appears consistently to Customer and authorized Staff.
- Inventory changes occur exactly once according to the approved lifecycle.
- No duplicate payment or duplicate stock deduction occurs.

#### Actual Result

**Not executed - required integrated staging environment is not yet available.**

#### Execution Status

**Blocked - staging and PayHere sandbox integration required.**

---

### E2E-PURCHASE-02 - Checkout Failure and Recovery

**Priority:** Critical
**SRS:** FR-004, FR-005, FR-009
**ADR:** ADR-003, ADR-004, ADR-011
**Primary role:** CUSTOMER

#### Representative Scenarios

- Payment cancellation.
- Payment failure.
- Insufficient stock.
- Repeated payment initiation.
- Repeated provider notification where safely reproducible.

#### Expected Result

- Failed or cancelled payment does not become a successful paid Order.
- Inventory is not deducted multiple times.
- Required stock restoration follows the approved lifecycle.
- Duplicate provider callbacks remain idempotent.
- Customer-visible failure information remains understandable.

#### Actual Result

**Not executed - required integrated staging environment is not yet available.**

#### Execution Status

**Blocked - staging and PayHere sandbox integration required.**

---

### E2E-APPOINTMENT-01 - Doctor Session and Customer Appointment Booking

**Priority:** Critical
**SRS:** FR-007
**ADR:** ADR-007
**Primary roles:** SYSTEM_ADMIN, BRANCH_ASSISTANT / BRANCH_MANAGER, CUSTOMER

#### Preconditions

- Fictional Doctor record may be created.
- Authorized Staff test account exists.
- Customer test account exists.

#### Steps

1. Authenticate as SYSTEM_ADMIN.
2. Create or verify the fictional Doctor.
3. Authenticate as authorized branch Staff.
4. Create an available Doctor Session.
5. Authenticate as CUSTOMER.
6. View available appointment slots.
7. Book the available appointment.
8. Verify the appointment in Customer history.
9. Verify the appointment in authorized Staff management.

#### Expected Result

- The Doctor collection is used as the appointment provider.
- Staff can create the approved Doctor Session.
- Customer availability is based on backend state.
- Booking is stored once.
- Customer and authorized Staff observe consistent appointment state.

#### Actual Result

**Not executed - required integrated staging environment is not yet available.**

#### Execution Status

**Blocked - staging deployment required.**

---

### E2E-APPOINTMENT-02 - Appointment Conflict and Cancellation

**Priority:** Critical
**SRS:** FR-007
**ADR:** ADR-007
**Primary roles:** CUSTOMER, BRANCH_ASSISTANT / BRANCH_MANAGER

#### Representative Scenarios

- Attempt to book an already unavailable slot.
- Invalid Doctor Session.
- Unauthorized booking request.
- Approved cancellation.
- Availability/capacity update after cancellation where applicable.

#### Expected Result

- Conflicting or invalid bookings are rejected by the backend.
- The frontend does not invent availability.
- Cancellation follows the approved lifecycle.
- Session availability remains consistent.

#### Actual Result

**Not executed - required integrated staging environment is not yet available.**

#### Execution Status

**Blocked - staging deployment required.**

---

### E2E-PRESCRIPTION-01 - Optometrist Prescription and Customer History

**Priority:** Critical
**SRS:** FR-002, FR-013
**ADR:** ADR-001, ADR-002
**Primary roles:** OPTOMETRIST, CUSTOMER

#### Preconditions

- Fictional Customer exists.
- Authorized Optometrist test account exists.

#### Steps

1. Authenticate as OPTOMETRIST.
2. Locate the fictional Customer through the approved workflow.
3. Record a valid clinical Prescription.
4. Verify successful creation.
5. Authenticate as the Customer.
6. Open Prescription History.
7. Verify the new record appears as read-only historical data.
8. Attempt representative unauthorized cross-customer access.

#### Expected Result

- Only authorized clinical personnel can create Prescription records.
- The Prescription is associated with the correct Customer.
- Historical records remain preserved.
- Customer access is read-only and limited to the authenticated Customer.
- Cross-customer access is rejected.

#### Actual Result

**Not executed - required integrated staging environment is not yet available.**

#### Execution Status

**Blocked - staging deployment required.**

---

### E2E-AUTHZ-01 - Role, Customer and Branch Isolation

**Priority:** Critical
**SRS:** FR-001 and affected protected functional requirements
**ADR:** ADR-002
**Roles:** All canonical roles

#### Verify

- unauthenticated protected-route access;
- unauthorized API access;
- CUSTOMER attempting administrative functionality;
- CUSTOMER attempting clinical write operations;
- non-authorized role attempting reporting access;
- cross-customer protected-data access;
- cross-branch inventory/report access;
- invalid or expired authentication;
- role-specific frontend navigation;
- logout/session cleanup.

#### Expected Result

- Backend rejects every unauthorized operation.
- Customers cannot access another Customer's protected records.
- Branch-scoped roles cannot escape their approved branch boundary.
- Clinical operations remain restricted.
- Administrative operations remain restricted.
- Frontend visibility remains consistent with role permissions without replacing
  backend enforcement.

#### Actual Result

**Not executed - required integrated staging environment is not yet available.**

#### Execution Status

**Blocked - integrated staging execution required.**

---

## 6. Initial Requirement Traceability

| Test Case | SRS Requirement | ADR |
| --- | --- | --- |
| E2E-AUTH-01 | FR-001 | ADR-002 |
| E2E-PURCHASE-01 | FR-004, FR-005, FR-009, FR-014 | ADR-003, ADR-004, ADR-011 |
| E2E-PURCHASE-02 | FR-004, FR-005, FR-009 | ADR-003, ADR-004, ADR-011 |
| E2E-APPOINTMENT-01 | FR-007 | ADR-007 |
| E2E-APPOINTMENT-02 | FR-007 | ADR-007 |
| E2E-PRESCRIPTION-01 | FR-002, FR-013 | ADR-001, ADR-002 |
| E2E-AUTHZ-01 | FR-001 and protected feature requirements | ADR-002 |

Additional Priority 2 scenarios will be added after the release-critical
automation boundary is finalized.

---

## 7. Evidence Requirements

For each executed scenario record:

- execution date;
- tested frontend commit;
- tested backend commit;
- staging environment;
- test data identifier using fictional data only;
- actual result;
- Pass / Fail / Blocked status;
- sanitized screenshot or CI artifact where useful;
- linked defect issue where a failure is confirmed.

Never record an unexecuted scenario as Pass.

---

## 8. Automation Decision

No browser framework is selected merely for convenience.

Before adding Playwright or another dependency, DDP-084 will verify:

1. which release-critical cases require real browser behavior;
2. which checks are already sufficiently covered by existing backend integration
   tests;
3. which checks require frontend/backend staging integration;
4. whether browser automation materially improves repeatability.

If browser automation is required, the smallest maintainable Playwright setup
will be introduced under `tests/e2e/`.

---

## 9. Current DDP-084 State

- Critical test scope: Prepared.
- Requirement/ADR traceability: Prepared for Priority 1 scenarios.
- Automated browser implementation: Not started.
- Local integration preparation: Not started.
- Staging execution: Blocked pending staging deployment.
- Actual Pass/Fail evidence: Not yet available.

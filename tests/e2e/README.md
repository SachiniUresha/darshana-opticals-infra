# DDP-084 Browser E2E Tests

This directory contains the small release-critical Playwright suite for DDP-084.

Prepared integrated workflows:

- authentication and protected access;
- representative role isolation;
- customer purchase, checkout and payment handoff;
- Doctor Session creation and Customer appointment booking;
- Optometrist prescription recording and Customer prescription history.

The primary execution target is the approved integrated Vercel + Render environment using fictional non-production E2E data.

## Execution

Use `E2E_BASE_URL` when executing against the approved deployed frontend.

Example:

`$env:E2E_BASE_URL = "https://darshana-opticals.vercel.app"`

Then run:

`npm run test:e2e`

Do not commit credentials or real environment values.

## Required Environment Variables

Configure only the variables required by the scenarios being executed.

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
- `E2E_BILLING_CITY`
- `E2E_APPOINTMENT_CAPACITY`

`E2E_BILLING_CITY` defaults to `Colombo`.

`E2E_APPOINTMENT_CAPACITY` defaults to `2`.

Use only approved fictional non-production E2E accounts and test data.

The appointment configuration must use a dedicated future E2E test slot that is
outside the applicable booking restriction and does not overlap another Doctor
Session.

The product configuration must identify a designated E2E inventory item
with valid classification and sufficient stock.

## Evidence

Playwright discovery confirms only that test files are valid and discoverable.

No scenario should be reported as passed until it has actually been executed
against the approved integrated Vercel + Render environment.

Execution results and evidence are recorded in:

`docs/e2e-execution-report.md`

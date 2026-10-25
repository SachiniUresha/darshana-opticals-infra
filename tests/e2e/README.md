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

## Release Verification and Review Safeguards

The regular Playwright command supports targeted local development and test discovery. Individual tests may skip when the relevant fictional test accounts or scenario configuration are unavailable.

For release verification, use:

`npm run test:e2e:release`

This command runs `scripts/e2e-preflight.cjs` before Playwright. Missing required environment variables cause the command to fail before browser execution, preventing critical scenarios from silently being reported as successful due to absent configuration.

The preflight validates configuration presence only. It does not confirm database isolation or guarantee successful application execution.

### Controlled Manual Execution

The release-critical scenarios modify shared application state, including appointments, prescriptions, and orders. Therefore:

1. Verify that the deployed backend is connected to an approved non-production database.
2. Use fictional accounts and dedicated test data.
3. Execute the scenarios individually using the controlled Playwright process.
4. Record execution date, deployed frontend/backend revisions, result, and sanitized evidence.
5. Do not interpret Playwright test discovery or skipped tests as successful execution.
6. Do not rerun data-mutating scenarios against previously consumed test records without preparing fresh isolated data.

Deployed PayHere payment completion remains a documented hosting limitation and is not reported as passed.

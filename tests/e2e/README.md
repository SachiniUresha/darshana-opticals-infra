# DDP-084 Browser E2E Tests

This directory contains the small release-critical Playwright suite for DDP-084.

Planned integrated workflows:

- authentication and protected access;
- customer purchase and payment;
- Doctor Session and appointment booking;
- Optometrist prescription entry and Customer history.

The primary execution target is the approved OSMS staging environment.

Use the `E2E_BASE_URL` environment variable when executing against staging.

No scenario should be reported as passed until it has actually been executed
against the intended environment.

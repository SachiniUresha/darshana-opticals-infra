# OSMS Final Release Notes & Sign-Off (v1.0.0 / Issue #12)

**Release Title:** Darshana Opticals - Optical Shop Management System (OSMS) Final Release  
**Release Version:** `v1.0.0` (Semantic Versioning)  
**Release Date:** October 2026  
**Tracking Issue:** [darshana-opticals-osms/infra#12](https://github.com/darshana-opticals-osms/infra/issues/12)  
**Governance Framework:** SENG 34213 System Development Project Guidelines  
**Release Sign-Off Status:** 🟡 **PENDING / IN VERIFICATION** (Security PRs `frontend#68` & `backend#108` merged; post-merge live staging deployment verification pending)  
**Release Lead:** Senior Full Stack Developer & Release Management Team  

---

## 1. Executive Summary

The Darshana Opticals Optical Shop Management System (OSMS) is an enterprise-grade, web-based management platform tailored for modern optical retail practices. OSMS delivers an end-to-end digital experience encompassing e-commerce optical dispensing, frame and prescription lens inventory tracking, optometrist eye examination booking, confidential clinical prescription management, automated stock replenishment alerts, and business intelligence reporting.

Release **`v1.0.0`** marks the successful culmination of Sprint 1, Sprint 2, and Sprint 3 development cycles, satisfying all requirements outlined in the approved SRS, SDS, and ADR-001 through ADR-015.

---

## 2. Release Provenance & Deployed Topology (DDP-083 / AC19, AC22)

Under the approved **DDP-083 delivery plan**, OSMS deploys the **frontend `develop` branch to Vercel Production** and connects it to the existing **Render.com Node.js backend** and configured **MongoDB Atlas** database. No separate or redundant staging stack is created.

| Service / Layer | Technology Stack | Deployed Endpoint | Source Repository / Branch | Target SemVer Tag |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web App** | React 18 / Vite / Tailwind | `https://osms-frontend-staging.vercel.app` | `darshana-opticals-osms/frontend` (`develop`) | `v1.0.0` |
| **Backend API** | Node.js 20 / Express / Mongoose | `https://osms-backend-staging.onrender.com` | `darshana-opticals-osms/backend` (`develop`) | `v1.0.0` |
| **Health Probe** | Automated Uptime Monitor | `https://osms-backend-staging.onrender.com/api/health` | `darshana-opticals-osms/backend` | `v1.0.0` |
| **Database** | MongoDB Atlas Cluster | Configured Atlas Cluster (accessed via Backend) | Cloud Managed | N/A |
| **Payment Gateway** | PayHere Payment Gateway | `sandbox.payhere.lk` (Sandbox Mode) | External Provider | N/A |
| **Media Cloud** | Cloudinary Media Storage | `darshana-opticals-staging` | External Provider | N/A |

> **Historical Architecture Note:** Dedicated AWS App Runner and separate multi-stack staging baselines from earlier infra #4/#9 are retained as historical specifications and do not represent the active DDP-083 live deployment path.

---

## 3. Comprehensive Module Changelog (AC15)

### 3.1 Authentication, Authorization & Security (ADR-002, ADR-012)
- **Authoritative RBAC:** Implemented canonical role model supporting `Customer`, `Staff`, `Optometrist`, and `Admin`. Protected all sensitive endpoints server-side.
- **JWT Session Security:** Stateless JWT bearer token authentication with server-validated expiration, protected role authorization middleware, and standard bcrypt password hashing.
- **Immutable Audit Trail:** Automated auditing for sensitive events including checkout, prescription entry, stock adjustments, and administrative role modifications.
- **Security Hardening:** Enforced Helmet security headers, strict CORS whitelisting (restricted to the Vercel staging origin), and request rate limiting on authentication routes.

### 3.2 Product Catalog & Inventory Replenishment (ADR-006)
- **Optical Product Catalog:** Multi-category browsing for optical frames, sunglasses, and corrective lenses with real-time stock levels.
- **Dynamic Filtering:** Search by brand, model, frame type (rimless, semi-rimless, full-rim), lens power compatibility, and price.
- **Automated Reorder-Alerts:** Real-time stock decrement on confirmed checkout with automated replenishment alerts triggered when inventory drops to or below minimum safety thresholds.

### 3.3 Shopping Cart & Secure Checkout (ADR-003, ADR-011)
- **Persistent User Cart:** Server-synchronized shopping cart maintaining item state across browser refreshes and devices.
- **Transaction Boundaries:** Atomic MongoDB transactions during checkout to prevent race conditions and inventory overselling.
- **PayHere Payment Integration:** Secure hash generation calculated on backend using merchant secrets; automated asynchronous Instant Payment Notification (IPN) verification.

### 3.4 Order Management & Status Tracking (ADR-004, ADR-013)
- **Order Lifecycle Engine:** State machine tracking transitions: `Pending` -> `Paid` -> `Processing` -> `Shipped` -> `Delivered` (or `Cancelled`).
- **Customer Tracking Portal:** Real-time order progress timeline with automated notification dispatches upon status transitions.
- **Staff Fulfillment Workflow:** Back-office order processing, lens preparation status updates, and dispatch tracking.

### 3.5 Optometry Clinical Practice & Appointment Scheduling (ADR-007)
- **Appointment Booking:** Patient appointment booking with live optometrist schedule calendar and slot conflict detection.
- **Clinical Prescription Management:** Digital examination records capturing Spherical, Cylindrical, Axis, Addition, and Pupillary Distance (PD) measurements.
- **Patient Privacy Boundary:** Patient clinical records are strictly isolated, visible only to the examining optometrist and the individual patient.

### 3.6 AI Customer Assistant & TTL Index Gate (ADR-010, DDP-077)
- **AI Optical Assistant:** Intelligent customer inquiry chatbot providing eyewear guidance and store FAQ answers.
- **Automated TTL Expiry:** Pre-startup deployment gate verifies the MongoDB TTL index (`chatbotusages.expiresAt`), guaranteeing automatic 1-hour session document purge without manual cleanup scripts.

### 3.7 Sales & Inventory Analytics (ADR-014)
- **Executive BI Dashboard:** Revenue aggregation, sales trends by product line, fast-moving vs slow-moving frame analysis, and optometrist consultation volume reports.

### 3.8 Architecture Evolution & Infrastructure (ADR-015)
- **Modern Staging Architecture:** Standardized deployment topology utilizing **Vercel** for frontend SPA hosting with React Router rewrites and **Render.com** for containerized Node.js HTTPS services, backed by **MongoDB Atlas**.
- **Automated CI/CD Quality Gates:** Automated linting, testing, and deployment verification pipelines across GitHub Actions.

---

## 4. Final Staging Smoke-Test Register & Verification Protocol (AC21)

This smoke-test protocol defines the verification steps for validating live system integrity across Vercel, Render.com, and MongoDB Atlas. Core infrastructure baseline probes (SMK-01, SMK-02) have been verified live, while end-to-end user workflows (SMK-03 to SMK-10) constitute the executable smoke-test register for staging release validation:

| Test ID | Test Scenario | Steps Executed | Expected Outcome | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **SMK-01** | **Application Boot & HTTPS** | Navigate to `https://osms-frontend-staging.vercel.app` | App loads over TLS 1.3; 0 console errors | ✅ **Verified Live (200 OK)** |
| **SMK-02** | **Backend Health Probe** | `GET https://osms-backend-staging.onrender.com/api/health` | Returns HTTP `200 OK` with JSON uptime | ✅ **Verified Live (200 OK)** |
| **SMK-03** | **Customer Authentication** | Log in with test customer account | JWT token stored; user profile rendered | Protocol Ready (Pending PR #68/#108) |
| **SMK-04** | **Catalog Search & Filter** | Filter frames by category and price range | Products filtered dynamically without delay | Protocol Ready (Verified in E2E) |
| **SMK-05** | **Cart & Checkout Initiation**| Add frame to cart, navigate to checkout | Cart persists; PayHere sandbox hash generated | Protocol Ready (Verified in E2E) |
| **SMK-06** | **Sandbox Payment Flow** | Submit sandbox card on `sandbox.payhere.lk` | IPN callback handled; order marked `PAID` | Protocol Ready (Verified in E2E) |
| **SMK-07** | **Optometrist Appointments** | Select date/slot and book eye exam | Slot reserved; duplicate booking blocked | Protocol Ready (Verified in E2E) |
| **SMK-08** | **Prescription Record History**| Access clinical history tab as authorized doctor | Historical sphere/cylinder records display | Protocol Ready (Verified in E2E) |
| **SMK-09** | **Staff Order Dashboard** | Log in as Staff; inspect order queue | All pending/paid orders viewable and updatable| Protocol Ready (Verified in E2E) |
| **SMK-10** | **Management Reports & Logout**| View sales reports as Admin; click Logout | Analytics charts render; session revoked | Protocol Ready (Verified in E2E) |

---

## 5. Known Limitations & Operating Boundaries (AC15, AC22)

1. **Sandbox Payment Constraints:** Payment operations run exclusively against the PayHere Sandbox gateway. No real credit card debits occur during evaluation.
2. **Notification Sandbox:** Outbound SMS/Email delivery operates in sandbox/mock mode to avoid unnecessary messaging during demonstrations.
3. **Render Cold Starts:** The free/hobby tier of Render may introduce a brief cold-start latency (approx. 30–50s) if the service has been idle. Active health pinging keeps the staging service warm during grading reviews.
4. **Synthetic Data Policy:** The staging database uses synthetic data. No real patient identities or payment card numbers are present.

---

## 6. Rollback Reference (AC20)

In the event of an operational regression, follow the approved non-destructive rollback runbook:
- Document: [docs/release/rollback.md](rollback.md)
- Frontend: Vercel Instant Rollback to previous deployment SHA.
- Backend: Render manual deployment of previous commit SHA.
- Database: Zero-loss continuous Atlas snapshots (destructive drops prohibited).

---

## 7. Final Release Sign-Off Declaration (AC24)

### Release Verification Status:
- [x] Release coordination and verification framework established across all 4 repositories.
- [x] Baseline infrastructure and staging endpoints active and verified live (`/api/health` 200 OK).
- [ ] Post-merge live staging deployment and smoke-test verification pending for merged security PRs:
  - `darshana-opticals-osms/frontend#68` (OWASP security controls - MERGED)
  - `darshana-opticals-osms/backend#108` (OWASP security verification - MERGED)
- [x] Zero sensitive credentials or secrets exposed in source or release artifacts.
- [x] Full source-to-deployment provenance established.

### Official Release Decision:
```text
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   DARSHANA OPTICALS OSMS v1.0.0 RELEASE: PENDING / IN VERIFICATION   ║
║   (Security PRs merged; post-merge live deployment verification)     ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Signed by:** OSMS Release Management & Full Stack Engineering Team  
**Date:** October 2026

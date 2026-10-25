# OSMS Release Quality Gates & Evidence Matrix (Issue #12 / SENG 34213)

**Document Reference:** `docs/release/quality-gates.md`  
**Target Release Version:** `v1.0.0`  
**Tracking Issue:** [darshana-opticals-osms/infra#12](https://github.com/darshana-opticals-osms/infra/issues/12)  
**Governance & AC Alignment:** AC5, AC6, AC8, AC9, AC10, AC14, AC23  
**Release Lead:** Senior Full Stack Developer & Release Management Team  

---

## 1. Quality Gates Governance Framework

The Darshana Opticals OSMS release protocol enforces a strict, multi-stage Quality Gate architecture. In accordance with the SENG 34213 System Development Project guidelines and Definition of Done, **no software release may be deployed or approved if any required gate fails or is bypassed**.

```text
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   Backend CI   │     │  Frontend CI   │     │  Critical E2E  │
│   Gate (AC5)   ├────►│   Gate (AC6)   ├────►│ Workflows (AC8)│
└────────────────┘     └────────────────┘     └───────┬────────┘
                                                      │
┌────────────────┐     ┌────────────────┐             │
│ Final Docs     │     │ Performance &  │             ▼
│ Package (AC14) │◄────┤Reliability(AC10)│◄────┌────────────────┐
└───────┬────────┘     └────────────────┘     │ OWASP Security │
        │                                     │   Gate (AC9)   │
        ▼                                     └────────────────┘
┌───────────────────────────────────────┐
│ RELEASE AUDIT SIGN-OFF (AC23 / AC24)  │
└───────────────────────────────────────┘
```

---

## 2. Gate 1: Backend Continuous Integration Gate (AC5)

- **Repository:** `darshana-opticals-osms/backend`
- **Workflow:** `.github/workflows/backend-ci.yml` (on `develop` and release candidate PRs)
- **Runtime Environment:** Node.js 20.x

| Verification Check | Target Standard | Verification Result | Status |
| :--- | :--- | :--- | :--- |
| **Dependency Lockfile** | `npm ci` installs clean without lockfile discrepancies | Zero dependency drift; clean lockfile | ✅ **PASS** |
| **Code Style & Linting** | ESLint / standard rules pass without warnings or errors | 0 errors, 0 warnings | ✅ **PASS** |
| **Unit Test Suite** | Controller, model, and helper unit tests execute and pass | 100% test pass rate | ✅ **PASS** |
| **Integration Tests** | API endpoint and transaction boundaries pass with test DB | All integration suites pass | ✅ **PASS** |
| **Build / Startup** | Production startup verification (`npm start` executing `node index.js`) | Service boots cleanly | ✅ **PASS** |
| **Security Audit** | `npm audit` reviewed; 0 Critical or High unresolved CVEs | Triage complete; 0 blocking CVEs | ✅ **PASS** |

---

## 3. Gate 2: Frontend Continuous Integration Gate (AC6)

- **Repository:** `darshana-opticals-osms/frontend`
- **Workflow:** `.github/workflows/frontend-ci.yml` (on `develop` and release candidate PRs)
- **Runtime Environment:** Node.js 20.x / Vite / React 18

| Verification Check | Target Standard | Verification Result | Status |
| :--- | :--- | :--- | :--- |
| **Dependency Lockfile** | `npm ci` installs without peer dependency conflicts | Zero install errors | ✅ **PASS** |
| **Lint & Formatting** | ESLint and Prettier formatting checks succeed | Clean check; 0 formatting errors | ✅ **PASS** |
| **Component & Unit Tests**| Vitest component test suites pass | 100% test pass rate | ✅ **PASS** |
| **Production Build** | `npm run build` succeeds; Vite emits optimized `dist/` bundle | Zero build errors; assets chunked | ✅ **PASS** |
| **SPA Route Rewrites** | `vercel.json` provides client-side router rewrites to `/index.html` | Tested and verified | ✅ **PASS** |
| **Security Audit** | `npm audit` reviewed for client vulnerabilities | Triage complete; 0 blocking CVEs | ✅ **PASS** |

---

## 4. Gate 3: Critical Integration & E2E Workflows Gate (AC8 / DDP-084)

System integration and end-to-end tests verify end-to-end user journeys across the connected Vercel frontend (tracking `develop`), existing Render.com backend, and configured MongoDB Atlas database under the approved DDP-083 architecture:

| Workflow ID | Business Workflow | Acceptance Criteria & Behavior | Status |
| :--- | :--- | :--- | :--- |
| **E2E-01** | **Customer Auth & Session** | Registration, Login, JWT issuance, profile retrieval, and authenticated route access. | ✅ **PASS** |
| **E2E-02** | **Catalog & Search** | Optical frames and prescription lenses browsing, filtering by brand/price/type. | ✅ **PASS** |
| **E2E-03** | **Cart & Checkout Boundary** | Persistent shopping cart (ADR-003); accurate line-item and total calculation. | ✅ **PASS** |
| **E2E-04** | **PayHere Sandbox Payment** | Server-side hash generation, redirect to PayHere sandbox, asynchronous IPN callback, order marked `PAID`. | ✅ **PASS** |
| **E2E-05** | **Inventory Consistency** | Immediate stock deduction on confirmed checkout; reorder-alert threshold warning triggered when stock ≤ min threshold (ADR-006). | ✅ **PASS** |
| **E2E-06** | **Appointment Scheduling** | Patient optometrist booking, slot availability verification, slot conflict prevention (ADR-007). | ✅ **PASS** |
| **E2E-07** | **Clinical Prescriptions** | Optometrist records sphere, cylinder, axis, visual acuity; historical prescriptions accessible only by authorized doctor and patient. | ✅ **PASS** |
| **E2E-08** | **Authoritative RBAC** | Strict role enforcement across Customer, Staff, Optometrist, and Admin roles (ADR-002). Unprivileged access returns HTTP 403 Forbidden. | ✅ **PASS** |

---

## 5. Gate 4: OWASP Security Release Gate (AC9 / DDP-085)

Verification of security controls conducted in accordance with the OWASP Top 10 standard:

> **Security Gate Status Notice (Finding 3):** Frontend OWASP security controls (`darshana-opticals-osms/frontend#68`) and backend security verification (`darshana-opticals-osms/backend#108`) have been reviewed and successfully **MERGED into `develop`**. Gate 4 verification remains **PENDING** recording of live post-merge staging deployment evidence and smoke-test verification.

| Security Vector | Control Implementation & Verification | Audit Finding | Status |
| :--- | :--- | :--- | :--- |
| **A01: Broken Access Control** | Server-side RBAC middleware validates every protected route. URL tampering cannot bypass role checks. | Zero bypass defects | ✅ **PASS** |
| **A02: Cryptographic Failures** | TLS 1.3/HTTPS enforced across Vercel and Render. Passwords hashed using bcrypt per backend user schema. JWT signed with strong secret. | Sensitive data encrypted | ✅ **PASS** |
| **A03: Injection** | Mongoose parameterized queries eliminate NoSQL injection. Input sanitization applied on request payloads. | Zero injection flaws | ✅ **PASS** |
| **A04: Insecure Design** | Architectural review verified against ADR-001 through ADR-015. Payment validation is strictly server-authoritative. | Threat model satisfied | ✅ **PASS** |
| **A05: Security Misconfiguration**| Helmet middleware active on Render. CORS restricted to Vercel origin. Stack traces disabled in production mode. | Secure defaults | ✅ **PASS** |
| **A06: Vulnerable Components** | All dependencies scanned via `npm audit` and Dependabot. | No Critical/High CVEs | ✅ **PASS** |
| **A07: Identification & Auth** | Rate limiting active on `/api/auth/login` to prevent brute force. Token expiration enforced. | Robust auth controls | ✅ **PASS** |
| **A08: Software & Data Integrity**| PayHere payment hashes generated server-side using merchant secret. Tampered callbacks rejected. | Data integrity intact | ✅ **PASS** |
| **A09: Logging & Monitoring** | Immutable audit trail recorded for critical business and administrative actions (ADR-012). | Comprehensive logs | ✅ **PASS** |
| **A10: SSRF** | Outbound requests limited to trusted providers (PayHere, Cloudinary, Gemini LLM). | Safe outbound boundaries | ✅ **PASS** |

---

## 6. Gate 5: Performance & Reliability Gate (AC10 / DDP-086)

Performance benchmarks and non-functional requirements (NFRs) defined in the approved SRS/SDS and evaluated in DDP-086:

| Benchmark Metric | Threshold / Target | Evaluation Standard | Assessment Status |
| :--- | :--- | :--- | :--- |
| **API Response Time (p95)** | < 500 ms for core REST API endpoints | NFR target established; benchmark suite evaluated in DDP-086 | Meets NFR Criteria |
| **Concurrent Checkout** | 0 overselling under concurrent load | MongoDB transaction lock preserves stock integrity | Preserves consistency |
| **Appointment Slot Locking** | Prevent double-booking same slot | Simultaneous booking returns HTTP 409 Conflict for 2nd request | Conflict handled |
| **Database Connection Pool** | Zero connection exhaustion | MongoDB Atlas connection pool dynamically handles load | Stable |
| **Chatbot TTL Expiry** | 1-hour session auto-purge | TTL background thread auto-removes expired usage docs | Verified (DDP-077) |

---

## 7. Gate 6: Final Documentation Package Gate (AC14)

Verification that all required academic and technical deliverables are approved:

| Deliverable | Repository & Artifact Reference | Status |
| :--- | :--- | :--- |
| **Final SRS** | `darshana-opticals-osms/documents#47` / Approved System Requirements Specification | ✅ **APPROVED** |
| **Final SDS** | `darshana-opticals-osms/documents#47` / Approved System Design Specification | ✅ **APPROVED** |
| **Test Case Register** | `darshana-opticals-osms/documents#46` / Comprehensive Test Case Register | ✅ **APPROVED** |
| **Test Coverage Report** | `darshana-opticals-osms/documents#46` / Unit & Integration Coverage Reports | ✅ **APPROVED** |
| **OWASP Security Checklist** | `darshana-opticals-osms/documents#46` / `backend#91` Security Compliance Checklist | ✅ **APPROVED** |
| **Performance Test Report** | `darshana-opticals-osms/documents#46` / `backend#92` Performance & Stress Test Report | ✅ **APPROVED** |
| **Final Development Report** | `darshana-opticals-osms/documents#48` / SENG 34213 Final Development Report | ✅ **APPROVED** |
| **Architecture Records** | `infra/docs/` / ADR-001 through ADR-015 Architectural Decision Records | ✅ **APPROVED** |

---

## 8. Release Evidence Audit Record (AC23)

- **Release Version:** `v1.0.0`
- **Release Verification Date:** October 2026
- **Staging Frontend Endpoint:** `https://osms-frontend-staging.vercel.app`
- **Staging Backend Endpoint:** `https://osms-backend-staging.onrender.com`
- **Overall Quality Gates Result:** 🟡 **5 OF 6 GATES SATISFIED — GATE 4 (SECURITY) PENDING POST-MERGE DEPLOYMENT EVIDENCE**
- **Audit Decision:** Security PRs `frontend#68` and `backend#108` merged into `develop`. Release promotion to `main` is held pending recording of post-merge live staging deployment verification evidence.

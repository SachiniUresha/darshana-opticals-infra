# OSMS Final Software Release Manifest (Issue #12 / SENG 34213)

**Document Reference:** `docs/release/release-manifest.md`  
**Target Release Version:** `v1.0.0`  
**Release Date:** October 2026  
**Tracking Issue:** [darshana-opticals-osms/infra#12](https://github.com/darshana-opticals-osms/infra/issues/12)  
**Governance Framework:** SENG 34213 System Development Project Release Guidelines  
**Release Lead:** Senior Full Stack Developer & Release Management Team  

---

## 1. Executive Summary & Purpose

The **Release Manifest** serves as the authoritative, tamper-evident record of all software components, Git revisions, target release tags, and deployed cloud runtimes that comprise the **v1.0.0 Final Release** of the Darshana Opticals Optical Shop Management System (OSMS).

In accordance with Acceptance Criteria **AC1, AC2, AC3, AC4, AC16, AC18, and AC19**, this manifest guarantees end-to-end traceability from reviewed source commits on `develop`, through peer-reviewed Pull Requests to `main`, to live staging deployments on **Render.com** (Backend) and **Vercel** (Frontend) backed by **MongoDB Atlas**.

---

## 2. Multi-Repository Release Component Inventory (AC1, AC16, AC18)

| Component | Repository | Role & Stack | Source Branch | Target Branch | Target SemVer Tag | Release Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend API** | `darshana-opticals-osms/backend` | Node.js 20, Express, Mongoose, JWT Auth, RBAC, PayHere SDK | `develop` | `main` | `v1.0.0` | **Release Ready** |
| **Frontend UI** | `darshana-opticals-osms/frontend` | React 18, Vite, React Router, TailwindCSS, Axios | `develop` | `main` | `v1.0.0` | **Release Ready** |
| **Infrastructure**| `darshana-opticals-osms/infra` | Docker, Compose, GitHub Actions, Staging Baselines, Release Docs | `develop` | `main` | `v1.0.0` | **Release Ready** |
| **Documentation** | `darshana-opticals-osms/documents` | SRS, SDS, ADR-001..015, Test Registers, QA & Final Reports | `develop` | `main` | `v1.0.0` | **Release Ready** |

---

## 3. Branching Strategy & Branch Protection Compliance (AC2)

All release repositories adhere strictly to Chapter 3 of the SENG 34213 Development Guidelines:

```text
feature/*, chore/*, fix/* (Short-lived branches)
            │
            ▼ (Reviewed PR + CI Pass)
         develop (Integration Branch - Staging Deployments)
            │
            ▼ (Release Candidate Freeze & Approval - PR)
          main (Production-Ready Release Branch - Tagged: v1.0.0)
```

### Branch Verification & Protection Rules:
1. **`develop` Branch:** Acts as the primary integration branch for Sprint 1, Sprint 2, and Sprint 3 features.
2. **`main` Branch:** Reserved exclusively for verified, production-ready release commits.
3. **Branch Protection Enforcement:**
   - Direct `git push` to `main` and `develop` is strictly disabled.
   - Merging requires at least one approving peer code review.
   - All status checks (linting, tests, build pipelines) must pass before merging.
   - Zero unresolved merge conflicts or unreviewed commits permitted.
4. **Local Modifications Policy:** Uncommitted local files or detached builds are strictly prohibited from release candidacy.

---

## 4. Feature Integration & Freeze Status (AC3, AC4)

### 4.1 Release Freeze Declaration
A formal code freeze is instituted on `develop` for version `v1.0.0`. No new functional features may be introduced. Only release-blocking defect fixes and approved release documentation are permitted.

### 4.2 Integrated Business Modules Matrix:
- ✅ **Authentication & Authorization (ADR-002):** Multi-role RBAC (Customer, Staff, Optometrist, Admin) with secure JWT and refresh token handling.
- ✅ **Product & Inventory Management (ADR-006):** Complete frame/lens catalog, categories, stock tracking, and automated reorder-alert threshold rules.
- ✅ **Shopping Cart & Checkout (ADR-003):** Persistent user cart, price calculations, and checkout transaction boundaries.
- ✅ **Payment Gateway Integration (ADR-011):** Secure PayHere Sandbox hash generation, payment redirect, and asynchronous server-to-server IPN verification.
- ✅ **Order Lifecycle & Tracking (ADR-004, ADR-013):** State machine covering Pending, Paid, Processing, Shipped, Delivered, Cancelled with status notifications.
- ✅ **Optometrist Appointments (ADR-007):** Slot scheduling, conflict detection, optometrist availability, and appointment lifecycle.
- ✅ **Clinical Prescription Records:** Optometrist prescription entry, visual acuity history, and confidential patient clinical record storage.
- ✅ **AI Chatbot & TTL Gate (ADR-010, DDP-077):** Customer inquiry chatbot with MongoDB TTL index (`chatbotusages.expiresAt`) guaranteeing 1-hour session expiry.
- ✅ **Sales & Inventory Analytics (ADR-014):** Aggregated revenue metrics, top-selling frames, inventory turnover, and audit logging (ADR-012).

---

## 5. Source-to-Deployment Traceability & Provenance (AC7, AC11, AC19)

To ensure tamper-proof provenance, every running service on staging is explicitly mapped to its verified Git source revision:

```text
GitHub Source (develop)
       │
       ├── Backend (Repo: backend)  ──► Render.com Web Service  ──► https://osms-backend-staging.onrender.com
       │                                     │
       │                                     ├── REST API: /api/*
       │                                     └── Health: /api/health
       │
       ├── Frontend (Repo: frontend) ──► Vercel Hosting          ──► https://osms-frontend-staging.vercel.app
       │                                     │
       │                                     └── Calls Backend API via HTTPS
       │
       └── Database                  ──► MongoDB Atlas Cluster  ──► Replica Set: osms-staging
```

### 5.1 Deployed Artifacts & Environments:

| Component | Target Hosting Platform | Deployed Live URL / Identifier | Environment Scope | Source Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Backend REST API** | **Render.com** (ADR-015) | `https://osms-backend-staging.onrender.com` | Staging (`NODE_ENV=production`) | Verified Node 20 runtime; `/api/health` 200 OK |
| **Frontend Web App** | **Vercel** | `https://osms-frontend-staging.vercel.app` | Staging (`Vite Production Build`) | Deployed from `develop`; SPA rewrites active |
| **Primary Database** | **MongoDB Atlas** | `osms-staging` (Cluster Replica Set) | Staging Isolated Cluster | Mongoose SRV; Replica set transactions active |
| **Payment Sandbox** | **PayHere Sandbox** | `sandbox.payhere.lk` | Non-production Sandbox Mode | Merchant ID configured in Render secrets |
| **Cloud Storage** | **Cloudinary** | `darshana-opticals-staging` | Non-production Media Cloud | Secure API keys in Render secrets |

---

## 6. Semantic Versioning Specification (AC16, AC18)

In conformance with **SemVer 2.0.0** (`vMAJOR.MINOR.PATCH`):
- **Current Version:** `v1.0.0`
- **Rationale:** 
  - `MAJOR = 1`: First stable, production-ready release encompassing the full SENG 34213 OSMS core specification.
  - `MINOR = 0`: Baseline release with complete Sprint 1, 2, and 3 feature implementations.
  - `PATCH = 0`: Initial baseline with zero post-release hotfixes.
- **Git Tagging Format:** `v1.0.0` (applied as an annotated tag containing release notes and signed by release lead).
- **Tag Commits:** The tag must be attached to the merge commit on `main` following peer approval of the release PR.

---

## 7. Security & Secret Safeguards (AC7, AC23)

In accordance with project security policies:
1. **Zero Secret Exposure:** No API keys, passwords, database URIs, JWT signing secrets, or PayHere merchant secrets are stored in this manifest or in any Git repository.
2. **Platform Secret Injection:** All sensitive credentials are injected securely through Render.com environment secrets and Vercel project variables.
3. **CORS Boundary:** The Render backend explicitly restricts CORS origins to `https://osms-frontend-staging.vercel.app` and localhost dev ports; wildcard origins (`*`) are strictly blocked.
4. **Data Isolation:** The staging database uses synthetic test data; no real patient records or actual credit card information exist in the staging environment.

---

## 8. Release Sign-Off Gate Status

| Criteria | Required Standard | Current Audit Result | Gate Status |
| :--- | :--- | :--- | :--- |
| **Scope & Inventory** | 4 Repositories identified with branch mappings | Fully documented in Section 2 | ✅ **PASS** |
| **Branch Policy** | PR-based workflow; `develop` -> `main` | Verified against repository branch model | ✅ **PASS** |
| **Feature Freeze** | All Sprint 1-3 modules integrated | Confirmed merged into `develop` | ✅ **PASS** |
| **Provenance** | Traceable Git commits to Render & Vercel | Verified live staging URLs | ✅ **PASS** |
| **Version Alignment** | Unified SemVer `v1.0.0` across components | Agreed by release team | ✅ **PASS** |

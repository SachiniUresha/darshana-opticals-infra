# Infrastructure & Environments — Darshana Opticals OSMS

[![Staging Baseline CI](https://github.com/darshana-opticals-osms/infra/actions/workflows/staging-baseline.yml/badge.svg)](https://github.com/darshana-opticals-osms/infra/actions/workflows/staging-baseline.yml)
[![Chatbot TTL Gate](https://github.com/darshana-opticals-osms/infra/actions/workflows/chatbot-ttl.yml/badge.svg)](https://github.com/darshana-opticals-osms/infra/actions/workflows/chatbot-ttl.yml)
[![Specification & Contract Test Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)](tests/)
[![SemVer Target](https://img.shields.io/badge/Release%20Target-v1.0.0-blue)](docs/release/release-manifest.md)
[![Academic Project](https://img.shields.io/badge/Course-SENG%2034213-orange)](https://github.com/darshana-opticals-osms)

Infrastructure as Code (IaC), containerization, CI/CD pipelines, staging environments, release governance, and deployment verification for the **Darshana Opticals Optical Shop Management System (OSMS)** — SENG 34213 System Development Project (Software Engineering Teaching Unit, University of Kelaniya).

---

## 🌐 Live System & University Demonstration Access

In accordance with SENG 34213 Demonstration Guidelines (Chapter 9) and Final User Acceptance Testing (DDP-091), the live cloud deployment endpoints and university evaluator demonstration credentials are provided below:

### 🔗 Active Deployment Endpoints

| Service / Interface | Cloud Hosting Platform | Live URL / Endpoint | Verification Scope & Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | [https://darshana-opticals.vercel.app](https://darshana-opticals.vercel.app) | **ACTIVE LIVE FRONTEND:** Verified during final UAT (DDP-091). Hosts Customer, Staff, Admin, Optometrist, and clinical workflows. |
| **Backend REST API** | **Render.com** | [https://osms-backend-staging.onrender.com](https://osms-backend-staging.onrender.com) | **ACTIVE LIVE API:** Node.js 20 / Express service handling business logic, authentication, and database access. |
| **Backend Health Check** | **Render.com** | [https://osms-backend-staging.onrender.com/api/health](https://osms-backend-staging.onrender.com/api/health) | **ACTIVE HEALTH PROBE:** Returns HTTP `200 OK` with JSON uptime. Live verified. |
| **Database Cluster** | **MongoDB Atlas** | Managed Cloud Cluster | Reached exclusively via Render backend; direct browser access strictly blocked. |

> **Authoritative URL Clarification:** Earlier sprint planning artifacts and initial draft templates referenced `https://osms-frontend-staging.vercel.app`. The authoritative, active deployment URL verified during final UAT is **`https://darshana-opticals.vercel.app`**. The previous hostname is preserved in historical runbooks solely for provenance context.

---

### 🔑 University Evaluator Demonstration Accounts

The following fictional test accounts are provisioned exclusively for university evaluation. Evaluators may log in via the active live frontend ([https://darshana-opticals.vercel.app/login](https://darshana-opticals.vercel.app/login)):

| Role | Demonstration Email | Demonstration Password | Evaluator Scope & Accessible Modules |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin.dev@gmail.com` | `DevPassword123!` | System user management, staff & doctor account creation/deactivation, audit logs, and global settings. |
| **Branch Manager** | `brachmanager@gmail.com` | `DevPassword123!` | Inventory management, product catalog maintenance, stock reorder thresholds, and sales/inventory BI analytics. |
| **Branch Assistant** | `branchassistant@gmail.com` | `DevPassword123!` | Doctor session creation, customer appointment booking/rescheduling, and staff order tracking. |
| **Optometrist** | `optometrist@gmail.com` | `DevPassword123!` | Patient queue, clinical eye examination records, visual acuity, and confidential prescription entry. |
| **Customer** | `kavindueka@gmail.com` | `Amalka@123` | Frame/sunglass browsing, cart, appointment booking, authorized prescription history, loyalty status, and AI chatbot. |

> **🛡️ Test Data & Security Assurance:** All demonstration accounts are strictly synthetic test fixtures pre-seeded in the database. No real customer, patient, clinical, or payment card information exists in the system. These credentials are explicitly approved for public academic evaluation and have zero access to production infrastructure or external banking services.

---

### 💳 Payment Integration Findings & Academic Demonstration Arrangement

In conformance with academic reporting standards and the **Final UAT Report** ([docs/demo/uat-report.md](docs/demo/uat-report.md)):

* **21 Consolidated Non-Payment Scenarios:** **PASS (Hosted Environment).** Full customer, staff, clinical, inventory, appointment, and administrative workflows passed verification on the live Vercel + Render deployment.
* **PayHere Sandbox Payment Scenario:** **Pending Final Verification (Hosted Environment).** The frontend is hosted on Vercel's free tier under the Vercel-provided subdomain `darshana-opticals.vercel.app`. During PayHere Sandbox website-domain integration setup, the merchant portal rejected registration of this subdomain due to domain-validation restrictions. Therefore, website-domain authorization for the hosted subdomain cannot be finalized without a custom domain.
* **Localhost PayHere Sandbox Payment:** **PASS (Localhost Environment).** The end-to-end PayHere Sandbox checkout, payment gateway redirect, and payment callback were successfully tested and verified on localhost with genuine Sandbox transaction records.
* **Agreed University Demonstration Approach:**
  1. Demonstrate all 21 core business workflows (Customer, Staff, Optometrist, Admin) live on the **hosted Vercel + Render deployment**.
  2. Demonstrate the genuine **PayHere Sandbox payment transaction on localhost** using the tested local configuration.
  3. Clearly explain the domain-registration distinction to evaluators. Hosted payment verification is **not** claimed as passing.
* **Planned Client Deployment Completion:** After obtaining formal client approval, the team plans to acquire a custom domain, bind it in Vercel, register the domain in the PayHere merchant portal, and verify the hosted payment flow.

---

## 🏗️ Deployment Architecture: Current vs. Historical Plans

### Current Deployment Topology (Approved DDP-083 / ADR-015 Model)

```text
┌────────────────────────────────────────────────────────┐
│                   GitHub Repository                     │
│               darshana-opticals-osms                   │
│                     (develop)                          │
└──────────────┬─────────────────────────┬───────────────┘
               │                         │
               ▼                         ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  Vercel Hosting Platform     │ │  Render.com Cloud Service    │
│  Environment: "Production"   │ │  Service: Web Service        │
│  Branch Tracked: develop     │ │  Runtime: Node.js 20         │
│  URL: darshana-opticals.     │ │  URL: osms-backend-staging.  │
│       vercel.app             │ │       onrender.com           │
└──────────────┬───────────────┘ └──────────────┬───────────────┘
               │                                │
               │   HTTPS (VITE_API_BASE_URL)    │
               └───────────────────────────────►│
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
                 ▼                                                             ▼
  ┌──────────────────────────────┐                              ┌──────────────────────────────┐
  │   MongoDB Atlas Cluster      │                              │  External Sandbox Services   │
  │   - Replica Set Enabled      │                              │  - PayHere Sandbox           │
  │   - Chatbot TTL Purge Gate   │                              │  - Cloudinary Media          │
  └──────────────────────────────┘                              └──────────────────────────────┘
```

#### Key Architecture Distinctions:
1. **Vercel "Production" Environment vs. Git `main` Branch:**
   * In Vercel, "Production" is a hosting environment tier setting that provides canonical URL routing and production CDN edge caching.
   * **Vercel Production tracks the Git `develop` branch**, not `main`. Developing under DDP-083 strictly preserves this model; `main` is reserved for tagged SemVer releases following peer review.
2. **Render Hostname Nomenclature:**
   * The backend hostname is `https://osms-backend-staging.onrender.com`. The term `staging` in the URL denotes its role as the pre-production integration service for university evaluation; it does not indicate a separate duplicate staging backend or isolated AWS stack.
3. **Single Integrated Database:**
   * Application data resides on a managed MongoDB Atlas cluster accessed exclusively via the Render backend using Mongoose. Direct client connections are prohibited.

### Historical Staging / AWS Specifications (Issues #4 & #9)

Earlier sprint planning specified containerized deployments on **AWS App Runner** (`osms-backend-staging`) using container images stored in **Amazon ECR** (`osms-backend:staging-*`). These documents are retained strictly as historical engineering records:
* 📜 [Original Staging Baseline (Issue #4)](docs/staging-environment.md)
* 📜 [Original Staging Provisioning Runbook](docs/staging-setup-runbook.md)
* 📜 [Original AWS Backend Deployment Runbook (Issue #9)](docs/backend-staging-deployment.md)
* 📜 [Historical Staging Environment Variable Example](environments/staging.env.example)

---

## 🚀 Local Development Setup (Docker Compose)

This repository provides containerized local development configurations for both the **Backend** and **Frontend** services using Docker Compose, satisfying SENG 34213 Section 9.3 (fresh-machine reproducibility).

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+ recommended, running with Docker Compose v2).
* Git installed locally.
* Sibling directory layout:
  ```text
  Darshana-Opticals-OSMS/
  ├── backend/     # Server-side API
  ├── frontend/    # Client-side React/Vite UI
  └── infra/       # Infrastructure as Code & Compose (this repository)
  ```

---

### Step-by-Step Instructions

1. **Clone the Repository & Navigate to Infra:**
   ```bash
   git clone https://github.com/darshana-opticals-osms/infra.git
   cd infra
   ```

2. **Configure Environment Variables:**
   Copy the safe `.env.example` template to `.env`:
   ```bash
   cp .env.example .env
   ```
   *The committed `.env.example` contains safe non-production defaults and placeholders. No sensitive keys or production credentials are required for local execution.*

3. **Build & Start Services:**
   ```bash
   docker compose up --build
   ```
   To run in detached mode (background):
   ```bash
   docker compose up --build -d
   ```

4. **Access Running Services:**
   * **Frontend Application:** [http://localhost:5173](http://localhost:5173)
   * **Backend REST API:** [http://localhost:5000](http://localhost:5000)
   * **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
   * **MongoDB Local Port:** `localhost:27017`

5. **Stop Services:**
   ```bash
   docker compose down
   ```
   To remove persistent database volumes as well:
   ```bash
   docker compose down -v
   ```

---

### 🍃 MongoDB Replica Set & Multi-Document Transactions

A critical infrastructure requirement of the OSMS platform is **MongoDB Replica Set support**:
* **Technical Requirement:** The OSMS shopping cart checkout, order placement, and inventory decrement workflows execute within **multi-document ACID transactions** (`session.withTransaction()`).
* **Standalone MongoDB Incompatibility:** Standard standalone MongoDB instances do not support transactions and will throw runtime errors during order placement.
* **Compose Implementation:** `docker-compose.yml` launches MongoDB with `mongod --replSet osms-rs --bind_ip_all` and includes an automated healthcheck evaluation:
  ```javascript
  try { rs.status().ok } catch (error) { rs.initiate({_id:'osms-rs', members:[{_id:0, host:'mongodb:27017'}]}); }
  ```
* **Connection String Contract:** The backend connects using `mongodb://mongodb:27017/osms-dev?replicaSet=osms-rs`.

---

## 🔒 Chatbot Usage TTL Deployment Gate

Before backend startup, Docker Compose (locally) and CI deployment gates run the one-shot `chatbot-usage-index` container (`scripts/chatbot-usage-index.js`).

* **Purpose:** Ensures that customer chatbot conversation sessions automatically purge after 1 hour without manual batch cron jobs.
* **Index Specification:** Provisions/verifies a single-field TTL index `{ expiresAt: 1 }` with `expireAfterSeconds: 0` on the `chatbotusages` collection.
* **Pre-Flight Enforcement:** Backend container boot depends on `chatbot-usage-index` completing successfully (`condition: service_completed_successfully`). Existing incompatible indexes cause the gate to fail closed without destroying unrelated data.
* **Runbook:** Refer to [docs/chatbot-usage-ttl.md](docs/chatbot-usage-ttl.md) for index maintenance, least-privilege provisioning, and synthetic smoke test verification.

---

## ⚙️ CI/CD Workflows & Quality Gates

In accordance with SENG 34213 Chapters 7 and 8, automated GitHub Actions pipelines enforce rigorous quality and security gates:

### GitHub Actions Workflows in `infra`

| Workflow File | Trigger Conditions | Automated Checks & Stages |
| :--- | :--- | :--- |
| [`.github/workflows/staging-baseline.yml`](.github/workflows/staging-baseline.yml) | Push & PR to `develop` | Validates staging configuration contracts, runs release-verification unit tests, checks for hardcoded credentials, and validates SemVer tags (51 passing tests). |
| [`.github/workflows/chatbot-ttl.yml`](.github/workflows/chatbot-ttl.yml) | Push & PR to `develop` | Boots an isolated MongoDB container, applies the TTL index twice (idempotency), verifies TTL cleanup with a synthetic record, and tests negative target mismatch gates. |
| [`.github/workflows/backend-staging-deploy.yml`](.github/workflows/backend-staging-deploy.yml) | Manual dispatch / dispatch events | Historical automated pipeline for building and deploying containerized backend revisions to AWS App Runner. |

### Enforced Quality Gates
* **Linting & Code Formatting:** Zero lint errors permitted across all components.
* **Test Coverage:** Automated unit test coverage $\ge 80\%$ on all new logic.
* **Security & Vulnerability Scans:** Zero high or critical vulnerabilities via `npm audit` and dependency scanning.
* **Branch Protection:** Direct push to `develop` or `main` is blocked; minimum of 1 approved peer code review required per PR.
* **Credential Safeguards:** Pre-commit and CI scans reject committed secrets, connection strings, private keys, or passwords.

---

## 🔄 Deployment Verification, Smoke Testing & Rollback

### Live Smoke-Test Protocol (SMK-01 – SMK-10)

Before release candidate sign-off, the following smoke verification targets are validated against live cloud runtimes:
* **SMK-01 (Frontend Root):** Verify `https://darshana-opticals.vercel.app/` loads over HTTPS with 0 console errors and renders Vite SPA index.
* **SMK-02 (Backend Health Probe):** `GET https://osms-backend-staging.onrender.com/api/health` returns HTTP `200 OK` with JSON uptime.
* **SMK-03 (Authentication & RBAC):** Verify customer login retrieves valid JWT and populates authenticated state.
* **SMK-04 (SPA Route Fallback):** Navigate directly to `/login`, `/products`, `/dashboard`; verify `vercel.json` SPA rewrites prevent 404 errors.
* **SMK-05 (CORS Whitelist):** Verify Render backend permits requests originating from `https://darshana-opticals.vercel.app` and blocks unapproved origins.
* **SMK-06 (Database Connectivity):** Verify product catalog retrieval and database write operations execute without latency spikes.
* **SMK-07 (Chatbot TTL Gate):** Verify single-field `{ expiresAt: 1 }` index is active on `chatbotusages`.
* **SMK-08 (Clinical & Admin Operations):** Verify optometrist prescription records and admin staff management endpoints respond correctly.
* **SMK-09 (Inventory Reorder Alerts):** Verify stock updates trigger replenishment notifications when thresholds are reached.
* **SMK-10 (PayHere Sandbox Gateway):** Verify redirect to `sandbox.payhere.lk` with valid merchant hash.

### Rollback Runbook (Non-Destructive SRE Procedures)

In the event of an operational regression, follow the approved procedures documented in [docs/release/rollback.md](docs/release/rollback.md):
1. **Frontend Rollback (Vercel):** Navigate to Vercel Project > **Deployments**, locate the last known-good deployment on `develop`, and execute **Instant Rollback**. Vercel redirects traffic within seconds without rebuilding.
2. **Backend Rollback (Render.com):** In the Render Dashboard, open **Deploy History**, select the previous verified commit SHA, and trigger **Rollback to this deploy**. Revert faulty environment variables if needed.
3. **Database Safeguards (MongoDB Atlas):**
   * **Strict Policy:** `db.dropDatabase()` or dropping production/staging collections is strictly prohibited.
   * Automated daily snapshots and point-in-time recovery (PITR) protect against data corruption.
   * Mongoose schemas are additive and backward-compatible.

---

## 📋 Release Governance & Artifact Links (v1.0.0 / Issue #12)

The controlled final software release coordinates release artifacts, audit evidence, and verification records:

* 📦 [Final Release Manifest](docs/release/release-manifest.md) — Multi-repository component inventory, SemVer `v1.0.0`, branch mapping, and commit traceability.
* 📋 [Release Checklist & Sign-Off](docs/release/release-checklist.md) — Detailed tracking of Acceptance Criteria AC1 through AC24.
* 🛡️ [Quality Gates & Evidence Matrix](docs/release/quality-gates.md) — Verification records for CI, E2E (DDP-084), OWASP (DDP-085), Performance (DDP-086), and Documentation.
* 🔄 [Deployment Verification & Rollback Runbook](docs/release/rollback.md) — Non-destructive rollback procedures for Vercel, Render, and MongoDB Atlas.
* 📝 [Release Notes & Changelog](docs/release/release-notes.md) — Module changelog, smoke-test register, and release status declaration.
* 🧪 [Final UAT Report (DDP-091)](docs/demo/uat-report.md) — 21 hosted scenarios PASS; 1 hosted payment pending; localhost payment PASS.
* 🎯 [Live Demonstration Plan](docs/demo/demo-plan.md) — Evaluator presentation agenda, time breakdown, and rehearsal outcomes.
* 🔍 [Defect & Regression Summary (DDP-092)](docs/quality/defect-regression-summary.md) — Verified Sprint 3 defect triage and regression closure records.

> **Release Readiness Declaration:** Release `v1.0.0` is currently classified as **Pending / In Verification**. OWASP Security PRs (`frontend#68` and `backend#108`) have been merged into `develop`; final post-merge live staging deployment verification and formal client sign-off remain pending.

---

## ⚠️ Known Deployment Limitations & Operating Boundaries

1. **PayHere Hosted Domain Restriction:** The free Vercel subdomain (`darshana-opticals.vercel.app`) cannot be registered as an authorized website domain in the PayHere merchant portal. Hosted checkout remains pending until a custom domain is configured following client sign-off.
2. **Render Cold Starts:** Render free/hobby tier services spin down after periods of inactivity. An initial request may experience a 30–50 second spin-up latency. Pre-warming via `/api/health` is performed prior to evaluator demonstrations.
3. **Sandbox Outbound Messaging:** Email and SMS notifications operate in sandbox/mock mode to avoid unsolicited communications during testing.
4. **Synthetic Test Data:** The database is populated strictly with synthetic records. Real customer or credit card numbers are never stored or processed.

---

## 🔗 Related Project Repositories

| Repository | GitHub URL | Role & Primary Stack |
| :--- | :--- | :--- |
| **Backend API** | [darshana-opticals-osms/backend](https://github.com/darshana-opticals-osms/backend) | Server-side REST API, Node.js 20, Express, Mongoose, JWT Auth, RBAC |
| **Frontend UI** | [darshana-opticals-osms/frontend](https://github.com/darshana-opticals-osms/frontend) | Client-side web application, React 18, Vite, React Router, TailwindCSS |
| **Infrastructure** | [darshana-opticals-osms/infra](https://github.com/darshana-opticals-osms/infra) | Docker, Docker Compose, CI/CD pipelines, staging baselines, release governance |
| **Documents** | [darshana-opticals-osms/documents](https://github.com/darshana-opticals-osms/documents) | SRS, SDS, ADRs (001–015), meeting minutes, and final development reports |

* **GitHub Organization:** [https://github.com/darshana-opticals-osms](https://github.com/darshana-opticals-osms)  
* **GitHub Project Board:** [https://github.com/orgs/darshana-opticals-osms/projects](https://github.com/orgs/darshana-opticals-osms/projects)

---

## 📁 Repository Directory Structure

```text
infra/
├── .github/
│   └── workflows/
│       ├── backend-staging-deploy.yml   # Historical AWS App Runner deployment pipeline
│       ├── chatbot-ttl.yml              # Automated MongoDB TTL index verification
│       └── staging-baseline.yml         # Staging contract, test suites & release verification
├── docker/
│   ├── backend/
│   │   └── Dockerfile                   # Multi-stage container build for Node.js API
│   └── frontend/
│       └── Dockerfile                   # Multi-stage container build for React/Vite UI
├── docs/
│   ├── demo/
│   │   ├── demo-plan.md                 # University demonstration script & roles
│   │   └── uat-report.md                # Final User Acceptance Testing results (DDP-091)
│   ├── quality/
│   │   └── defect-regression-summary.md # Defect tracking & regression sign-off (DDP-092)
│   ├── release/
│   │   ├── quality-gates.md             # 6 Quality gates & evidence matrices
│   │   ├── release-checklist.md         # Acceptance Criteria AC1–AC24 verification
│   │   ├── release-manifest.md          # Multi-repository inventory & commit provenance
│   │   ├── release-notes.md             # Release notes, changelog & smoke register
│   │   ├── release-pr-template.md       # Pull request template for v1.0.0 release
│   │   └── rollback.md                  # Non-destructive rollback procedures
│   ├── backend-staging-deployment.md    # Historical AWS App Runner staging runbook
│   ├── chatbot-usage-ttl.md             # Chatbot TTL index provisioning & verification
│   ├── frontend-vercel-deployment.md    # Vercel Production + Render deployment runbook
│   ├── staging-environment.md           # Historical staging environment baseline (Issue #4)
│   └── staging-setup-runbook.md         # Historical staging provisioning guide
├── environments/
│   └── staging.env.example              # Historical staging environment configuration contract
├── scripts/
│   ├── chatbot-usage-index.js           # Idempotent MongoDB TTL index provisioning script
│   ├── deploy-apprunner.cjs             # Historical App Runner deployment helper
│   ├── e2e-preflight.cjs                # End-to-end testing preflight check
│   └── verify-staging-health.cjs        # Health probe script
├── tests/
│   ├── helpers/                         # Test fixtures & isolation mocks
│   ├── backend-staging-deploy.test.cjs  # Tests for App Runner deployment scripts
│   ├── chatbot-usage-index.test.cjs     # Tests for chatbot TTL index provisioning logic
│   ├── release-verification.test.cjs    # Release documentation contract & static checks
│   └── staging-baseline.test.cjs        # Configuration parsing & security contract tests
├── docker-compose.yml                   # Containerized local dev stack with Mongo replica set
├── package.json                         # Node.js test runner & Playwright configuration
├── .env.example                         # Safe local development environment variable template
├── .gitignore                           # Ignored patterns (.env, node_modules, etc.)
└── README.md                            # Repository documentation & university guidelines compliance
```

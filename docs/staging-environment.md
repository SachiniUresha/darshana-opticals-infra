# OSMS Staging Environment Baseline Specification

## 1. Overview & Purpose

This document defines the authoritative architecture, boundary contracts, security constraints, and operational baseline for the Optical Shop Management System (**OSMS**) **Staging Environment** within the `infra` repository.

The staging environment provides a secure, reproducible, and production-like target where completed Sprint 2 functionality can be deployed, integrated, and validated safely through end-to-end, security, UAT, and academic project evaluation without exposing or relying on real production data or compromising production stability.

---

## 2. Environment Isolation Matrix

OSMS maintains strict logical and physical boundaries across three operational tiers:

| Attribute | Development (Local / CI) | Staging (Pre-Production / UAT) | Production (Live) |
| :--- | :--- | :--- | :--- |
| **Primary Audience** | Feature developers, unit/integration CI | QA engineers, UAT testers, academic evaluators | Real customers, optical staff, store management |
| **Frontend Platform** | Local Vite Dev Server (`localhost:5173`) | Vercel (Dedicated Staging Context / Preview) | Vercel (Production Domain) |
| **Backend Platform** | Local Docker Compose (`localhost:5000`) | AWS App Runner (Staging Container Service) | AWS App Runner (Production Service) |
| **Container Registry** | Local Docker Daemon / GHCR cache | Amazon ECR (`osms-backend:staging-*`) | Amazon ECR (`osms-backend:prod-*` / semver) |
| **Database** | Local MongoDB container (`osms-dev` replica set) | Dedicated MongoDB Atlas Cluster/DB (`osms-staging`) | Dedicated MongoDB Atlas Cluster/DB (`osms-prod`) |
| **Data Nature** | Ephemeral dev seed data | Synthetic / anonymized non-production UAT seed data | Real patient, prescription, and financial data |
| **Payment Mode** | Mock / Local bypass | Gateway Sandbox / Test Mode (Zero real currency) | Gateway Live Mode |
| **Notifications** | Console log / Local dummy sink | Whitelisted test recipients / Mock sink | Live Customer SMS / Email |
| **Chatbot Provider** | Test / Mock API credentials | Staging API key (rate-limited / sandbox quota) | Live Production API key |
| **Security Controls** | Dev JWT, relaxed local CORS | Production-grade JWT, strict HTTPS, staging CORS | Production JWT, strict HTTPS, production CORS |
| **Error Handling** | Verbose dev traces permitted locally | Production-like sanitized responses (no traces) | Strict sanitized responses (no traces) |

> **Constraint:** Staging configuration must never silently fall back to, connect to, or share credentials with the production environment (AC1, AC8, AC10, AC11).

---

## 3. Architecture & Deployment Targets

```
  ┌─────────────────────────────────────────────────────────┐
  │                      UAT / QA User                      │
  └────────────────────────────┬────────────────────────────┘
                               │ HTTPS (TLS 1.2+)
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │              Vercel Staging Frontend                    │
  │     (e.g., https://staging.osms.darshanaopticals.lk     │
  │      or https://osms-frontend-staging.vercel.app)       │
  └────────────────────────────┬────────────────────────────┘
                               │ HTTPS / REST API
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │              AWS App Runner Staging Backend             │
  │          (Container image deployed from ECR)            │
  └──────────────┬──────────────────────────┬───────────────┘
                 │                          │
                 ▼                          ▼
  ┌─────────────────────────┐   ┌───────────────────────────┐
  │  MongoDB Atlas Staging  │   │ Third-Party Sandbox APIs  │
  │     (`osms-staging`)    │   │ • Payment Gateway Sandbox │
  │  Multi-doc transactions │   │ • Test SMS/Email Sink     │
  │  TTL Index Provisioning │   │ • Staging Chatbot Keys    │
  └─────────────────────────┘   └───────────────────────────┘
```

### 3.1 Frontend Staging Target (Vercel)
* **Hosting Platform:** Vercel.
* **Target Context:** Dedicated Staging branch/preview deployment linked to the `develop` release branch.
* **Domain / URL:** Dedicated staging URL (e.g., `https://osms-frontend-staging.vercel.app` or subdomain `https://staging.osms.darshanaopticals.lk`). The live production domain must never be targeted by staging tests (AC3).
* **Protocol:** Strictly HTTPS (AC16).
* **Build Injections:** Injects `VITE_API_BASE_URL` pointing to the AWS App Runner staging backend endpoint at build time. Hardcoded `localhost` references are strictly disallowed (AC7).

### 3.2 Backend Staging Target (AWS App Runner)
* **Hosting Platform:** AWS App Runner.
* **Runtime:** Fully managed container runtime executing the Dockerized Node.js/Express backend built from `infra/docker/backend/Dockerfile` (AC4, AC6).
* **Service Naming:** `osms-backend-staging` (AC15).
* **Scaling / Capacity:** Configured with baseline resources appropriate for UAT (e.g., 1 vCPU, 2 GB RAM, min 1 instance, max 2 instances).
* **Protocol:** HTTPS terminated at App Runner managed load balancer (AC16).

### 3.3 Container Registry Boundary (Amazon ECR)
* **Registry Service:** Amazon Elastic Container Registry (ECR) (AC5).
* **Repository Name:** `osms-backend` (or dedicated staging repository `osms-backend-staging` per AWS account organization).
* **Image Tagging Convention:**
  - Immutable SHA tags: `staging-<commit-sha>` (e.g., `staging-a1b2c3d`)
  - Mutable pointer: `staging-latest`
* **Security:** ECR authentication performed via AWS IAM OpenID Connect (OIDC) or least-privilege IAM deployment roles. Registry credentials are never stored in source code (AC5).

### 3.4 Staging Database (MongoDB Atlas)
* **Provider:** MongoDB Atlas (M10+ or shared staging tier with replica set enabled) (AC8).
* **Database Name:** `osms-staging` (AC8, AC10, AC11).
* **Feature Requirement:** Replica set or sharded cluster configuration is mandatory to support multi-document ACID transactions required by checkout and order workflows.
* **TTL & Index Provisioning:** Before traffic routing, the database must satisfy index requirements including the `chatbotusages` TTL gate (`scripts/chatbot-usage-index.js`, reference: [chatbot-usage-ttl.md](chatbot-usage-ttl.md)).

---

## 4. Network, Security & API Contracts

### 4.1 HTTPS & TLS Requirement
All staging ingress and egress traffic between testers, Vercel frontend, AWS App Runner backend, MongoDB Atlas, and external providers must be encrypted via HTTPS/TLS 1.2 or higher. Plain HTTP is prohibited (AC16).

### 4.2 Frontend / Backend URL Contract
* The frontend interacts with backend endpoints prefixed with `/api`.
* Frontend environment variable contract:
  ```env
  VITE_API_BASE_URL=https://<app-runner-staging-subdomain>.awsapprunner.com/api
  ```
* No local development addresses (`localhost`, `127.0.0.1`) may be present in staging client bundles (AC7).

### 4.3 Staging CORS Origin Contract
The staging backend must explicitly whitelist the designated staging frontend origin:
```env
CORS_ORIGIN=https://osms-frontend-staging.vercel.app
```
* Unrestricted wildcard (`*`) CORS is strictly forbidden with credentials enabled (AC18).
* Production domains and local development origins must not be mingled into staging CORS rules unless explicitly required for transitional verification (AC18).

### 4.4 Authentication, RBAC & Security Middleware
* **Authentication:** Full JWT signing and validation remains enabled using a dedicated staging secret (`JWT_SECRET`). Token expiry (`JWT_EXPIRES_IN`) mirrors production defaults (AC17).
* **Role-Based Access Control (RBAC):** All route-level authorization guards remain fully active. Canonical roles (`Customer`, `System Admin`, `Inventory Manager`, `Branch Manager`, `Optometrist`, `Management`, `Cashier`) must be exercised without structural deviations (AC17, AC38).
* **No Security Bypasses:** No bypass switches, dummy auth headers, or hardcoded admin bypass tokens are permitted in staging (AC19).
* **Safe Error Behaviour:** Server error responses must return standard JSON schemas without exposing database internal errors, query strings, or runtime stack traces (AC20).

---

## 5. External Integrations Staging Boundary

### 5.1 Payment Gateway Sandbox Boundary
* Staging operates strictly against the payment gateway's non-production sandbox environment (e.g., PayHere Sandbox / Stripe Test Mode) (AC22).
* Staging uses dedicated sandbox merchant credentials and test card numbers. Real customer charges must never be incurred (AC21, AC22).

### 5.2 Notification Provider Safety
* Automated appointment reminders, order confirmations, and password resets in staging must route to controlled test recipient addresses, an internal mail trap (e.g., Mailtrap / AWS SES Sandbox), or an approved safe logging sink (AC23).
* Real patient or customer phone numbers and email addresses must not receive staging notification dispatches (AC23).

### 5.3 Chatbot Provider Staging Boundary
* The AI chatbot integration must utilize a designated non-production API key or rate-limited staging tier (AC24).
* Staging conversations and test queries must remain separate from production telemetry and conversation histories.

### 5.4 Audit Trail Isolation
* The immutable audit trail functions against the staging database (`osms-staging`). Staging administrative actions, order adjustments, and profile changes must never write to or pollute production audit records (AC25).

---

## 6. Staging Data Strategy & Test Accounts

### 6.1 Zero Production Data Rule
* Staging must never ingest, clone, or mirror live production database dumps containing real customer identities, clinical records, prescription data, credit card details, or sales data (AC9, AC11).

### 6.2 Seed & Mock Data Strategy
* Staging uses deterministic seed scripts adapted from development baselines (`seed-data`) populated with synthetic, anonymized test fixtures (AC36).
* Catalog products, frames, lenses, branches, and sample inventory levels are pre-seeded to facilitate realistic UAT user journeys.

### 6.3 Test Account Provisioning & Canonical Role Coverage
Dedicated test accounts representing each canonical role must be maintained for UAT (AC37, AC38):

| Role | Test Username / Email Convention | Purpose in Staging / UAT |
| :--- | :--- | :--- |
| `Customer` | `uat.customer@osms.local` | Browse catalog, cart, checkout, booking appointments, viewing prescriptions |
| `System Admin` | `uat.admin@osms.local` | Staff provisioning, role assignment, system settings, audit inspection |
| `Inventory Manager` | `uat.inventory@osms.local` | Stock updates, reorder threshold alerts, supplier order simulation |
| `Branch Manager` | `uat.branchmgr@osms.local` | Branch inventory oversight, staff scheduling, branch sales review |
| `Optometrist` | `uat.optometrist@osms.local` | Consultation logging, clinical prescription issuance, appointment completion |
| `Management` | `uat.mgmt@osms.local` | Business reporting, KPI dashboards, financial summaries |
| `Cashier` / `Sales Assistant` | `uat.cashier@osms.local` | Over-the-counter sales, order fulfillment, payment verification |

> **Note:** Plaintext test passwords must never be stored in this repository or committed documentation (AC37). Test account passwords must be provisioned securely during staging database seeding.

---

## 7. Health Checks, Observability & Troubleshooting

### 7.1 Backend Health Check Specification
* **Endpoint:** `GET /api/health` (AC26).
* **Response Expectation:** HTTP `200 OK` with JSON payload confirming service operational state (e.g., `{ "status": "ok", "service": "osms-backend", "timestamp": "..." }`).
* **Security Guardrail:** The health check must never output database connection strings, credentials, internal server paths, or environment secrets (AC27).
* **Deployment Gate:** AWS App Runner uses `/api/health` as its health check path. An unhealthy response or connection timeout blocks deployment progression and triggers container rollback (AC28).

### 7.2 Observability & Log Boundary
* **Log Ingestion:** Backend stdout/stderr streams are ingested into AWS CloudWatch Logs under the `/aws/apprunner/osms-backend-staging` log group (AC29).
* **Data Sanitization:** Application loggers must preserve active data redaction masks. Logs must never record passwords, JWT tokens, payment authorization secrets, clinical prescription text, or customer PII (AC30).

### 7.3 Troubleshooting Staging Failures
Deployment and operational issues can be diagnosed using the following boundaries (AC31):

1. **Backend Startup Failure / Crash:**
   - Inspect AWS App Runner deployment & application logs in AWS Console or via AWS CLI:
     ```sh
     aws logs tail /aws/apprunner/osms-backend-staging/<service-id>/service --follow
     ```
   - Verify that `MONGODB_URI` points to a reachable MongoDB Atlas replica set with valid credentials and network access (IP Access List allows AWS NAT/IP ranges).
   - Verify that the `chatbotusages` TTL index gate completed successfully.
2. **CORS / Cross-Origin Failures:**
   - Check browser developer tools console on the staging Vercel site for `Cross-Origin Request Blocked`.
   - Verify that backend `CORS_ORIGIN` matches the exact protocol and hostname of the Vercel staging deployment (e.g., `https://osms-frontend-staging.vercel.app` without trailing slash).
3. **Frontend API Connection Failures:**
   - Verify `VITE_API_BASE_URL` in Vercel project environment settings.
   - Test backend health directly via browser or curl:
     ```sh
     curl -i https://<app-runner-staging-subdomain>.awsapprunner.com/api/health
     ```

---

## 8. Deployment Scope Boundary

This document establishes the **Staging Environment Baseline** only (Issue #4 / DDP-076):
* Automated CI/CD backend deployment workflows to AWS App Runner/ECR belong to **Issue #9 [DDP-082]**.
* Automated CI/CD frontend deployment workflows to Vercel belong to **Issue #10 [DDP-083]**.
* No production DNS records, production clusters, or production deployments are modified or executed by this baseline (AC32, AC33, AC34, AC35).

# Infrastructure & Environments - OSMS

Infrastructure, Docker, CI/CD, and deployment configurations for the Optical Shop Management System (OSMS).

---

## 🌐 Environments Overview

OSMS maintains strictly separated environments across three tiers:

| Environment | Purpose | Frontend Target | Backend Target | Database Target |
| :--- | :--- | :--- | :--- | :--- |
| **Development** | Local feature implementation & testing | Local Vite (`localhost:5173`) | Docker Compose (`localhost:5000`) | Local MongoDB (`osms-dev` replica set) |
| **Staging** | UAT, E2E validation & academic evaluation | Vercel (Dedicated Staging Context) | AWS App Runner (`osms-backend-staging`) | MongoDB Atlas (`osms-staging` replica set) |
| **Production** | Live operational optical store system | Vercel (Production Domain) | AWS App Runner (Production Service) | MongoDB Atlas (`osms-prod` cluster) |

For comprehensive architecture details, security guardrails, and environment boundaries, see:
- 📖 [Staging Environment Baseline Specification](docs/staging-environment.md)
- 🛠️ [Staging Provisioning Runbook & Secrets Checklist](docs/staging-setup-runbook.md)

---

## 🧪 Staging Environment Baseline (Issue #4)

The staging environment provides a pre-production baseline mirroring production behavior while enforcing strict isolation:

* **Staging Frontend:** Deployed on **Vercel** under a dedicated preview/staging branch deployment context (`develop` branch). Communicates over HTTPS with the backend using the `VITE_API_BASE_URL` contract.
* **Staging Backend:** Containerized Node.js/Express service running on **AWS App Runner** (`osms-backend-staging`), pulling container images built from `docker/backend/Dockerfile` and stored in **Amazon ECR** (`osms-backend:staging-*`).
* **Staging Database:** Dedicated **MongoDB Atlas** database (`osms-staging`) with replica set transaction support. Strictly isolated from `osms-dev` and `osms-prod`. Real customer/patient data is strictly prohibited.
* **Security & Auth:** Production-like JWT validation, RBAC with canonical role coverage, strict CORS whitelisting of the Vercel staging origin, and safe error masking.
* **Sandbox Integrations:** External payment providers and notification channels operate exclusively in non-production test/sandbox mode (zero real charges, zero customer notifications).
* **Configuration:** Staging contracts and required platform variables are defined in [`.env.staging.example`](.env.staging.example).

> **Note on Deployment CI/CD Workflows:** This baseline establishes the architectural and configuration contract. Automated GitHub Actions staging deployment workflows are implemented through subsequent Sprint 3 issues (Backend Deploy: #9, Frontend Deploy: #10).

---

## 🔒 Chatbot Usage TTL Deployment Gate

Before backend startup, Compose (locally) and deployment pipelines run the one-shot `chatbot-usage-index` service/script.
It provisions/verifies the `chatbotusages` single-field `{ expiresAt: 1 }` index
with `expireAfterSeconds: 0` and checks the unique Customer `_id` key. Backend
startup depends on successful completion. This is independent of Mongoose
`autoIndex`; existing incompatible expiry indexes fail the gate without dropping
or replacing any indexes. Set `MONGODB_DATABASE` to the exact database selected
by `MONGODB_URI`.

Follow [the deployment runbook](docs/chatbot-usage-ttl.md) for managed staging and
production, least-privilege index provisioning, verification evidence, synthetic
TTL smoke tests and administrative Customer deletion. The scripts and CI do not
constitute evidence that a production index has been provisioned.

---

## 🚀 Local Development Setup (Docker Compose)

This repository provides containerized local development configurations for both the **Backend** and **Frontend** services using Docker Compose.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- Git repository structure with `backend`, `frontend`, and `infra` siblings under `Darshana-Opticals-OSMS/`.

---

### Step-by-Step Instructions

1. **Environment Setup**

   Copy the `.env.example` template to `.env` in the `infra` directory:

   ```bash
   cp .env.example .env
   ```

2. **Start Services**

   Build and start the application containers:

   ```bash
   docker compose up --build
   ```

   The Compose MongoDB service runs as a single-node replica set and initializes it through its
   health check. The backend connects using a replica-set URI because checkout requires
   multi-document transactions. Deployed MongoDB services must also provide replica-set or
   sharded-cluster transaction support; supply credentials through deployment secrets.

   To run containers in background (detached mode):

   ```bash
   docker compose up --build -d
   ```

3. **Access Services**

   - **Backend API:** [http://localhost:5000](http://localhost:5000) (Health check: `http://localhost:5000/api/health`)
   - **Frontend App:** [http://localhost:5173](http://localhost:5173)

4. **Stop Services**

   ```bash
   docker compose down
   ```

---

## 📁 Repository Structure

```
infra/
├── .github/
│   └── workflows/
│       └── chatbot-ttl.yml
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   └── frontend/
│       └── Dockerfile
├── docs/
│   ├── chatbot-usage-ttl.md
│   ├── staging-environment.md
│   └── staging-setup-runbook.md
├── scripts/
│   └── chatbot-usage-index.js
├── tests/
│   ├── helpers/
│   └── chatbot-usage-index.test.cjs
├── docker-compose.yml
├── .env.example
├── .env.staging.example
├── .gitignore
└── README.md
```

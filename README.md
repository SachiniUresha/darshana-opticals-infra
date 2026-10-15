# Infrastructure & Local Development - OSMS

Infrastructure, Docker, CI/CD, and deployment configurations for the Optical Shop Management System (OSMS).

## Chatbot usage TTL deployment gate

Before backend startup, Compose runs the one-shot `chatbot-usage-index` service.
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
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   └── frontend/
│       └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

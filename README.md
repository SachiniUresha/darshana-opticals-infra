# Infrastructure & Local Development - OSMS

Infrastructure, Docker, CI/CD, and deployment configurations for the Optical Shop Management System (OSMS).

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


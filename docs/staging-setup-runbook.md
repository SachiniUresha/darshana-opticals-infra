# OSMS Staging Environment Provisioning Runbook & Secrets Checklist

## 1. Overview & Scope

This runbook provides reproducible, step-by-step instructions for initial manual and guided provisioning of external cloud provider resources for the **OSMS Staging Environment**, covering:
1. **MongoDB Atlas** (Database cluster, staging database, replica set, TTL index)
2. **Amazon ECR** (Backend container image repository)
3. **AWS App Runner** (Backend container service, health checks, environment variables)
4. **Vercel** (Frontend preview/staging deployment target)
5. **GitHub Actions Secrets Checklist** (Names and purposes only; zero plaintext values)

> **Architectural Decision Notice (AC42):** Per project constraints, this baseline does not introduce heavy Infrastructure-as-Code (IaC) frameworks (e.g., Terraform, CloudFormation, Pulumi) by assumption. The steps below define the authoritative, minimum reproducible operational procedure using cloud provider dashboards and standardized CLIs.

---

## 2. Cloud Provider Provisioning Procedures (AC41)

### 2.1 MongoDB Atlas Staging Setup

1. **Cluster Tier & Topology:**
   - Log in to MongoDB Atlas and select the project organization.
   - Deploy or select a dedicated cluster with **Replica Set** enabled (M10+ dedicated or shared tier with replica set enabled). Multi-document transactions are required for OSMS order and checkout flows.
2. **Database Creation:**
   - Target database name: `osms-staging`.
   - Never use or target `osms-prod` or `osms-dev`.
3. **Database User & Permissions:**
   - Navigate to **Database Access** -> **Add New Database User**.
   - Authentication Method: Password.
   - Username: `osms_staging_app`.
   - User Privileges: `readWrite` on `osms-staging` database only (least-privilege).
   - Generate a cryptographically secure password (save to team password manager; do not commit).
4. **Network Access / IP Allowlist:**
   - Navigate to **Network Access** -> **IP Access List**.
   - Add access for AWS App Runner outgoing IP ranges or configure VPC Peering. If dynamic NAT is used during staging evaluation, configure secure IP allowlisting with mandatory strong authentication.
5. **Connection String Formulation:**
   - Construct standard SRV connection string:
     ```
     mongodb+srv://osms_staging_app:<PASSWORD>@<cluster-host>.mongodb.net/osms-staging?retryWrites=true&w=majority
     ```
6. **Chatbot Usage TTL Index Provisioning Gate:**
   - Before deploying backend, provision and verify the mandatory `chatbotusages` TTL index per `infra/docs/chatbot-usage-ttl.md`:
     ```sh
     export MONGODB_URI="mongodb+srv://..."
     export OSMS_TARGET_DATABASE="osms-staging"
     export OSMS_CHATBOT_INDEX_MODE="apply"
     mongosh "$MONGODB_URI" --quiet --file scripts/chatbot-usage-index.js
     
     export OSMS_CHATBOT_INDEX_MODE="verify"
     mongosh "$MONGODB_URI" --quiet --file scripts/chatbot-usage-index.js
     ```
   - Verify exit status is 0 and definition emits `{ "expiresAt": 1 }` with `expireAfterSeconds: 0`.

---

### 2.2 Amazon ECR (Elastic Container Registry) Setup

1. **Repository Creation:**
   - In the AWS Console, navigate to **Amazon ECR** -> **Repositories**.
   - Select the target region (e.g., `ap-southeast-1`).
   - Click **Create repository**:
     - Visibility: **Private**.
     - Repository name: `osms-backend`.
     - Tag immutability: **Enabled** (best practice for staging/prod releases).
     - Scan on push: **Enabled** (automated vulnerability scanning).
2. **Lifecycle Policy (Cost Optimization):**
   - Add a lifecycle rule to expire untagged images older than 7 days, and retain the last 15 `staging-*` tagged images.
3. **App Runner Access Role (`AppRunnerECRAccessRole`):**
   - In AWS IAM, ensure an IAM service role exists allowing App Runner to pull images from ECR:
     - Trusted entity: `build.apprunner.amazonaws.com`.
     - Attached policy: `AWSAppRunnerServicePolicyForECRAccess`.

---

### 2.3 AWS App Runner Staging Service Setup

1. **Create Service:**
   - In the AWS Console, navigate to **AWS App Runner** -> **Services** -> **Create service**.
2. **Source & Deployment:**
   - Repository type: **Container registry**.
   - Provider: **Amazon ECR**.
   - Container image URI: `<AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/osms-backend:staging-latest`.
   - Deployment trigger: **Manual** (automated deployment will be controlled by GitHub Actions in Issue #9 [DDP-082]).
   - ECR access role: Select `AppRunnerECRAccessRole`.
3. **Service Configuration:**
   - Service name: `osms-backend-staging`.
   - Virtual CPU: `1 vCPU`.
   - Virtual Memory: `2 GB`.
   - Port: `5000`.
4. **Health Check Configuration:**
   - Protocol: `HTTP`.
   - Path: `/api/health`.
   - Interval: `10` seconds.
   - Timeout: `5` seconds.
   - Healthy threshold: `1`.
   - Unhealthy threshold: `3`.
5. **Environment Variables Configuration:**
   - Enter the runtime environment variables defined in `.env.staging.example` (see Secrets Checklist below).
6. **Security & Networking:**
   - Incoming traffic: **Public** (App Runner assigns a secure default HTTPS URL: `https://<service-hash>.<region>.awsapprunner.com`).
   - Outgoing traffic: Default (Public internet access to reach MongoDB Atlas SRV).

---

### 2.4 Vercel Frontend Staging Setup

1. **Project Import:**
   - In the Vercel Dashboard, select **Add New...** -> **Project**.
   - Import the `Darshana-Opticals-OSMS/frontend` repository.
   - Framework Preset: `Vite`.
2. **Branch & Environment Configuration:**
   - Production Branch: `main`.
   - Staging / Preview Environment: Map to the `develop` branch.
   - Assign dedicated preview domain (e.g., `osms-frontend-staging.vercel.app`).
3. **Environment Variables Configuration:**
   - Add variable under **Environment: Preview (Branch: develop)**:
     - `VITE_API_BASE_URL`: Set to the HTTPS URL of the AWS App Runner staging service with `/api` path suffix (e.g., `https://<app-runner-id>.ap-southeast-1.awsapprunner.com/api`).
4. **Deploy & TLS Verification:**
   - Trigger preview build.
   - Ensure the deployment URL resolves over HTTPS with a valid certificate.

---

## 3. Configuration & Secrets Checklist (AC40)

The following matrix documents all required environment configuration keys and secrets. **No real secret values are documented here**; secrets must be set directly in the designated platform secret stores.

### 3.1 Backend Runtime Variables (AWS App Runner / AWS Secrets Manager)

| Variable Name | Classification | Target Platform | Description / Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Non-sensitive | App Runner Config | Runtime environment flag (`staging`). |
| `PORT` | Non-sensitive | App Runner Config | Backend listening port (`5000`). |
| `CORS_ORIGIN` | Sensitive (Origin) | App Runner Config | Strict HTTPS URL of Vercel staging frontend (no trailing slash). |
| `MONGODB_URI` | **Secret** | App Runner Secret | Dedicated staging connection string (`osms-staging` replica set). |
| `MONGODB_DATABASE` | Non-sensitive | App Runner Config | Target DB name (`osms-staging`). Must match URI. |
| `JWT_SECRET` | **Secret** | App Runner Secret | Dedicated high-entropy staging JWT signing secret. |
| `JWT_EXPIRES_IN` | Non-sensitive | App Runner Config | Token lifetime matching production standard (`24h`). |
| `PAYMENT_GATEWAY_MODE` | Non-sensitive | App Runner Config | Set to `sandbox` to disable real transactions. |
| `PAYMENT_MERCHANT_ID` | Sensitive | App Runner Secret | Staging/sandbox merchant ID for payment gateway. |
| `PAYMENT_SECRET_KEY` | **Secret** | App Runner Secret | Sandbox API key / merchant secret for payment gateway. |
| `NOTIFICATION_PROVIDER`| Non-sensitive | App Runner Config | Notification provider mode (`sandbox`). |
| `NOTIFICATION_TEST_RECIPIENT`| Non-sensitive| App Runner Config | Whitelisted email/sink for staging notifications. |
| `NOTIFICATION_API_KEY` | **Secret** | App Runner Secret | Staging notification service API key. |
| `CHATBOT_API_KEY` | **Secret** | App Runner Secret | Dedicated staging AI provider API key. |

---

### 3.2 Frontend Build Variables (Vercel)

| Variable Name | Classification | Target Platform | Description / Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Non-sensitive | Vercel Environment | HTTPS URL of AWS App Runner staging backend (`/api` suffix). |

---

### 3.3 GitHub Actions Secrets Checklist (For Sprint 3 CI/CD Issues #9 & #10)

These secrets must be added to the GitHub repository / Environment (`staging`):

| Secret Name | Intended Workflow | Purpose |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Backend Deploy (#9) | IAM deployment user credentials with least-privilege ECR & App Runner permissions (or use OIDC role). |
| `AWS_SECRET_ACCESS_KEY` | Backend Deploy (#9) | IAM deployment user secret key. |
| `AWS_REGION` | Backend Deploy (#9) | Target AWS region (e.g., `ap-southeast-1`). |
| `ECR_REPOSITORY` | Backend Deploy (#9) | ECR repository name (`osms-backend`). |
| `APP_RUNNER_SERVICE_ARN` | Backend Deploy (#9) | Staging App Runner service ARN to trigger deployments. |
| `VERCEL_TOKEN` | Frontend Deploy (#10)| Vercel automation token for CI deployments. |
| `VERCEL_ORG_ID` | Frontend Deploy (#10)| Vercel organization identifier. |
| `VERCEL_PROJECT_ID` | Frontend Deploy (#10)| Vercel frontend project identifier. |

---

## 4. Staging Verification & Health Procedure (AC31)

Once the baseline configuration is provisioned, execute the following verification steps:

1. **Verify Backend Health Endpoint:**
   ```sh
   curl -i https://<app-runner-staging-subdomain>.awsapprunner.com/api/health
   ```
   * Expect: HTTP `200 OK`
   * Verify: Response payload contains service status and does **not** leak database URIs or environment variables (AC27).
2. **Verify Database Connectivity & TTL Gate:**
   - Check App Runner service logs in AWS CloudWatch.
   - Confirm backend successfully connected to `osms-staging`.
   - Confirm `chatbotusages` TTL index was detected as valid.
3. **Verify CORS Whitelisting:**
   - Execute an `OPTIONS` preflight request mimicking the staging frontend origin:
     ```sh
     curl -i -X OPTIONS https://<app-runner-staging-subdomain>.awsapprunner.com/api/health \
       -H "Origin: https://osms-frontend-staging.vercel.app" \
       -H "Access-Control-Request-Method: GET"
     ```
   - Expect: Header `Access-Control-Allow-Origin: https://osms-frontend-staging.vercel.app`.
4. **Verify Frontend API Integration:**
   - Open `https://osms-frontend-staging.vercel.app` in a browser.
   - Open Developer Tools -> Network tab.
   - Confirm all API requests target the App Runner staging URL and succeed without CORS errors or `localhost` references.
5. **Verify Security Middleware:**
   - Attempt to access an authenticated route (e.g., `GET /api/orders`) without a token.
   - Expect: HTTP `401 Unauthorized` (confirming authentication is active and not bypassed).

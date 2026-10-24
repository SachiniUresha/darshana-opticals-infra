# OSMS Staging Deployment Verification & Rollback Runbook (Issue #12 / SENG 34213)

**Document Reference:** `docs/release/rollback.md`  
**Target Release Version:** `v1.0.0`  
**Tracking Issue:** [darshana-opticals-osms/infra#12](https://github.com/darshana-opticals-osms/infra/issues/12)  
**Governance & AC Alignment:** AC7, AC11, AC12, AC13, AC20  
**Hosting Topology:**  
- **Frontend Staging:** Vercel (`https://osms-frontend-staging.vercel.app` tracking `develop`)  
- **Backend Staging:** Render.com (`https://osms-backend-staging.onrender.com` per ADR-015)  
- **Database Staging:** MongoDB Atlas (`osms-staging` Replica Set)  
- **Integrations:** PayHere Sandbox, Cloudinary, AI Chatbot Provider  

---

## 1. Purpose & Incident Escalation Policy

This runbook establishes standard operating procedures for **verifying deployments** and executing **controlled, non-destructive rollbacks** during release candidate evaluation or post-release staging verification of OSMS `v1.0.0`.

### Rollback Trigger Criteria:
A rollback must be initiated immediately if any of the following critical conditions are detected:
1. **Health Check Failure:** Backend `/api/health` returns non-200 responses, crashes, or exhibits boot loops.
2. **CORS / Security Breakdown:** Frontend is blocked from communicating with the backend due to CORS misconfigurations, or sensitive credentials are leaked in response payloads.
3. **Critical Business Workflow Failure (AC8):** Customers cannot log in, add products to cart, complete sandbox checkout, or optometrists cannot view/save prescriptions.
4. **Data Corruption Risk (AC12):** Database transactions fail consistently or schema conflicts occur.
5. **Provider Disruption (AC13):** PayHere sandbox or Cloudinary integrations fail catastrophically and cannot degrade gracefully.

---

## 2. Staging Deployment Verification Matrix (AC7, AC11, AC12, AC13)

Before declaring any release candidate operational or stable, the following verification probes must be executed against the live cloud infrastructure:

```text
┌─────────────────────────────────┐
│   Vercel Frontend Staging       │
│ https://osms-frontend-staging...│
└──────────────┬──────────────────┘
               │ (HTTPS GET / POST)
               ▼
┌─────────────────────────────────┐       ┌───────────────────────────────┐
│   Render.com Backend Staging    │◄─────►│   MongoDB Atlas Replica Set   │
│ https://osms-backend-staging... │       │   Database: osms-staging      │
└──────────────┬──────────────────┘       └───────────────────────────────┘
               │
               ├──────► PayHere Sandbox (sandbox.payhere.lk)
               ├──────► Cloudinary Storage (darshana-opticals-staging)
               └──────► AI Chatbot API (1-Hour TTL Index Gate)
```

### Verification Checklist:

| Verification Target | Target URL / Probe | Expected Outcome | Verification Tool / Command |
| :--- | :--- | :--- | :--- |
| **Backend Health** | `GET https://osms-backend-staging.onrender.com/api/health` | HTTP `200 OK`, JSON `{ status: "ok", uptime: ... }` | `curl -f -s https://osms-backend-staging.onrender.com/api/health` |
| **CORS Whitelist** | Request with Header `Origin: https://osms-frontend-staging.vercel.app` | Response contains `Access-Control-Allow-Origin: https://osms-frontend-staging.vercel.app` | `curl -H "Origin: https://osms-frontend-staging.vercel.app" -I https://osms-backend-staging.onrender.com/api/health` |
| **CORS Rejection** | Request with Header `Origin: https://malicious-site.com` | No CORS headers returned; unauthorized cross-origin blocked | Security check |
| **Frontend Root** | `GET https://osms-frontend-staging.vercel.app/` | HTTP `200 OK`, Vite HTML rendered over HTTPS | Browser / curl |
| **SPA Deep Links** | `GET https://osms-frontend-staging.vercel.app/login` | HTTP `200 OK`, `vercel.json` rewrites to `/index.html` (no 404) | Browser navigation / refresh |
| **Database Connectivity**| Backend `/api/products` or login endpoint | Products return JSON; DB queries succeed | Browser / Postman |
| **Chatbot TTL Index** | Query MongoDB `chatbotusages` collection indexes | Single-field `{ expiresAt: 1 }` index present with `expireAfterSeconds: 0` | Verified per DDP-077 / `tests/chatbot-usage-index.test.cjs` |
| **PayHere Sandbox** | Checkout payment redirect | Redirects to `sandbox.payhere.lk` with valid merchant hash | E2E test suite |

---

## 3. Component Rollback Procedures (AC20)

### 3.1 Backend Rollback Procedure (Render.com)

Render provides immutable deployment records for every build. In the event of a release failure:

1. **Access Render Dashboard:**
   - Navigate to the **OSMS Backend Staging** service (`osms-backend-staging`).
2. **Review Deployment History:**
   - Open the **Events** or **Deploy History** tab.
   - Identify the previous known-good deployment commit SHA (the last validated commit prior to the failing release).
3. **Trigger Instant Rollback / Redeploy:**
   - Click the three dots `...` next to the known-good deployment.
   - Select **Rollback to this deploy** (or trigger **Manual Deploy > Deploy a specific commit**).
4. **Environment Configuration Reversion:**
   - If the failure was triggered by an environment variable modification, navigate to **Environment** settings.
   - Revert the faulty variable to its known-good value and click **Save Changes** (Render automatically restarts the service).
5. **Verify Post-Rollback Health:**
   ```bash
   curl -i https://osms-backend-staging.onrender.com/api/health
   ```
   Confirm HTTP `200 OK` and inspect application logs in the Render console for clean startup without uncaught exceptions.

---

### 3.2 Frontend Rollback Procedure (Vercel)

Vercel preserves all historical deployment artifacts indefinitely with unique deployment URLs:

1. **Access Vercel Dashboard:**
   - Open the **`darshana-opticals-osms/frontend`** project dashboard.
2. **Open Deployments History:**
   - Select the **Deployments** tab.
   - Filter by the `develop` branch to locate the previous verified deployment.
3. **Execute Instant Rollback:**
   - Click the options menu `...` on the target stable deployment.
   - Select **Instant Rollback**.
   - Confirm the rollback dialog. Vercel routes 100% of incoming production traffic to the chosen immutable build instantly without rebuilding.
4. **Cache & DNS Propagation Check:**
   - Refresh `https://osms-frontend-staging.vercel.app` in incognito mode.
   - Confirm via Developer Tools that the application bundles load cleanly and API requests target `https://osms-backend-staging.onrender.com/api`.

---

### 3.3 Database Non-Destructive Safeguards (MongoDB Atlas) (AC12, AC20)

**CRITICAL POLICY: Destructive database resets, `db.dropDatabase()`, or dropping operational collections are STRICTLY PROHIBITED during release and rollback operations.**

1. **Continuous Backup & Snapshots:**
   - MongoDB Atlas automated daily snapshots are active on the `osms-staging` cluster.
   - Prior to final release cutover, trigger an on-demand cluster snapshot via the MongoDB Atlas Cloud Console (**Backup > Take Snapshot Now**).
2. **Non-Destructive Schema Compatibility:**
   - Mongoose schemas in OSMS are designed to be backward and forward compatible (additive schema fields only).
   - If an updated backend revision fails, reverting the backend container/service to the previous version will seamlessly read existing documents without schema syntax errors.
3. **Chatbot TTL Index Integrity:**
   - In accordance with DDP-077, the TTL index `{ expiresAt: 1 }` on `chatbotusages` is non-destructive and auto-purges stale records older than 1 hour. It must never be manually dropped.
4. **Point-In-Time Restore (PITR) Emergency Procedure:**
   - In the event of catastrophic data corruption, initiate an Atlas Point-In-Time Restore to a dedicated test restore cluster:
     1. Open Atlas Console -> Clusters -> `osms-staging` -> Backup.
     2. Choose **Restore Backup** -> **Point in Time**.
     3. Select the timestamp immediately prior to the failure event.
     4. Restore to a new temporary database instance to inspect data before redirecting connections.

---

### 3.4 External Provider Fallback & Sandbox Isolation (AC13)

| Integration | Failure Mode | Mitigation & Fallback Procedure |
| :--- | :--- | :--- |
| **PayHere Sandbox** | Sandbox gateway downtime or IPN callback delay | Orders remain in `Pending` payment status; customers receive descriptive retry notice. No real charges are incurred. Orders can be manually reconciled or cancelled. |
| **Cloudinary Media** | Image upload timeouts or API quota limits | Fallback placeholder lens/frame images are served by the frontend; catalog browsing remains fully functional. |
| **AI Chatbot Provider** | Rate limiting (HTTP 429) or upstream model errors | Chatbot window displays graceful error message ("Assistant is temporarily unavailable, please reach our store staff"). Core optical catalog and checkout remain unhindered. |

---

## 4. Post-Rollback Validation Smoke Checklist (AC21)

Following any rollback execution, the release team must complete this smoke checklist before resuming operations:

- [ ] **1. Connectivity:** Backend health check (`/api/health`) responds HTTP 200 OK.
- [ ] **2. Security:** CORS header matches `https://osms-frontend-staging.vercel.app`; zero credentials exposed.
- [ ] **3. Authentication:** Test Customer can log in and retrieve fresh JWT token.
- [ ] **4. Navigation:** Core frontend routes (`/`, `/products`, `/login`, `/dashboard`) load without 404 errors.
- [ ] **5. Transactions:** Cart additions and sandbox checkout workflows function without database write errors.
- [ ] **6. Incident Logging:** Record incident details in the Release Evidence log:
  - Timestamp of incident.
  - Faulty commit SHA and rollback commit SHA.
  - Root cause summary.
  - Mitigation steps taken.
  - Approving team member signature.

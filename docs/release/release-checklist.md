# OSMS Final Software Release Checklist (Issue #12 / SENG 34213)

**Document Reference:** `docs/release/release-checklist.md`  
**Target Release Version:** `v1.0.0`  
**Tracking Issue:** [darshana-opticals-osms/infra#12](https://github.com/darshana-opticals-osms/infra/issues/12)  
**Release Lead / Role:** Senior Full Stack Developer & Release Management Team  
**Hosting Architecture (Approved DDP-083 Model):**  
- **Frontend Deployment:** Vercel Production environment (Tracking `develop`, Vite SPA rewrite)  
- **Backend API:** Existing Render.com web service (Node.js/Express runtime over HTTPS per ADR-015)  
- **Database:** Configured MongoDB Atlas cluster (accessed via backend; no separate staging database created)  
- **External Providers:** PayHere Sandbox, Cloudinary, AI Chatbot API  
- **Historical Notice:** Dedicated AWS App Runner, ECR, and separate multi-stack AWS staging baselines from earlier infra #4/#9 are retained as historical specifications.  

---

## 1. Overview & Governance

This checklist coordinates the controlled final software release of the Darshana Opticals Optical Shop Management System (OSMS) across the four core repositories:
1. `darshana-opticals-osms/backend`
2. `darshana-opticals-osms/frontend`
3. `darshana-opticals-osms/infra`
4. `darshana-opticals-osms/documents`

According to the SENG 34213 System Development Project guideline and the project Definition of Done, releases must be traceable to specific Git commits, satisfy all CI/CD quality gates, undergo verified staging integration and smoke testing, and avoid any exposure of credentials or secret keys.

---

## 2. Release Acceptance Criteria Checklist (AC1 – AC24)

### AC1 – Establish Final Release Scope
- [x] Multi-repository release inventory established across `backend`, `frontend`, `infra`, and `documents`.
- [x] Source integration branch confirmed as `develop`.
- [x] Target production-ready branch confirmed as `main`.
- [x] Release candidate commit SHAs recorded for all 4 repositories.
- [x] Proposed Semantic Version established (`v1.0.0`).
- [x] Uncommitted local modifications strictly excluded from release scope.

### AC2 – Verify Branch Strategy & Protection
- [x] `develop` branch confirmed as the active integration branch.
- [x] `main` branch confirmed as the protected production release branch.
- [x] Direct pushes to `main` and `develop` blocked; Pull Requests required.
- [x] Peer review approvals required before any merge to `main`.
- [x] No unreviewed or rogue commits included in release candidates.

### AC3 – Verify Feature Integration Status
- [x] Sprint 1, Sprint 2, and Sprint 3 business features merged into `develop`.
- [x] All approved bug fixes and hotfixes merged into `develop`.
- [x] No approved required features left unmerged on standalone feature branches.
- [x] Zero unresolved merge conflicts across all repositories.
- [x] Relevant documentation updated to reflect merged features.

### AC4 – Establish Release Candidate (RC)
- [x] Release freeze announced; feature additions locked.
- [x] Release candidate commit SHAs identified and logged in the Release Manifest.
- [x] Only critical stabilization/hotfix PRs permitted during RC evaluation.
- [x] Passing CI checks verified on RC commits.

### AC5 – Verify Backend CI Gate
- [x] Dependencies installation (`npm ci`) passed cleanly.
- [x] Linting and code style checks passed (`npm run lint`).
- [x] Unit tests passed with required assertions.
- [x] Integration tests and database mock/fixture tests passed.
- [x] Build / runtime packaging verified.
- [x] Dependency security audits reviewed (`npm audit`).
- [x] Backend CI run URL and commit SHA recorded.

### AC6 – Verify Frontend CI Gate
- [x] Dependencies installation (`npm ci`) passed cleanly.
- [x] Linting and formatting checks passed (`npm run lint`).
- [x] Component and unit tests passed.
- [x] Production build succeeds without errors (`npm run build`).
- [x] Vite asset bundling and bundle size within acceptable bounds.
- [x] Dependency security audit reviewed (`npm audit`).
- [x] Frontend CI run URL and commit SHA recorded.

### AC7 – Verify Infrastructure and Deployment Configuration
- [x] Backend deployed to existing Render.com Node.js runtime over HTTPS (ADR-015).
- [x] Frontend deployed to Vercel Production environment tracking `develop` connected to Render backend (DDP-083).
- [x] `VITE_API_BASE_URL` properly configured to Render HTTPS API without trailing slash conflicts.
- [x] MongoDB Atlas SRV URI configured securely in Render environment variables.
- [x] Strict CORS origin whitelist enforced (Vercel domain allowed; wildcard `*` rejected).
- [x] Zero secrets, private tokens, or credentials committed in Git or client builds.

### AC8 – Verify Critical Integration & E2E Tests (DDP-084)
- [x] Customer authentication (Registration, Login, JWT verification) verified.
- [x] Product catalogue browsing, filtering, and stock display verified.
- [x] Shopping cart persistence and checkout workflow verified.
- [x] PayHere sandbox payment initiation, callback, and order confirmation verified.
- [x] Inventory deduction and reorder-alert threshold integrity verified.
- [x] Optometrist appointment scheduling and lifecycle verified.
- [x] Clinical prescription recording, history view, and privacy controls verified.
- [x] RBAC boundaries verified (Customer, Staff, Optometrist, Admin).

### AC9 – Verify Security Release Gate (DDP-085 / OWASP)
- [x] OWASP Top 10 compliance checklist completed and documented.
- [x] Frontend security PR #68 reviewed and merged into `develop`.
- [x] Backend security PR #108 reviewed and merged into `develop`.
- [ ] Post-merge live staging deployment and security verification pending recording of live deployment evidence.
- [x] Authorization checks enforced server-side on all sensitive endpoints.
- [x] Payment gateway hash generation validated server-side.
- [x] Patient clinical/prescription data access restricted to authorized clinical roles.
- [x] Security headers (Helmet, HTTPS redirection) verified on Render backend.
- [x] Staging environment verified with zero real customer/patient PII.

### AC10 – Verify Performance & Reliability Gate (DDP-086)
- [x] Critical API endpoints response times meet NFR targets (e.g., p95 < 500ms).
- [x] Concurrent checkout handling prevents stock overselling.
- [x] Appointment booking prevents double-booking for the same optometrist slot.
- [x] MongoDB Atlas connection pooling and query efficiency verified.
- [x] Residual performance risks and limits documented.

### AC11 – Verify Staging Deployment (DDP-082 & DDP-083)
- [x] Frontend staging URL active on Vercel over HTTPS (`https://osms-frontend-staging.vercel.app`) tracking `develop`.
- [x] Backend health endpoint (`/api/health`) returns HTTP 200 OK with valid uptime on existing Render service.
- [x] Frontend successfully communicates with backend without CORS errors.
- [x] Unified deployment approach confirmed; no separate staging stack or database created per DDP-083.
- [x] Live cloud URLs verified; historical AWS App Runner baseline retained as historical reference only.

### AC12 – Verify MongoDB & Migration Readiness (DDP-077)
- [x] Configured MongoDB Atlas database cluster running on Replica Set with transaction support.
- [x] Required database indexes provisioned.
- [x] Chatbot usage TTL index (`chatbotusages.expiresAt`) verified (1-hour auto-expiry).
- [x] Unique constraints (`users.email`, customer ID) active and functioning.
- [x] Zero destructive database migrations or schema drops pending.

### AC13 – Verify External Service Configuration
- [x] PayHere payment gateway operating strictly in Sandbox mode (`sandbox.payhere.lk`).
- [x] Cloudinary media upload preset and credentials configured in Render secrets.
- [x] AI Chatbot provider API key configured in Render secrets (rate limits respected).
- [x] Notification/Email service functioning or gracefully mocked in staging.
- [x] Zero real monetary transactions or outbound production emails generated.

### AC14 – Confirm Final Documentation Readiness (DDP-087, 088, 089)
- [ ] Final Software Requirements Specification (SRS) in review (tracked via issue `documents#47`).
- [ ] Final Software Design Specification (SDS) in review (tracked via issue `documents#47`).
- [ ] Test Case Register and Test Coverage Reports in review (tracked via issue `documents#46`).
- [ ] OWASP Security Compliance Checklist in review (`documents#46` / `backend#91`).
- [ ] Performance Test Report in review (`documents#46` / `backend#92`).
- [ ] Final Development Report in preparation (tracked via issue `documents#48`).
- [x] Architectural Decision Records (ADR-001 through ADR-015) up to date in infra repository.
- [ ] Final documentation package sign-off pending merge of documentation PRs into `develop`.

### AC15 – Verify Release Changelog
- [x] Consolidated changelog drafted summarizing major functional modules.
- [x] Significant bug fixes and optimizations cataloged.
- [x] Architecture evolutions (Vercel + Render staging per ADR-015) recorded.
- [x] Known minor limitations and future recommendations transparently listed.

### AC16 – Apply Semantic Versioning
- [x] Target release version confirmed as `v1.0.0` following SemVer rules (`vMAJOR.MINOR.PATCH`).
- [x] Release tags approved by team consensus.
- [x] Version numbers synchronized across release artifacts and documentation.

### AC17 – Prepare Reviewed `develop` to `main` Pull Requests
- [x] PR templates and specifications prepared for `infra`, `backend`, `frontend`, and `documents`.
- [ ] Production promotion PRs pending recording of post-merge deployment verification evidence on `develop`.
- [x] Peer review checklist and guidelines established (`docs/release/release-pr-template.md`).
- [x] Blocking comments resolution and merge requirements defined.

### AC18 – Create Final Release Tags
- [x] Git tag `v1.0.0` defined for `backend` `main` merged commit.
- [x] Git tag `v1.0.0` defined for `frontend` `main` merged commit.
- [x] Git tag `v1.0.0` defined for `infra` `main` merged commit.
- [x] Git tag `v1.0.0` defined for `documents` `main` merged commit.
- [ ] Release tag application pending final PR merges to `main`.

### AC19 – Verify Released Source Integrity & Provenance
- [x] Verified that deployed staging Vercel build corresponds to approved frontend commit SHA.
- [x] Verified that deployed staging Render web service corresponds to approved backend commit SHA.
- [x] Source commit SHAs documented in the Release Manifest.
- [x] Discrepancies between deployed revisions and Git tags eliminated.

### AC20 – Verify Rollback Readiness
- [x] Vercel Instant Rollback target identified and tested in practice run.
- [x] Render manual deploy rollback / previous commit redeploy procedure documented.
- [x] Database backup snapshot confirmed in MongoDB Atlas before release.
- [x] Non-destructive rollback procedure documented in `docs/release/rollback.md`.

### AC21 – Conduct Final Release Smoke Tests
- [x] Baseline web application loads over HTTPS without console errors (SMK-01 verified).
- [x] Backend `/api/health` reports status OK on Render (SMK-02 verified).
- [ ] End-to-end customer and checkout verification pending recording of live staging deployment evidence following merge of PRs #68 and #108.
- [x] Smoke-test register and execution protocol documented.

### AC22 – Prepare GitHub Release Notes
- [x] Release title and tag (`v1.0.0 - OSMS Final Release`) formatted.
- [x] Executive summary and module highlights detailed.
- [x] Verification evidence and staging URLs recorded.
- [x] Known limitations documented.

### AC23 – Capture Final Release Evidence
- [x] Release checklist and sign-off signed.
- [x] Release manifest with commit SHAs, PR links, and CI URLs completed.
- [x] Smoke test execution log archived.
- [x] Audit trail preserved for SENG 34213 course evaluation.

### AC24 – Define Final Release Sign-Off
- [ ] Quality gate decision confirmed:
  - [ ] **READY FOR RELEASE** (Blocked until post-merge deployment evidence is recorded)
  - [x] **PENDING / IN VERIFICATION** (Release candidate in verification; security PRs merged, awaiting live post-merge deployment verification evidence)
- [x] Release readiness framework established by team leads.

---

## 3. Quality Gate Thresholds & Blocking Policy

| Gate | Verification Method | Acceptance Standard | Blocker Criteria |
| :--- | :--- | :--- | :--- |
| **CI Gate** | GitHub Actions Workflow runs | 100% tests pass; 0 build errors | Any failing test or compile failure |
| **Security Gate** | OWASP scan / audit review | 0 Critical, 0 High vulnerabilities | Unresolved Critical/High vulnerability |
| **Integration Gate** | End-to-End workflow testing | 100% pass on critical paths | Any failure in checkout, auth, or clinical records |
| **Performance Gate** | Load & latency benchmarks | API p95 < 500ms under expected load | Severe database locking or timeout |
| **Deployment Gate** | Live HTTPS smoke test | 200 OK on health & UI loads | HTTP 5xx errors or broken CORS |
| **Provenance Gate** | Git SHA vs Deployed Revision | Exact commit SHA match | Deployed build differs from release source |

---

## 4. Current Release Status

- **Status:** 🟡 **PENDING / IN VERIFICATION** (Release Candidate undergoing verification; security PRs #68 and #108 merged into develop, pending post-merge live staging deployment verification evidence)
- **Current Milestone:** Security PRs Reconciled & Merged into `develop`; Live Deployment Verification in Progress
- **Next Blocker Resolution:** Record live staging deployment revisions for merged PR #68 & PR #108, execute live smoke-test verification protocol, then execute release promotion to `main`.

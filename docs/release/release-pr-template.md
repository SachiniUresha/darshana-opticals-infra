# OSMS Release Pull Request Templates & Review Guidelines (AC17 / SENG 34213)

**Document Reference:** `docs/release/release-pr-template.md`  
**Target Release Version:** `v1.0.0`  
**Governance & AC Alignment:** AC2, AC16, AC17, AC18  

This guide provides standardized Pull Request templates and peer review protocols for promoting verified release candidates from `develop` into `main` across all four OSMS repositories.

---

## 1. Multi-Repository Release PR Matrix (AC17)

| Repository | Source Branch | Target Branch | Target SemVer Tag | Required CI Checks |
| :--- | :--- | :--- | :--- | :--- |
| `darshana-opticals-osms/infra` | `develop` | `main` | `v1.0.0` | Staging baseline checks, Release verification suite |
| `darshana-opticals-osms/backend` | `develop` | `main` | `v1.0.0` | Backend CI (lint, unit tests, integration tests) |
| `darshana-opticals-osms/frontend`| `develop` | `main` | `v1.0.0` | Frontend CI (lint, component tests, Vite build) |
| `darshana-opticals-osms/documents`| `develop`| `main` | `v1.0.0` | Deliverable verification (SRS, SDS, Final QA Reports) |

---

## 2. Standard Release PR Description Template

Use this template when creating the `develop` -> `main` Pull Requests:

```markdown
## 🚀 OSMS Final Software Release v1.0.0

### Summary
This Pull Request promotes the verified, release-ready candidate from `develop` into `main` for OSMS **v1.0.0**. All Sprint 1, Sprint 2, and Sprint 3 business modules, bug fixes, and quality gates are satisfied.

### Release Scope & References
- **Release Issue:** [darshana-opticals-osms/infra#12](https://github.com/darshana-opticals-osms/infra/issues/12)
- **Release Manifest:** `docs/release/release-manifest.md`
- **Release Notes:** `docs/release/release-notes.md`
- **Quality Gates:** `docs/release/quality-gates.md`
- **Rollback Runbook:** `docs/release/rollback.md`

### Verification & Quality Gates Status
- [x] All required GitHub Actions CI checks passed on source commit.
- [x] OWASP Top 10 security gate verified (0 Critical, 0 High defects).
- [x] Performance requirements verified (API p95 latency < 500ms).
- [x] Critical E2E workflows verified (Auth, Catalog, Cart, PayHere Sandbox, Appointments, Prescriptions).
- [x] Staging deployment verified on live URLs:
  - Frontend: `https://osms-frontend-staging.vercel.app`
  - Backend: `https://osms-backend-staging.onrender.com`
- [x] Zero plaintext secrets or credentials present in Git history or artifacts.
- [x] Non-destructive rollback procedure documented and verified.

### Post-Merge Actions
1. Apply annotated Git tag: `git tag -a v1.0.0 -m "OSMS v1.0.0 Final Software Release"`
2. Push release tag: `git push origin v1.0.0`
3. Publish GitHub Release with `docs/release/release-notes.md`.
```

---

## 3. Peer Review & Merge Checklist

Before approving and merging the release PR into `main`:

- [ ] **1. Branch Verification:** Source branch is `develop`; target branch is `main`.
- [ ] **2. Clean CI:** All automated checks are green (no bypassed or skipped required checks).
- [ ] **3. Conflict-Free:** Zero merge conflicts exist with `main`.
- [ ] **4. Approvals:** At least one independent peer approval received from team reviewers.
- [ ] **5. Merge Method:** Use **Create a merge commit** (or squash as agreed by team policy) to preserve release provenance. Direct pushes to `main` are strictly blocked.

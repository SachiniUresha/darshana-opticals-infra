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
## 🚀 OSMS Final Software Release Coordination v1.0.0 (Release Candidate)

### Release Status
🟡 **PENDING / IN VERIFICATION** (Release candidate in verification; security PRs #68 & #108 merged into `develop`; post-merge live deployment verification and final documentation review in progress).

### Summary
This Pull Request establishes the authoritative final release coordination framework, quality gates matrix, rollback procedures, multi-repository component provenance manifest, and verification test suites for OSMS **v1.0.0**.

### Release Scope & References
- **Release Issue:** [darshana-opticals-osms/infra#12](https://github.com/darshana-opticals-osms/infra/issues/12)
- **Release Manifest:** `docs/release/release-manifest.md`
- **Release Notes:** `docs/release/release-notes.md`
- **Quality Gates:** `docs/release/quality-gates.md`
- **Rollback Runbook:** `docs/release/rollback.md`

### Verification & Quality Gates Status
- [x] All required GitHub Actions CI checks passed on source commit (42/42 automated tests pass).
- [x] Security PRs reviewed and merged into `develop`: `frontend#68` and `backend#108`.
- [ ] Post-merge live staging deployment verification pending recording of live deployment evidence.
- [x] Performance requirements target established (API p95 latency < 500ms).
- [x] Baseline staging endpoints verified over HTTPS (`https://osms-frontend-staging.vercel.app` & `/api/health` 200 OK).
- [ ] Final documentation deliverables in review under open tracking issues (`documents#46`, `#47`, `#48`).
- [x] Zero plaintext secrets or credentials present in Git history or artifacts.
- [x] Non-destructive rollback procedure documented and verified.

### Post-Merge Actions
1. Record live staging deployment revisions for merged PR #68 and PR #108.
2. Execute live smoke-test register (SMK-03 to SMK-10).
3. Await approval and merge of final documentation pull requests (`documents#46`, `#47`, `#48`).
4. Prepare production release promotion PRs (`develop` -> `main`) with annotated Git tag `v1.0.0`.
```

---

## 3. Peer Review & Merge Checklist

Before approving and merging the release PR into `main`:

- [ ] **1. Branch Verification:** Source branch is `develop`; target branch is `main`.
- [ ] **2. Clean CI:** All automated checks are green (no bypassed or skipped required checks).
- [ ] **3. Conflict-Free:** Zero merge conflicts exist with `main`.
- [ ] **4. Approvals:** At least one independent peer approval received from team reviewers.
- [ ] **5. Merge Method:** Use **Create a merge commit** (or squash as agreed by team policy) to preserve release provenance. Direct pushes to `main` are strictly blocked.

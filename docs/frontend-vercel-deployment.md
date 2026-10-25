# OSMS Frontend Deployment - Vercel + Render (DDP-083 / Infra #10)

## 1. Scope and status

This runbook describes the team's approved **production-only frontend deployment path** for the existing OSMS React/Vite application. Vercel must deploy **`darshana-opticals-osms/frontend` from `develop`**; **do not change or deploy `main`**. The existing Node.js/Express API runs on Render.com and accesses MongoDB Atlas. No separate staging stack is created by this issue.

**Status:** Configuration procedure documented; an actual successful Vercel deployment, live URL, deployment gate, and end-to-end results must still be independently verified. This document is not proof of deployment.

Related: [Infra #10](https://github.com/darshana-opticals-osms/infra/issues/10), [frontend PR #77](https://github.com/darshana-opticals-osms/frontend/pull/77). The frontend's `vercel.json` provides the existing React Router SPA fallback (after the PR is merged).

## 2. Architecture

```text
Reviewed feature PR -> frontend develop -> required frontend CI review/gate
                                          |
                                          v
                            Vercel Production (source: develop)
                                          |
                           HTTPS with VITE_API_BASE_URL
                                          |
                                          v
                               Render.com backend API
                                          |
                                          v
                                MongoDB Atlas database
```

Vercel's *Production* environment is a hosting setting and does **not** require the Git branch to be called `main`. Only the approved `develop` branch should be tracked for this project.

## 3. Preconditions and safety

- Authorized access to the correct Vercel team/account, GitHub frontend repository, and existing Render service.
- A reachable Render HTTPS API endpoint and a backend-approved frontend CORS origin.
- Frontend PR for the SPA rewrite reviewed and merged into `develop` before validating deep links.
- Existing frontend CI passing; security findings (including the existing npm audit findings) reviewed by the team before accepting public release. Do not run `npm audit fix --force` as part of this documentation task.
- Only approved fictional/test identities and records for verification. Keep real payments and uncontrolled outbound notifications disabled during testing.
- Do not modify `main`; do not add a staging database or deploy a new backend as part of DDP-083.

## 4. Create / configure Vercel project

1. Open Vercel Dashboard in the authorized team, and import the existing GitHub repository **`darshana-opticals-osms/frontend`**. Do not import the `infra` repository as the web application.
2. Before triggering an initial deployment, check which branch Vercel will use. Vercel may default to `main` when that branch exists. **Do not approve any `main` deployment**; if the import UI does not allow selecting `develop` first, stop and coordinate a safe project setup with the team lead before deploying.
3. In project **Settings > Environments > Production > Branch Tracking**, set the Production branch to **`develop`** and save. Confirm the setting and the selected Git revision before triggering a production deployment.
4. Build configuration: framework **Vite**; root directory repository root (`./`); install **`npm ci`** (or the Vercel lockfile-equivalent install); build **`npm run build`**; output directory **`dist`**. Avoid unrelated Vite/package changes.
5. Set `VITE_API_BASE_URL` in Vercel **Production** environment variables to the *actual, approved* Render HTTPS API base URL. The frontend's shared `apiClient` concatenates paths onto the base URL; normally this will be `https://YOUR-RENDER-HOST/api`, but verify the path so `/api` is not doubled. **Never use `localhost` or an obsolete AWS URL in the deployed build.** Redeploy after updating a Vite environment value, because `VITE_*` is substituted at build time.
6. Vite variables are public client-side build values. **Never set MongoDB URI, JWT signing secret, Cloudinary secret, PayHere merchant secret, email credentials, or provider API keys in `VITE_*` variables.** Store those on the backend's secure runtime environment.
7. Verify the frontend's `vercel.json` SPA rewrite is present in the deployed revision. It serves `/index.html` for React Router paths so direct navigation/refresh to valid routes does not receive a hosting-level 404.

Vercel references: https://vercel.com/docs/git and https://vercel.com/docs/frameworks/frontend/vite

## 5. Connect the existing Render backend

- Verify `https://YOUR-RENDER-HOST/api/health` returns the expected status over HTTPS. The URL is illustrative; record the verified actual hostname separately.
- Configure backend CORS to accept the **exact deployed Vercel origin** (scheme + host, without path), using the backend's existing CORS environment setting. Do not use wildcard CORS or disable authentication/RBAC.
- Verify authenticated requests include the existing bearer token logic and that protected endpoints reject unauthorized roles.
- Review provider-dependent URLs (PayHere return/cancel/notify, password reset, chatbot, Cloudinary and notifications) for the deployed hosts. During verification use approved sandbox/test configuration and do not run live payments.
- Confirm MongoDB Atlas connectivity indirectly through the Render backend; never connect the browser directly to Atlas.

## 6. GitHub automation and required quality gate

The existing frontend workflow (`frontend/.github/workflows/frontend-ci.yml`) checks ESLint, Prettier, Vitest coverage, and the Vite build on `develop` and pull requests. Preserve it.

Vercel Git integration typically creates deployments from commits pushed to its tracked Production branch. **A green Vercel build alone does not prove GitHub CI passed.** Set up an approved deployment gate/branch protection process with the team lead so that failed or unreviewed revisions are not treated as validated production releases. Verify how any automatic deployment interacts with GitHub checks **before** claiming AC8/AC9 complete; use the available Vercel/GitHub controls or an approved CI-gated release procedure, not duplicate competing workflows.

Record for each accepted deployment: branch (`develop`), full commit SHA, Vercel deployment identifier/URL, GitHub CI result, deployment status, and post-deployment smoke-test result.

## 7. Smoke-test checklist (complete only after a real deployment)

- [ ] Production Branch / Branch Tracking is `develop`, not `main`.
- [ ] GitHub CI checks for the deployed commit have passed and the approved gate is verified.
- [ ] Public Vercel URL loads over HTTPS and maps to the expected Git commit.
- [ ] `/`, `/login`, `/products`, and representative protected routes load; direct URL entry and refresh do not give Vercel 404.
- [ ] An unknown route reaches the application's own not-found UI.
- [ ] Browser Network tab shows API calls to the approved Render HTTPS hostname, not localhost/AWS.
- [ ] Render `/api/health` responds; CORS from the exact Vercel origin succeeds.
- [ ] Approved test Customer can log in, load profile, catalogue, order history, and log out.
- [ ] Representative Staff/Admin role access and forbidden-route behavior are correct.
- [ ] Responsive desktop/mobile navigation, focus/keyboard behavior, and safe API error states are usable.
- [ ] PayHere test/sandbox redirects and relevant provider URLs are safe for verification; no live payments or uncontrolled messages.
- [ ] Existing dependency audit findings are triaged and accepted/remediated via the team's security process.
- [ ] Evidence captured and reviewed before marking Infra #10 Done.

## 8. Deployment failure and rollback

1. Identify the failing Vercel deployment and its commit SHA; inspect build logs, environment variable scope, and API/CORS responses without revealing secrets.
2. Distinguish a successful static build from failed Render API connectivity. If the API is down, do not report the integration as passing.
3. Use Vercel's deployment history to identify a previous verified deployment and use the authorized rollback/restore flow. Confirm that the restored deployment is actually serving users.
4. Re-run route, login, HTTPS, CORS, and API health smoke tests after rollback. Record the previous/new deployment identifiers and why rollback occurred.
5. Repair issues through a reviewed change targeting **`develop`**. Do **not** merge or push to `main` for this issue.

## 9. Evidence to add after deployment

| Item | Value / evidence |
| --- | --- |
| Vercel project and team | Pending - confirm in Vercel |
| Vercel Production Branch | `develop` - must verify in dashboard |
| Public frontend HTTPS URL | Pending - record actual URL |
| Render backend HTTPS base URL | Pending - record approved URL (non-secret) |
| Deployed frontend commit SHA | Pending |
| Required frontend CI checks | Pending - links/results |
| Deployment gate verification | Pending |
| Browser route and refresh tests | Pending |
| Auth/RBAC and API/CORS tests | Pending |
| Rollback reference and procedure tested | Pending |
| Security review sign-off | Pending |

Never put credentials, bearer tokens, database connection strings, or live test account passwords in the evidence record.

## 10. Documentation ownership

This document is owned by **infra #10**. The SPA routing configuration is owned by the linked frontend PR. Historical staging/AWS runbooks from infra #4/#9 remain available for past decisions but are not a substitute for evidence of the current Vercel + Render deployment. Update the approved SDS/architecture decision record separately if it still specifies AWS as the live deployment target.

# Secure staging environment baseline (infra #4)

## 1. Purpose and scope

The OSMS staging environment is a non-production environment for integration,
end-to-end, security, user-acceptance and smoke testing, and for controlled
university demonstrations. It must exercise production-like security controls
without using production resources or real production data.

This document defines the staging architecture, configuration and operating
contract. It does not prove that any cloud resource has been created or that a
deployment has completed.

The following work remains separate:

- Infra issue [#9](https://github.com/darshana-opticals-osms/infra/issues/9)
  owns the backend image/deployment workflow and AWS App Runner rollout.
- Frontend deployment automation is not part of infra #4.
- Production deployment and production DNS migration are not part of infra #4.

## 2. Approved architecture

The approved staging targets are:

| Concern | Staging target | Boundary |
| --- | --- | --- |
| Frontend | Dedicated Vercel staging or preview target | Must not use the live production domain or production-only secrets. |
| Backend | Dedicated AWS App Runner staging service | Runs the Dockerized Node/Express backend; deployment automation belongs to infra #9. |
| Image registry | Dedicated Amazon ECR repository or staging-scoped repository path | Store backend images under immutable commit-based tags. Do not store registry credentials in Git. |
| Database | Dedicated MongoDB Atlas staging database on a replica set or sharded cluster | Must support the transactions used by checkout and must not share a database with development or production. |
| CI | Existing GitHub Actions checks and a future approved deployment workflow | Passing CI is not deployment evidence. |

The current Dockerfiles and Docker Compose configuration remain local-development
foundations, not evidence of deployable staging artifacts. In particular, the
current backend Dockerfile starts `npm run dev`. Infra #9 must verify and review
the production-style image start command and App Runner behavior; infra #4 does
not change that Dockerfile or make a staging-readiness claim for it.

The intended request and artifact flow is:

```text
GitHub source and CI
        |
        +-- backend image --> Amazon ECR --> AWS App Runner staging service
        |                                           |
        |                                           +--> MongoDB Atlas staging
        |                                           +--> approved sandbox providers
        |
        +-- frontend build --> Vercel staging target
                                  |
                                  +-- HTTPS --> App Runner staging API
```

All browser-to-frontend and frontend-to-backend traffic must use HTTPS. Provider
callbacks must use approved staging HTTPS endpoints. Actual hosted URLs must be
recorded in the controlled deployment inventory after provisioning; this
repository does not invent or reserve them.

## 3. Environment isolation and naming

Development, staging and production are independent security and data
boundaries. They must use distinct:

- Vercel targets and public URLs;
- App Runner services and service roles;
- ECR image references or repository paths;
- Atlas databases, database users and connection strings;
- JWT secrets and external-provider credentials;
- payment callback URLs and notification recipients;
- test data, accounts, logs and deployment evidence.

Staging must never point to a development or production database, production
frontend/backend domain, live payment account, production notification list or
production chatbot credentials. Before each rollout, the operator must compare
the selected resource names with the environment inventory and stop if any
production identifier is present.

Use `staging` consistently in human-readable labels and resource names. Where a
provider permits these forms, use:

| Resource | Naming convention |
| --- | --- |
| GitHub environment | `staging` |
| AWS/ECR/App Runner resources | `osms-staging-<component>` |
| Atlas database | `osms-staging` |
| Vercel project/alias label | `osms-staging-<component>` |
| Immutable backend image tag | Approved Git commit SHA |

Provider naming constraints may require punctuation changes, but the `osms` and
`staging` identifiers must remain unambiguous. Production aliases such as
`latest`, live domains and unqualified mutable image references are not valid
staging deployment evidence.

## 4. Resource ownership

Roles below describe responsibilities, not named individuals.

| Role | Responsibility |
| --- | --- |
| Vercel frontend owner | Creates the dedicated staging target, configures build variables and HTTPS, and records the resulting staging origin. |
| AWS platform owner | Owns staging IAM, ECR and App Runner resources, image access, service configuration and operational logs. |
| MongoDB Atlas operator | Creates the isolated staging database and least-privilege users, verifies transaction support, and controls network access. |
| GitHub environment administrator | Protects the `staging` environment and manages environment-scoped secrets and approvals. |
| Payment provider owner | Creates and verifies PayHere sandbox credentials and staging callback registrations. |
| Media/chatbot/notification provider owners | Maintain staging-separated configuration, quotas, recipients and access. |
| QA reviewer | Confirms synthetic data, canonical role coverage and redacted validation evidence before acceptance. |

No operator should copy a credential into an issue, pull request, build log,
README or evidence attachment. AWS services should use scoped IAM roles rather
than long-lived AWS access keys in application configuration.

## 5. Deployment configuration contract

The values in this section are names and rules, not a deployable environment
template. Phase 2 owns any future staging example file.

### Public and non-secret configuration

| Name | Consumer | Staging rule |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Frontend build | Exact approved App Runner/custom staging HTTPS API base, including `/api`; never localhost or production. |
| `NODE_ENV` | Backend | Exactly `production`; see the runtime-mode section. |
| `PORT` | Backend/App Runner | Use the port supplied/configured for the App Runner service and container. |
| `JWT_EXPIRES_IN` | Backend | Approved token lifetime; this is not the signing secret. |
| `FRONTEND_ORIGIN` | Backend CORS | Exact approved Vercel staging origin. No wildcard, localhost or production origin. |
| `FRONTEND_URL` | Backend-generated links | Exact approved Vercel staging origin. |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | Backend | Preserve approved rate limiting. |
| `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX` | Backend | Preserve the stricter authentication limit. |
| `REQUEST_BODY_LIMIT` | Backend | Preserve the approved request-body limit. |
| `CHATBOT_RATE_LIMIT_WINDOW_MS`, `CHATBOT_RATE_LIMIT_MAX`, `CHATBOT_TIMEOUT_MS` | Backend | Preserve bounded chatbot use and provider timeout. |
| `GEMINI_MODEL` | Backend | Approved staging model identifier. |
| `PAYMENT_CURRENCY` | Backend | `LKR`. |
| `PAYHERE_MODE` | Backend | Exactly `sandbox`. |
| `PAYHERE_RETURN_URL`, `PAYHERE_CANCEL_URL` | Backend | Approved Vercel staging HTTPS routes. |
| `PAYHERE_NOTIFY_URL` | Backend/provider | Approved staging backend HTTPS callback route. |
| `PAYHERE_NOTIFY_RATE_LIMIT_WINDOW_MS`, `PAYHERE_NOTIFY_RATE_LIMIT_MAX`, `PAYHERE_RETRIEVAL_TIMEOUT_MS` | Backend | Preserve bounded callback and retrieval behavior. |
| `SMTP_PORT`, `SMTP_SECURE`, `EMAIL_FROM`, `SES_FROM_EMAIL` | Backend | Configure only after notification safety approval; sender identities must be non-production or approved for staging. |
| `TRACKING_PORTAL_BASE_URL` | Backend | Exact approved Vercel staging origin. |
| `ONLINE_FULFILLMENT_BRANCH_CODE` | Backend | Controlled fictional/staging branch identifier approved by QA. |
| `CLOUDINARY_CLOUD_NAME` | Backend | Staging-separated Cloudinary account/cloud identifier. |
| `OSMS_TARGET_DATABASE` | TTL job | Exact Atlas staging database selected by `MONGODB_URI`; see the infra #7 runbook. |
| `OSMS_CHATBOT_INDEX_MODE` | TTL job | Explicit `apply`, `verify` or isolated `smoke` mode as required by the infra #7 runbook. |

`VITE_API_BASE_URL` and `FRONTEND_ORIGIN` are complementary and must be reviewed
together: the first tells the browser where to send API requests, and the second
tells the backend which exact browser origin may make credentialed cross-origin
requests. Their approved values must be exact HTTPS origins recorded by the
operators. Wildcards and guessed hosted URLs are prohibited.

The backend selects its database from `MONGODB_URI`. `MONGODB_DATABASE` is an
existing local Infra/Compose input that is passed to the one-shot index gate as
`OSMS_TARGET_DATABASE`; a managed staging index job must set
`OSMS_TARGET_DATABASE` explicitly to the same database selected by its secret
`MONGODB_URI`. None of these names authorizes sharing a database across
environments.

### Deployment secrets

| Name | Purpose and storage rule |
| --- | --- |
| `MONGODB_URI` | Atlas staging connection string; store in App Runner/approved secret management and inject separately into the TTL job. Never log it. |
| `JWT_SECRET` | Staging-only signing secret generated with approved entropy; never reuse development or production values. |
| `GEMINI_API_KEY` | Staging-specific chatbot provider key with controlled quota. |
| `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credentials for the staging-separated media account/configuration. |
| `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET` | PayHere sandbox credentials only. |
| `PAYHERE_API_APP_ID`, `PAYHERE_API_APP_SECRET` | Optional read-only retrieval API credentials for the same sandbox account. |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Keep absent until a controlled staging notification provider and recipient policy are approved. Treat all connection details as restricted. |

GitHub Actions, Vercel and AWS/App Runner must receive only the secrets they
consume. Atlas and provider administration credentials must remain with their
operators and must not become application runtime secrets. The runtime database
user must not be granted index-management privileges solely for deployment.

## 6. Staging runtime mode

The backend configuration accepts only `development`, `test` and `production`.
Staging must therefore run with:

```text
NODE_ENV=production
PAYHERE_MODE=sandbox
```

`production` selects production-like Node/Express behavior, including safe error
responses. It does not classify the deployment as the live production
environment. Staging classification comes from the dedicated Vercel, AWS, Atlas,
GitHub and provider resource boundary described here.

Do not set `NODE_ENV=staging`, weaken backend validation or change application
business behavior for this baseline. Because `NODE_ENV=production` permits the
backend's live PayHere mode, the staging configuration and deployment review
must explicitly enforce `PAYHERE_MODE=sandbox`.

## 7. Security baseline

- JWT authentication and existing authorization middleware remain enabled.
- Preserve the canonical roles `SYSTEM_ADMIN`, `BRANCH_MANAGER`, `OPTOMETRIST`,
  `BRANCH_ASSISTANT` and `CUSTOMER`; do not introduce aliases or retired roles.
- Configure `FRONTEND_ORIGIN` to the one exact approved HTTPS frontend origin,
  or an explicitly reviewed comma-separated set if Vercel requires more than one
  stable staging origin. Never use wildcard CORS.
- Do not enable debug authentication, mock authorization, test-mode middleware
  bypasses or development error output.
- Store secrets only in the approved GitHub/platform secret mechanisms. Use
  least-privilege access and environment-scoped approvals.
- Use synthetic, fictional or approved anonymized data only. Real Customer,
  Patient, Prescription, Payment or Sales records are prohibited.
- Do not expose credentials or sensitive data in health responses, logs, build
  output, screenshots or issue/PR evidence.

## 8. Provider safety

### PayHere

Use PayHere sandbox credentials and sandbox checkout only. Return and cancel URLs
must resolve to the staging frontend, and the notification URL must resolve to
the staging backend. Test instruments must not create a real financial charge.
The payment provider owner must verify the registered callbacks before checkout
smoke testing.

### Cloudinary

Use a staging-separated account, sub-account or approved environment boundary.
Do not reuse production write credentials. Only synthetic test images may be
uploaded, and evidence must not disclose signed requests or credential values.

### Chatbot

Use a staging-specific `GEMINI_API_KEY`, an approved model and controlled quota.
Prompts and evidence must use fictional content and must not include Customer
PII, clinical/payment data, provider payloads, JWTs or conversation transcripts.
The usage-retention index is a separate readiness prerequisite described below.

### Notifications

Notification delivery is disabled by default until the provider owner approves
a controlled staging provider, verified sender and controlled non-production
recipients. Under the required `NODE_ENV=production`, missing SMTP configuration
does not simulate successful delivery; delivery is expected to fail safely.

The existing `STAGING_NOTIFICATION_RECIPIENT` branch depends on
`NODE_ENV=staging`, which the backend configuration does not accept. Operators
must not rely on that redirect for safety. Enabling real delivery or changing
recipient behavior requires separate authorization, backend review and a safety
verification showing that no message can reach an uncontrolled real customer.

## 9. Staging data and accounts

Only fictional, generated or explicitly approved anonymized test data may enter
staging. Copying production data is prohibited unless a separately approved data
governance process proves that every sensitive and identifying field has been
removed; no such approval is claimed here.

Staging uses `NODE_ENV=production`, so the backend production-mode safeguard that
prohibits the development seed routine must remain intact. Do not weaken or
bypass it. QA and the relevant account administrator must instead use a reviewed,
non-destructive procedure to create controlled test accounts and synthetic data.

The controlled account inventory must cover these canonical roles where required
for UAT:

- `SYSTEM_ADMIN`
- `BRANCH_MANAGER`
- `OPTOMETRIST`
- `BRANCH_ASSISTANT`
- `CUSTOMER`

Record account purpose, owner, role and expiry/rotation status in a restricted
test-account inventory. Never record passwords, reset tokens, JWTs or real person
details in this document, GitHub or deployment evidence.

Audit records must remain in the dedicated staging database. Testers must verify
audit behavior using only controlled test identities and must not export audit
records containing sensitive values into public evidence.

## 10. Health, logs and troubleshooting

### Health and readiness

The backend exposes `GET /api/health`, returning only a service status and service
name. The backend connects to MongoDB before opening its HTTP listener, so an
initial database connection failure prevents normal startup.

The current health endpoint does not query ongoing database availability. A
database outage after startup may therefore leave the endpoint returning HTTP
200. Record this limitation in the App Runner health configuration and incident
procedure. A new readiness endpoint or business-code change is not part of infra
#4 and requires separate backend approval.

### Log boundary

App Runner, provider and deployment logs must be accessible only to authorized
operators. Logs and evidence must not contain:

- passwords, database URIs or cloud/provider credentials;
- JWTs, password-reset tokens or cryptographic hashes;
- Customer or staff PII;
- prescription or other clinical data;
- payment payloads, merchant secrets or callback hashes;
- chatbot messages, provider payloads or API keys.

Use UTC timestamps, deployment commit/image tag, environment name, safe error
codes and non-sensitive resource identifiers for correlation. Apply provider log
retention and access policies approved for staging.

### Diagnostic procedure

1. **Image/startup failure:** AWS platform owner verifies the immutable ECR image
   reference, App Runner pull/service role, container start command and configured
   port. Image work and redeployment remain under infra #9.
2. **Configuration failure:** AWS or Vercel owner compares required variable names
   against this contract without printing values. Confirm `NODE_ENV=production`,
   `PAYHERE_MODE=sandbox` and environment-scoped secret selection.
3. **Database failure:** Atlas operator verifies the staging database name,
   network policy, transaction-capable topology and runtime-user permissions.
   Never paste the connection string into logs or tickets.
4. **CORS failure:** Vercel and AWS owners compare the browser's exact HTTPS
   origin with `FRONTEND_ORIGIN` and compare `VITE_API_BASE_URL` with the staging
   backend API base. Do not temporarily use `*`.
5. **Health failure:** AWS owner checks App Runner events and safe application
   startup logs, then confirms the configured `/api/health` path and port.
6. **Provider failure:** The responsible provider owner verifies environment,
   account, callback, quota and sandbox mode. Keep the provider disabled if its
   safety boundary is uncertain.
7. **TTL/index failure:** Atlas/index operator follows the existing infra #7
   runbook; a nonzero apply or verification result blocks readiness.

The responsible owner corrects configuration through the relevant platform and
reruns validation. This baseline defines no automatic rollback. Recovery must
not switch staging to development or production resources.

## 11. Manual setup procedure

These are controlled preparation steps, not claims of completed provisioning.

1. Approve the staging resource names, AWS region/account boundary, intended
   origins and the owners listed above. Create the protected GitHub `staging`
   environment without adding values to source control.
2. Atlas operator creates or selects a dedicated staging project/cluster and
   `osms-staging` database on a transaction-capable topology. Create separate
   least-privilege runtime and index-management users and restrict network access.
3. AWS owner creates the staging-scoped ECR repository/path and IAM permissions.
   Use immutable commit-SHA image tags. Building and deploying the backend image
   is performed only through the separately reviewed infra #9 procedure.
4. Index operator provisions and verifies the chatbot usage indexes against the
   exact staging database by following `docs/chatbot-usage-ttl.md`. Do not grant
   its DDL privileges to the normal application user by default.
5. Under infra #9, AWS owner configures the App Runner staging service, injects
   non-secret configuration and approved secrets, and configures `/api/health`.
6. Vercel owner creates the dedicated staging/preview target, configures
   `VITE_API_BASE_URL`, enables HTTPS and records the exact frontend origin. AWS
   owner then sets `FRONTEND_ORIGIN` and `FRONTEND_URL` to that approved origin.
7. Provider owners configure PayHere sandbox and any approved staging-separated
   media/chatbot services. Notifications remain disabled until their additional
   safety approval is recorded.
8. QA creates controlled fictional accounts/data and performs the verification
   checklist in order: isolation and secrets, database/TTL, backend health,
   frontend/API/CORS, authentication/RBAC, providers, audit and logs.

Do not substitute manual console setup screenshots for a future reviewed
deployment workflow. Do not put console-exported secrets into GitHub evidence.

## 12. Existing chatbot TTL dependency

Infra issue [#7](https://github.com/darshana-opticals-osms/infra/issues/7) already
provides the chatbot usage index script, tests, CI checks and operational
[TTL rollout checklist](chatbot-usage-ttl.md). Do not duplicate that logic.

Before the staging backend is declared ready, an authorized index operator must
run the existing apply and verify procedure against the exact staging database
with the dedicated index-management credential. The required TTL definition is
the single-field `{ expiresAt: 1 }` index with `expireAfterSeconds: 0`; logical
expiry remains a backend responsibility independent of MongoDB's asynchronous
physical deletion.

Any physical TTL smoke test must use the separate empty database and bounded,
synthetic procedure required by the existing runbook. A local or CI pass is not
evidence that the staging index has been provisioned.

## 13. Verification and evidence checklist

The documented contract and completed operational evidence are different. At the
time this baseline was written, no external resource or deployment was verified.

| Verification | Required redacted evidence | Current status |
| --- | --- | --- |
| Development/staging/production separation | Resource inventory showing distinct non-secret names and environments | PENDING / NOT VERIFIED |
| Vercel staging target and HTTPS | Project/environment name, approved origin and TLS result; no tokens | PENDING / NOT VERIFIED |
| ECR and immutable image reference | Repository/path, commit-derived tag and image digest; no registry credentials | PENDING / NOT VERIFIED |
| App Runner staging service | Service/environment name, deployed image digest and revision time | PENDING / NOT VERIFIED |
| Atlas staging database and transactions | Project/cluster/database identifiers and successful synthetic transaction result; no URI/data | PENDING / NOT VERIFIED |
| Runtime/index least privilege | Redacted role/permission summary and reviewer approval | PENDING / NOT VERIFIED |
| Environment configuration and secrets | Variable-name checklist, secret-store locations and reviewer result; never values | PENDING / NOT VERIFIED |
| HTTPS API and exact CORS | Allowed-origin success and unrelated-origin rejection with sanitized headers | PENDING / NOT VERIFIED |
| JWT and canonical RBAC | Authentication plus allowed/denied checks for the five controlled roles | PENDING / NOT VERIFIED |
| Health and failed startup | Sanitized `/api/health` response and evidence that initial DB failure is not healthy | PENDING / NOT VERIFIED |
| PayHere sandbox | Sandbox mode/account label and staging callback verification; no merchant credentials | PENDING / NOT VERIFIED |
| Notification safety | Proof delivery is disabled or restricted to approved test recipients/provider | PENDING / NOT VERIFIED |
| Cloudinary/chatbot separation | Staging account/configuration identifiers and synthetic test results; no keys or prompts | PENDING / NOT VERIFIED |
| Test data and audit isolation | QA attestation that data/accounts are fictional and audit records remain in staging | PENDING / NOT VERIFIED |
| Safe logs and diagnostics | Reviewer checklist using sanitized log samples, with no PII or secrets | PENDING / NOT VERIFIED |
| Chatbot TTL readiness | Redacted apply/verify output and isolated smoke-test result required by the infra #7 runbook | PENDING / NOT VERIFIED |

Evidence must identify the `staging` environment, reviewed commit/image digest,
UTC verification time, responsible role and outcome. Operators must redact
credentials, connection strings, authorization headers, Customer records and
provider payloads. A failed or missing check remains `PENDING / NOT VERIFIED` and
must not be reported as passed.

## 14. Scope and limitations

This baseline intentionally does not provide:

- a frontend deployment pipeline;
- App Runner deployment automation or the complete infra #9 rollout;
- production deployment or production DNS migration;
- changes to backend/frontend business behavior;
- changes to Dockerfiles or local Docker Compose;
- new chatbot TTL scripts, tests or deployment mechanisms;
- automatic rollback;
- Terraform, CloudFormation, Pulumi or another new IaC framework.

The exact approved SDS Chapter 7 and SRS non-functional-requirement text was not
machine-readable in the implementation environment and is **NOT VERIFIED** by
this document. This baseline follows infra #4's documented SDS/SRS mapping,
accepted ADRs and verified application configuration; it does not invent missing
SDS or SRS wording.

Source basis: [infra #4](https://github.com/darshana-opticals-osms/infra/issues/4),
[ADR-002](https://github.com/darshana-opticals-osms/documents/blob/develop/adr/ADR-002-rbac-role-model.md),
[ADR-008](https://github.com/darshana-opticals-osms/documents/blob/develop/adr/ADR-008-inventory-image-upload-cloudinary.md),
[ADR-010](https://github.com/darshana-opticals-osms/documents/blob/develop/adr/ADR-010-ai-chatbot-architecture-and-knowledge-strategy.md),
[ADR-011](https://github.com/darshana-opticals-osms/documents/blob/develop/adr/ADR-011-secure-payment-gateway-integration.md),
[ADR-012](https://github.com/darshana-opticals-osms/documents/blob/develop/adr/ADR-012-immutable-audit-trail-architecture.md)
and
[ADR-013](https://github.com/darshana-opticals-osms/documents/blob/develop/adr/ADR-013-order-status-notification-policy.md).
# Darshana Opticals OSMS — Final Live System Demonstration Plan

**Tracking issue:** [DDP-091 — infra#13](https://github.com/darshana-opticals-osms/infra/issues/13)  
**Prepared:** 25 October 2026  
**Prepared by:** [Team Member / Team Name]  
**Status:** Prepared for team assignment and rehearsal  
**Supporting document:** [Final UAT Report](uat-report.md)

## 1. Purpose and demonstration strategy

The final demonstration will present the major OSMS features, role-based business processes, system architecture, and testing evidence to the university lecturers. The team will use the actual deployed application wherever the workflow has been verified and the successfully tested localhost environment for the PayHere Sandbox payment demonstration.

**Agreed demonstration strategy:**

- **Hosted environment (Vercel + Render + MongoDB Atlas):** Present the complete verified Customer, Branch Assistant, Branch Manager, Optometrist, System Administrator, and cross-role workflows.
- **Localhost:** Present a genuine successful PayHere Sandbox payment transaction using the team's previously tested local configuration.
- **Explanation:** Clearly identify the hosted payment domain-registration limitation, and explain the plan to obtain a suitable custom domain and complete PayHere configuration after client approval.

The team reports that this approach is acceptable for the university demonstration. It does not mean that the hosted PayHere payment flow has passed or that the client has approved the final production deployment.

## 2. System environment and architecture

| Layer | Technology / environment | Purpose |
|---|---|---|
| Frontend | React/Vite deployed on Vercel | Customer and Staff/Admin user interfaces |
| Backend | Node.js/Express deployed on Render | Business logic, REST APIs, authentication, authorization, payment integration |
| Database | MongoDB Atlas | Persistent application data |
| Payment gateway | PayHere Sandbox | Payment demonstrations and non-production verification |
| Local development/demo | Localhost frontend and configured backend environment | Previously verified PayHere Sandbox flow |
| Version control and CI/CD | GitHub repositories and GitHub Actions | Change review, automated quality checks, deployment evidence |

**Deployed frontend:** https://darshana-opticals.vercel.app  
**Backend:** https://osms-backend-staging.onrender.com  
**Health check:** https://osms-backend-staging.onrender.com/api/health

The deployed backend hostname includes `staging`; it is the actual Render service used by this deployment, not proof of a separate staging database. Use fictional accounts and data only, and never show real credentials, merchant secrets, or private clinical information.

## 3. Team member responsibilities

Replace each placeholder with the agreed actual presenter and amend the responsibilities if your team decides on a different division.

| Presenter | Team member name | Main responsibility | Demo preparation |
|---|---|---|---|
| Member 1 | **[Full name]** | Project introduction, objectives, scope, and architecture | Introduction and system diagram |
| Member 2 | **[Full name]** | Customer portal, catalogue, cart, orders, loyalty, and appointment booking | Fictional Customer account and customer test data |
| Member 3 | **[Full name]** | Branch Assistant, Branch Manager, inventory, reporting, Doctor Sessions, and appointments | Authorized staff accounts and sample data |
| Member 4 | **[Full name]** | Optometrist, System Admin, localhost payment demonstration, testing, deployment, and conclusion | Clinical/admin accounts, payment setup, UAT/CI evidence |

**Team Leader:** Kavindu Amalka  
**Question-and-answer coordination:** All four members.

## 4. Demonstration sequence

**Proposed duration:** Approximately 18–20 minutes, subject to the lecturers' allocated presentation time. Adjust during rehearsal.

| Step | Approximate duration  | Demonstration activity | Environment |
|---|---:|---|---|---|
| 1 | 1 min  | Introduce Darshana Opticals OSMS, problem statement, users, and goals | Presentation |
| 2 | 2 min | Explain React/Vite, Express, MongoDB Atlas, role-based access, Vercel, and Render | Architecture diagram + deployed health check |
| 3 | 3 min  | Customer login, catalogue, product filtering, cart, order history, profile, appointments, and loyalty | **Hosted Vercel frontend** |
| 4 | 3 min | Branch Assistant Doctor Sessions, appointment management, staff orders; Branch Manager inventory, stock, alerts, and reports | **Hosted Vercel frontend** |
| 5 | 2 min | Optometrist creates prescription; Customer history; Admin Staff and Doctor management | **Hosted Vercel frontend** |
| 6 | 3 min  | Run PayHere Sandbox payment through the previously verified local setup and show genuine result evidence | **Localhost — explicitly identified** |
| 7 | 2 min | Explain the hosted PayHere domain limitation and the planned custom-domain solution after client approval | Explanation + evidence |
| 8 | 2 min | Summarize UAT, security, CI/CD, limitations, future work, and conclusion | Evidence / slides |
| 9 | 2 min | Transition and question buffer | As needed |

**Important:** The payment demonstration must be performed in a real configured Sandbox environment, not a mocked success page. If its actual outcome differs from the rehearsal, explain the result accurately and use clearly labelled previous evidence.

## 5. Payment gateway explanation for lecturers

### Current deployment limitation

Our OSMS frontend is hosted on Vercel's free tier under the Vercel-provided subdomain `darshana-opticals.vercel.app`. During PayHere Sandbox website-domain setup, the merchant portal rejected registration of this subdomain as a website integration. Therefore, we could not complete the required domain authorization for the current hosted frontend, and payment completion from that origin remains pending verification.

### What has already been verified

The team previously performed successful PayHere Sandbox payment testing using localhost. This verifies the payment workflow in the tested local configuration. The other OSMS application workflows have been tested successfully in the hosted environment.

### University demonstration arrangement

Following the project team's discussion, we will demonstrate the main application through the hosted Vercel and Render deployment and the PayHere Sandbox transaction through localhost. The team reports that this arrangement is acceptable for the university assessment. We will identify the two environments clearly and will not claim that the hosted checkout has already passed.

### Future solution after client approval

When the client approves the deployment, the team plans to purchase or obtain a suitable custom domain, connect it to the Vercel-hosted application, register that domain through the correct PayHere website integration, update the necessary payment/callback configuration, and test the full hosted payment and backend-confirmed order flow before final client acceptance.

## 6. Pre-demonstration readiness checklist

### Hosted system

- [ ] Confirm the deployed Vercel frontend is reachable.
- [ ] Confirm the Render backend health endpoint responds.
- [ ] Prepare fictional accounts for all five roles.
- [ ] Prepare products, stock, orders, appointments, Doctor Sessions, prescriptions, and reports.
- [ ] Verify the 21 reported hosted functional UAT scenarios using the linked evidence.
- [ ] Keep test data and sensitive credentials separate from any projected screen or submitted document.

### Localhost payment demonstration

- [ ] Confirm the local OSMS environment starts correctly and its payment settings correspond to the tested Sandbox integration.
- [ ] Confirm the correct Sandbox merchant/domain configuration is being used; do not expose the merchant secret.
- [ ] Perform a complete localhost payment rehearsal with test data.
- [ ] Prepare a genuinely successful transaction record or sanitized screenshot as backup.
- [ ] If claiming backend payment completion, confirm the actual backend-verified notification and order state, not only the PayHere browser result.
- [ ] Prepare a concise explanation of the Vercel subdomain-registration issue and planned custom-domain change.

### Presentation and evidence

- [ ] Replace all four member name placeholders and confirm speaker handoffs.
- [ ] Prepare final SRS and SDS/architecture references.
- [ ] Prepare UAT, integration testing, security, performance, and CI/CD evidence links.
- [ ] Conduct a full four-member rehearsal and record timing.
- [ ] Confirm the lecturers' presentation time limit.
- [ ] Obtain/record the Team Leader's final readiness acknowledgment.

**Rehearsal date:** [25/10/2026]  
**Participants:** Kavindu, Sandaru, Hiruni, Sachini 
**Actual duration:** [1 hr]  
**Rehearsal result:** Pass
**Demo readiness decision:** Ready 

## 7. Contingency arrangements

| Risk | Planned response |
|---|---|
| Slow Render service | Open health endpoint in advance and prepare timestamped screenshots of previously verified workflows |
| Hosted app network failure | Use pre-recorded or screenshot evidence, clearly labelled as such, without claiming it is live |
| Missing demonstration data | Use another prevalidated fictional record; do not alter private customer records |
| PayHere localhost network or Sandbox error during presentation | Retry only if safe; present genuine earlier test evidence and accurately explain live outcome |
| Confusion between localhost and deployed payment results | Announce the environment before payment begins and refer to the UAT environment comparison |
| Team member unavailability | Assigned backup presenter follows the prepared script |


## 8. Evidence and references

- [DDP-091 UAT issue](https://github.com/darshana-opticals-osms/infra/issues/13)
- [Final UAT Report](uat-report.md)
- [Final Release Checklist](../release/release-checklist.md)
- [Final Release Manifest](../release/release-manifest.md)
- [Hosted OSMS frontend](https://darshana-opticals.vercel.app)
- [Render backend health](https://osms-backend-staging.onrender.com/api/health)


## 9. Final readiness and completion

The university demonstration will use the **hosted application for all verified non-payment workflows** and the **locally verified PayHere Sandbox integration for payment**. The team will openly distinguish these environments. After client approval and custom-domain setup, the hosted payment verification will be completed separately.



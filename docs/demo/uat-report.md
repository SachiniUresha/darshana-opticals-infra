# Darshana Opticals OSMS — Final User Acceptance Testing (UAT) Report

**Tracking issue:** [DDP-091 — infra#13](https://github.com/darshana-opticals-osms/infra/issues/13)  
**Prepared:** 25 October 2026  
**Prepared by:** Sandaru Mihiran 
**Project:** Darshana Opticals Optical Shop Management System (OSMS)  
**Testing type:** Team-conducted User Acceptance Testing (UAT)  
**Report status:** Final draft — complete tester dates and evidence links before sign-off  
**Academic demonstration arrangement:** Hosted application for completed workflows; localhost for PayHere Sandbox payment demonstration

> **Accuracy note:** This report distinguishes the locally verified payment workflow from the hosted payment flow awaiting final domain configuration. Team-conducted UAT and acceptance of a university demonstration approach do not, by themselves, establish formal client approval.

## 1. Introduction and objectives

The purpose of this report is to document the final UAT of Darshana Opticals OSMS against the approved functional requirements and role-based business workflows. Testing covered the Customer, Branch Assistant, Branch Manager, Optometrist, and System Administrator roles, including cross-role integration, input validation, access control, and negative scenarios.

The team confirms that the completed functional workflows were tested successfully. The PayHere Sandbox payment workflow was also successfully tested through localhost. The remaining activity is to complete PayHere website-domain configuration and verify payments through the publicly hosted frontend after the appropriate custom domain becomes available.

## 2. Testing environments

| Component | Current setup | Verification scope |
|---|---|---|
| Hosted frontend | [darshana-opticals.vercel.app](https://darshana-opticals.vercel.app) on Vercel's free hosting tier | Hosted Customer, Staff, Admin, clinical, inventory, appointment, reporting, and other non-payment workflows |
| Hosted backend | [osms-backend-staging.onrender.com](https://osms-backend-staging.onrender.com) on Render | Connected backend APIs and business operations |
| Database | MongoDB Atlas | Application data accessed through the backend |
| Payment provider | PayHere Sandbox | Test payments only; no real-money transactions |
| Localhost environment | Locally running OSMS configured for PayHere Sandbox | Successful Sandbox payment workflow testing and planned payment demonstration |
| Test accounts | Fictional test users for all five roles | Role-specific end-to-end and negative UAT |

**Health endpoint:** [Render backend health](https://osms-backend-staging.onrender.com/api/health). The word `staging` in the backend hostname does not imply a separate staging database.



## 3. UAT results summary

| Environment / result | Number of consolidated scenarios | Outcome |
|---|---:|---|
| Hosted OSMS — PASS | **21** | Functional, role-based, cross-role, and negative scenarios completed successfully as reported by the testing team |
| Hosted OSMS — FAIL | **0** | No other unresolved functional failures reported by the team |
| Hosted OSMS — Pending final verification | **1** | PayHere payment through the Vercel subdomain |
| **Total consolidated UAT scenarios** | **22** | **21 hosted PASS; 1 hosted payment pending** |
| Localhost PayHere Sandbox payment | **Separate successful verification** | **PASS in localhost; not counted as hosted PASS** |

**Interpretation:** The same payment feature has two different environment-specific findings: it works in the tested localhost setup, while completion via the hosted frontend is pending. The localhost result does not certify the hosted payment flow.

## 4. Consolidated UAT test case register

**General preconditions:** Use a valid fictional test account for the listed role, prepared sample records, and the correct deployment environment.  
**Expected outcome:** The workflow succeeds according to approved system requirements, persists appropriate changes, and applies backend authorization and validation.  
**Actual outcome convention:** `Expected behaviour observed` is the team's reported result and should be supported by a date, tester, and evidence link in the last column.

| ID | SRS reference / role | Scenario and expected outcome | Actual outcome / environment | Status | Tester / date / evidence |
|---|---|---|---|---|---|
| UAT-01 | FR-001 · Customer | Register, log in, update profile and log out; details persist correctly | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-02 | FR-003 · Customer | View catalogue, search/filter, and inspect product details | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-03 | FR-004, FR-005 · Customer | Add/update/remove cart items, validate totals and create an order | Expected behaviour observed · Hosted (excluding gateway completion) | PASS | [Fill] |
| UAT-04 | FR-009 · Customer | Complete Sandbox payment and confirm payment/order status via hosted frontend | Localhost payment tested successfully; hosted payment requires final domain configuration | **Pending — Hosted** | Local evidence [link]; hosted retest [pending] |
| UAT-05 | FR-014 · Customer | View personal order history and tracking | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-06 | FR-007 · Customer | Book a Doctor Session and view appointment history | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-07 | FR-002 · Customer | View authorized prescription history | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-08 | FR-010 · Customer | View supported loyalty details and history | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-09 | FR-011 · Customer | Use chatbot and verify supported feedback/fallback states | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-10 | FR-007 · Branch Assistant | Select Doctor, create Doctor Session, manage and reschedule appointments | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-11 | FR-014 · Branch Assistant | View and update authorized staff order tracking | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-12 | FR-005, FR-006 · Branch Manager | Manage products/stock and review reorder alerts | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-13 | FR-012 · Branch Manager | Review authorized sales/inventory reports and supported exports | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-14 | FR-013 · Optometrist | Find Customer and record a prescription accurately | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-15 | FR-001, ADR-002 · System Admin | Manage Staff/Doctor records and activation status | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-16 | FR-007 · Cross-role | Admin creates Doctor → Assistant creates Session → Customer books | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-17 | FR-013, FR-002 · Cross-role | Optometrist records prescription → Customer views history | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-18 | FR-014 · Cross-role | Authorized Staff can track Customer orders | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-19 | FR-001, ADR-002 · Negative / RBAC | Invalid login, revoked/deactivated access and unauthorized operations are rejected | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-20 | FR-004, FR-005 · Negative | Invalid input and insufficient stock are handled safely | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-21 | FR-007 · Negative | Invalid/unavailable appointment actions are rejected appropriately | Expected behaviour observed · Hosted | PASS | [Fill] |
| UAT-22 | FR-003, FR-012 · Negative | Empty catalogue, search, and report results are handled safely | Expected behaviour observed · Hosted | PASS | [Fill] |

These are **22 consolidated scenarios**, not necessarily the complete number of individual tests in the separate detailed test register. Include the corresponding DDP-087 case ID or screenshot where available. Do not invent timestamps or tester identities.

## 5. PayHere integration: findings and deployment clarification

### 5.1 What was successfully tested

The team successfully tested the PayHere Sandbox payment workflow in its localhost configuration. The available successful local test result demonstrates that the payment flow can operate in the locally configured environment. Attach the relevant test and payment evidence, and verify the saved order/payment state if it is included in the claimed test outcome.

### 5.2 Why the hosted payment flow is pending

The frontend currently uses the free Vercel-provided subdomain `darshana-opticals.vercel.app`. During PayHere Sandbox website-domain integration setup, the merchant portal rejected registration of this subdomain, displaying a domain-validation restriction. This prevents the team from completing the intended website-domain authorization for the current hosted frontend. The deployed payment flow has therefore **not** been marked PASS.

This limitation is specific to the current PayHere website-domain registration attempt and deployment configuration. It does not mean the Vercel platform universally prohibits custom domains, or that every PayHere subdomain is necessarily unsupported. All other hosted UAT workflows have been reported as successful.

### 5.3 Agreed university demonstration approach

Following the team discussion, the agreed academic demonstration approach is:

1. Demonstrate the completed Customer, Staff, Optometrist, Admin, and cross-role workflows using the **deployed Vercel frontend with the Render backend**.
2. Demonstrate a genuine successful **PayHere Sandbox payment in localhost**, using the previously verified local configuration.
3. Explain the difference between the local payment result and the remaining hosted domain-integration work, without presenting the hosted checkout as successful.



### 5.4 Planned client deployment completion

After obtaining the client's approval, the team plans to:

1. Obtain an appropriate custom domain for the client-facing system.
2. Configure and verify ownership of the custom domain in Vercel.
3. Register the corresponding website domain in the PayHere merchant portal and use the correct credentials for that integration.
4. Review necessary frontend origins, backend URLs, payment return/cancel paths, and public PayHere notification endpoint configuration.
5. Re-run a genuine end-to-end hosted Sandbox payment and verify the backend-confirmed order/payment state before classifying the hosted payment as PASS.

**Current hosted payment status:** **Pending final verification.** This is a documented deployment-integration activity; no production payment acceptance is claimed yet.

## 6. Cross-role outcomes and feedback

- **Customer journey:** The team reports successful registration, profile management, catalogue, cart, appointment, order tracking, loyalty, and related scenarios, excluding hosted PayHere completion.
- **Branch operations:** Doctor Sessions, appointments, order tracking, inventory, stock, and reporting were exercised successfully.
- **Clinical workflow:** Optometrist prescription creation and the Customer's authorized prescription history were verified.
- **Administrative workflow:** Creating and deactivating Staff and Doctor records, and the resulting access changes, were verified.
- **Negative testing:** Invalid login, authorization restrictions, invalid input, unavailable appointment actions, and empty-state handling were tested successfully.

**Tester / reviewer feedback:** [Record actual tester names, feedback, date, and relevant screenshots.]  
**Team Leader discussion/decision:** The team has agreed to use the hosted system for the main demonstration and localhost for the successfully tested Sandbox payment workflow.  
**Formal client sign-off:** [Pending / insert approved evidence when obtained].

## 7. Evidence and traceability

| Evidence type | Reference |
|---|---|
| Deployed frontend and backend evidence | [Vercel deployment] · [Render deployment] · [health check] |
| UAT evidence for the 21 hosted scenarios | [UAT screenshots / test case register] |
| Localhost successful PayHere Sandbox payment | [Local payment screenshot / gateway record / validated order record] |
| PayHere hosted domain registration limitation | [Sanitized screenshot of merchant portal message] |
| End-to-end testing (DDP-084) | [Report or PR link] |
| Security sweep (DDP-085) | [Report or PR link] |
| Performance/reliability (DDP-086) | [Report or PR link] |
| Detailed test register (DDP-087) | [Test case register link] |
| University demonstration arrangement | [Meeting note / lecturer confirmation if available] |
| Final demonstration plan | [demo-plan.md](demo-plan.md) |

## 8. Conclusion and sign-off

The OSMS team reports that all **21 consolidated non-payment UAT scenarios** have passed in the deployed environment. The **PayHere Sandbox payment workflow has passed in localhost**, and the **hosted PayHere flow remains pending** because the current Vercel-provided subdomain could not be registered using the PayHere merchant portal's website-domain integration setup.

The agreed university presentation will demonstrate the deployed workflows and the successful localhost payment separately. After client approval, the team intends to obtain a suitable custom domain, finalize PayHere configuration, and verify the hosted payment flow.

**UAT report recommendation:** Accept the tested functional scope for the academic demonstration with the hosted payment distinction accurately documented. This does not replace future client acceptance of the final payment-enabled deployment.



**Prepared by:** [Sandaru]  
**Reviewed by:** [Kavindu]   
**Client approval (future):** [Pending]

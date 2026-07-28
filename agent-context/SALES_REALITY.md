# SALES_REALITY.md

## Honest Sales-Readiness Assessment

**As of:** May 2026  
**Product:** SecurePulse by CloudMatrix Business Solutions  
**Stage:** MVP → Commercialization transition

---

## What Is Working Right Now

### ✅ Real Microsoft Technology Stack
- Microsoft Entra ID authentication via MSAL (not fake SSO)
- Microsoft Graph API integration for Secure Score and control profiles
- Azure OpenAI GPT-4 integration (mock mode active until live credentials provisioned)
- Azure-native architecture (App Services, Front Door, Key Vault pattern)
- Defender XDR signal ingestion path built

### ✅ Real Security Data
- Microsoft Secure Score pulled directly from Graph API (normalized to percentage)
- CIS Controls v8 mapping implemented and producing compliance scores
- Risk level determination (Low/Medium/High) based on real score thresholds
- Lead ranking (Hot/Warm/Cold) with deterministic scoring rules

### ✅ AI Summaries
- Executive summaries generated from real assessment data
- Mock mode works without Azure OpenAI credentials for demos
- AI transparency: every summary includes model version, guardrails, data sources
- Per-tenant AI usage tracking built

### ✅ Copilot Readiness Assessment
- Seven-check assessment framework (MFA, MDM, DLP, Sensitivity Labels, Secure Score, Defender, PIM)
- Scores 0–100, ranks Copilot upsell opportunity
- Creates a clear remediate → become Copilot ready → upgrade narrative for sales

### ✅ Customer Portal (Phase 2, delivered early)
- Read-only customer-facing dashboard built
- Customers can see their own security posture without accessing internal tools
- Role-gated at both frontend and backend

### ✅ CSP Attribution Reporting
- Per-tenant monthly usage reports for Microsoft CSP incentive eligibility
- `csp_managed` and `csp_partner_tenant_id` fields on tenant model

---

## What Is NOT Ready Yet

### ❌ Live Graph Credentials for Demo
Real Microsoft 365 tenant credentials (Entra app registration with Graph permissions) are required to demo live data. Without these, the product runs on mock/seed data. For a customer-facing demo, a dedicated demo tenant with pre-configured Secure Score is needed.

**Required:** App registration with `SecurityEvents.Read.All`, `SecurityActions.Read.All`, `User.Read.All`, `DeviceManagementConfiguration.Read.All` permissions and admin consent granted.

### ❌ AppSource / Marketplace Listing
The SaaS offer has been configured in documentation (`infra/marketplace/saas-offer-manifest.md`) but has not been submitted to Partner Center. Microsoft publisher verification, legal entity confirmation, and a live landing page URL are required before submission.

**Blockers:** Publisher verification, landing page at `https://app.securepulse.ca`, SaaS billing webhook endpoint deployed.

### ❌ Security Copilot Plugin Registration
The declarative plugin manifest (`apps/copilot-plugin/plugin-manifest.json`) is complete but not yet registered in a Security Copilot tenant. Registration requires a live OpenAPI spec endpoint at `https://app.securepulse.ca/api/openapi.json`.

**Blockers:** Production deployment, live OpenAPI spec endpoint, Security Copilot tenant for testing.

### ❌ Production Database
PostgreSQL schema and RLS policies are designed and migration scripts are ready. Neon PostgreSQL account not yet provisioned for production. Current data is in-memory only (per-process, lost on restart).

### ❌ Azure Infrastructure Deployment
Bicep templates are written (`infra/bicep/`). Azure subscription with App Services, Front Door, and Key Vault not yet provisioned for production.

---

## What a Demo Needs to Show

A credible sales demo requires the following flow:

1. **Login** — MSAL sign-in with a real (or demo-tenant) Microsoft 365 account
2. **Dashboard** — Security score percentage, risk level badge, lead rank
3. **Assessment details** — CIS Controls v8 breakdown with compliant/partial/non-compliant status
4. **Top recommendations** — Prioritized remediation list with score impact
5. **AI executive summary** — Plain-language summary (mock mode acceptable if labeled)
6. **Copilot readiness score** — Seven-check assessment with remediation hints
7. **Customer portal preview** — Show the customer-facing read-only view
8. **AI transparency panel** — Show guardrails and data sources (builds trust)

Demo mode with realistic seed data is acceptable for initial conversations. Live data requires provisioned Graph credentials.

---

## Sales Contacts

- **Demo & Sales Enquiries:** See company contact on CloudMatrix website
- **Technical Partnerships (Microsoft CSP/MSSP):** Contact via Microsoft Partner Network
- **Scheduling:** Use Calendly link when available on `https://app.securepulse.ca`
- **Sales email:** Configured at company level — update this document when live

---

## Honest Positioning Statement

> SecurePulse is a Microsoft-native security posture platform purpose-built for Canadian SMBs. It is production-ready in architecture, with all core features implemented. A live demo requires provisioned Graph credentials. AppSource listing and Security Copilot plugin registration are in progress. We are not SOC 2 certified and do not claim to be. We are aligned with CIS Controls v8 and support compliance readiness for PIPEDA and Quebec Law 25.

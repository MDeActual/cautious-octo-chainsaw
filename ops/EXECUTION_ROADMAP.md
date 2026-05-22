# EXECUTION_ROADMAP.md

## SecurePulse — MCaps 2026 Alignment Roadmap

**Owner:** CloudMatrix Business Solutions  
**Program alignment:** Microsoft MCaps FY2026, Cloud Security Specialization, Co-sell  
**Last updated:** May 2026

---

## Priority Classification

- **P1** = Commercialization blockers, broken core UX, broken demo, security issues
- **P2** = Leverage, trust gains, monetization clarity, resilience
- **P3** = Visual polish, optimization, cleanup
- **P4** = Experiments, speculative ideas

---

## ✅ Done

### P1 — Real MSAL Graph Authentication
**Value:** Platform reads real Microsoft Secure Score data instead of mock  
**Delivered:** Graph proxy service with `@azure/msal-node` app-only token flow  
**What works:** Secure Score, control profiles, fallback to mock when credentials absent  

### P2 — Defender XDR Signal Integration
**Value:** Richer security context, Defender-aligned positioning  
**Delivered:** `/defender-signals/:tenantId` endpoint pulling incidents and risky users  
**What works:** Active incidents, high-severity count, risky users, high-risk user count  

### P3 — Copilot for M365 Readiness Scoring
**Value:** Unique upsell path — assess → remediate → become Copilot-ready → upgrade  
**Delivered:** Seven-check readiness assessment with 0–100 score and lead rank  
**What works:** MFA, MDM, DLP, Sensitivity Labels, Secure Score threshold, Defender, PIM checks  

### P4 — Copilot Plugin Manifest
**Value:** Security Copilot integration, MCaps co-sell signal, partner differentiation  
**Delivered:** `apps/copilot-plugin/plugin-manifest.json` with schema v2  
**Functions:** GetSecurityPosture, GetTopRecommendations, GetCopilotReadiness, GetRiskAnalysis  

### P5 — Azure Marketplace / AppSource Offer Configuration
**Value:** Transactable SaaS offer, co-sell eligibility, MCaps incentive  
**Delivered:** `infra/marketplace/saas-offer-manifest.md` — full plan mapping and technical config  
**Blockers remaining:** Publisher verification, live landing page, billing webhook  

### P6 — CSP Attribution & Reporting
**Value:** Microsoft CSP partner incentive eligibility, usage-based billing foundation  
**Delivered:** Monthly per-tenant usage report, CSP fields on Tenant model  

### P7 — Cloud Security Specialization Documentation
**Value:** Demonstrates MCaps alignment, supports specialization application  
**Delivered:** `docs/security/CLOUD_SECURITY_SPECIALIZATION.md` with requirements mapping  

### P8 — AI Provenance Logging
**Value:** AI transparency, trust, regulatory defensibility  
**Delivered:** `model_version`, `guardrails_applied`, `data_sources` in all AI responses  
**Also delivered:** `getRecordsByTenant()` in UsageService for per-tenant AI history  

### P9 — Admin Consent Flow
**Value:** Enables multi-tenant delegated Graph access for real customer onboarding  
**Delivered:** `apps/identity-service/src/routes/consent.ts`  

### P10 — Customer Portal
**Value:** Moves product from internal-only to customer-facing Phase 2 capability  
**Delivered:** Read-only portal for Customer-role users, role-gated at service and UI layer  

---

## 🔄 In Progress

### Production Infrastructure Deployment
**Priority:** P1 (commercialization blocker)  
**Description:** Azure Bicep templates written, not yet applied  
**Tasks:**
- [ ] Provision Azure subscription
- [ ] Apply `infra/bicep/` templates (App Services, Front Door + WAF, Key Vault)
- [ ] Deploy all six services
- [ ] Configure environment variables from Key Vault references

### Live Demo Credentials
**Priority:** P1 (demo blocker)  
**Description:** Graph credentials needed for live data in demo flows  
**Tasks:**
- [ ] Register Entra app with required Graph permissions
- [ ] Admin consent in demo M365 tenant
- [ ] Configure `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`, `ENTRA_TENANT_ID` in Key Vault

---

## 📋 Next Sprint Recommendations

### 1. Neon PostgreSQL Production Setup
**Priority:** P1  
**Why now:** Platform is in-memory only; all data lost on restart; cannot onboard real customers  
**Tasks:**
- [ ] Provision Neon PostgreSQL account
- [ ] Run migration scripts against production database
- [ ] Verify RLS policies active per tenant
- [ ] Update `DATABASE_URL` in Key Vault

### 2. Partner Center Publisher Verification
**Priority:** P1 (MCaps co-sell / AppSource blocker)  
**Why now:** Cannot submit AppSource listing without verified publisher  
**Tasks:**
- [ ] Complete Microsoft Publisher Agreement
- [ ] Submit company legal entity for verification
- [ ] Prepare landing page at `https://app.securepulse.ca`
- [ ] Implement SaaS billing webhook (`POST /api/webhooks/marketplace`)

### 3. OpenAPI Spec Endpoint
**Priority:** P2 (Copilot plugin blocker)  
**Why now:** Security Copilot plugin registration requires a live OpenAPI spec  
**Tasks:**
- [ ] Auto-generate OpenAPI spec from Express route definitions
- [ ] Serve at `https://app.securepulse.ca/api/openapi.json`
- [ ] Validate against Security Copilot plugin schema requirements

### 4. Application Insights Telemetry
**Priority:** P2  
**Why now:** No production observability; flying blind in live environment  
**Tasks:**
- [ ] Wire `@cloudmatrix/observability` package into all services
- [ ] Configure `APP_INSIGHTS_CONNECTION_STRING` per service
- [ ] Add custom dimensions: `tenant_id`, `user_role`, `service_name`

### 5. Integration Test Coverage
**Priority:** P2  
**Why now:** All P1–P10 features lack end-to-end integration tests  
**Tasks:**
- [ ] Supertest suites for all new routes (defender-signals, copilot-readiness, csp-report, consent, ai/summaries)
- [ ] React Testing Library + MSW tests for Customer Portal
- [ ] Target ≥ 80% line coverage

---

## 🔮 Later (P3/P4)

| Item | Priority | Notes |
|---|---|---|
| Billing plan enforcement (Core/Pro/Elite feature gates) | P2 | `ENTITLEMENTS.md` defines tiers; enforcement not wired |
| Bilingual (French/English) UI | P3 | Canadian regulatory differentiation; high effort |
| Power Automate / Logic Apps connector | P3 | Automation service extension |
| SIEM integration (Sentinel export) | P3 | Enterprise upsell feature |
| White-label / MSP branding | P4 | Multi-partner mode; Phase 3 feature |
| SOC 2 Type II preparation | P4 | Long lead time; needed for enterprise deals |
| Quebec Law 25 audit report generation | P3 | Specific compliance report format |
| Automated remediation execution | P4 | Requires explicit customer consent and strict safety controls |

---

## Revenue Readiness Summary

| Milestone | Status | Blocker |
|---|---|---|
| Demo-ready (mock data) | ✅ Ready | None |
| Demo-ready (live data) | 🔄 In progress | Graph credentials needed |
| Customer onboarding (Portal) | ✅ Built | Production infra needed |
| Transactable AppSource listing | ❌ Not ready | Publisher verification + live landing page |
| Co-sell eligible | 🔄 Partial | Needs AppSource listing + ACO |
| Security Copilot plugin live | ❌ Not ready | Production deployment + OpenAPI spec |
| Cloud Security Specialization application | 🔄 Partial | Customer references needed |

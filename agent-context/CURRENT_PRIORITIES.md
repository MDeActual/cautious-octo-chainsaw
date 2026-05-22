# CURRENT_PRIORITIES.md

## MCaps 2026 Alignment Priorities — Status Tracker

Last updated: Sprint ending May 2026  
Branch: `copilot/analyze-mcaps-start-2026`

---

| # | Priority | Description | Status |
|---|---|---|---|
| P1 | Real MSAL Graph Authentication | Replace mock Graph calls with real Entra ID delegated/app auth via MSAL | ✅ Done |
| P2 | Defender XDR Signal Integration | Pull active incidents and risky users from Defender via Graph | ✅ Done |
| P3 | Copilot for M365 Readiness Scoring | Assess and score tenant readiness to deploy Microsoft 365 Copilot | ✅ Done |
| P4 | Copilot Plugin Manifest | Declare SecurePulse as a Microsoft Security Copilot declarative plugin | ✅ Done |
| P5 | Azure Marketplace / AppSource Offer | SaaS offer configuration guide for Partner Center submission | ✅ Done |
| P6 | CSP Attribution & Reporting | Per-tenant CSP usage reporting for Microsoft incentive eligibility | ✅ Done |
| P7 | Cloud Security Specialization Docs | Map SecurePulse capabilities to Microsoft Cloud Security Specialization requirements | ✅ Done |
| P8 | AI Provenance Logging | Populate `model_version`, `guardrails_applied`, and `data_sources` in AI responses | ✅ Done |
| P9 | Admin Consent Flow | Delegated admin consent for multi-tenant Graph access | ✅ Done |
| P10 | Customer Portal (Phase 2) | Read-only portal for end-customer tenants to view their own security posture | ✅ Done |

---

## Done in This Sprint (P4, P5, P7, P8)

### P4 — Copilot Plugin Manifest
- File: `apps/copilot-plugin/plugin-manifest.json`
- Schema version: v2
- Functions: GetSecurityPosture, GetTopRecommendations, GetCopilotReadiness, GetRiskAnalysis
- Auth: OAuth bearer
- Status: manifest complete; registration in Security Copilot tenant pending live credentials

### P5 — Azure Marketplace / AppSource Offer
- File: `infra/marketplace/saas-offer-manifest.md`
- Plan mapping: Free → Core → Pro → Elite
- Technical config: landing page, webhook, AAD app registration
- Status: documentation complete; Partner Center submission pending legal review and Microsoft publisher verification

### P7 — Cloud Security Specialization Docs
- File: `docs/security/CLOUD_SECURITY_SPECIALIZATION.md`
- Coverage: specialization requirements, SecurePulse capability mapping, gaps, audit checklist
- Status: documentation complete

### P8 — AI Provenance Logging
- Files: `apps/ai-service/src/services/mock-openai.service.ts`, `apps/ai-service/src/services/openai.service.ts`, `apps/ai-service/src/services/usage.service.ts`
- Added: `model_version`, `guardrails_applied`, `data_sources` to `ExecutiveSummaryResponse`
- Added: `getRecordsByTenant(tenantId, limit)` to `UsageService`
- Status: ✅ Complete

---

## Done in Previous Sprints (P1, P2, P3, P6, P9, P10)

### P1 — Real MSAL Graph Authentication
- `apps/graph-proxy/src/` — real MSAL app-only token flow via `@azure/msal-node`
- Secure Score and control profiles fetched live from Microsoft Graph
- Fallback to mock data when credentials absent

### P2 — Defender XDR Signal Integration
- `apps/graph-proxy/src/routes/secureScore.ts` — `/defender-signals/:tenantId` endpoint
- Pulls active incidents from `/security/incidents` and risky users from `/identityProtection/riskyUsers`
- Integrated into `SecurityAssessment` via `active_incident_count` and `risky_user_count`

### P3 — Copilot Readiness Scoring
- `apps/core-backend/src/routes/copilot-readiness.ts`
- Seven-check assessment: MFA, Intune MDM, DLP policies, Sensitivity Labels, Secure Score threshold, Defender, Privileged Identity Management
- Score 0–100, readiness status: ready/partial/not-ready, lead rank for Copilot upsell

### P6 — CSP Attribution & Reporting
- `apps/core-backend/src/routes/csp-report.ts`
- Monthly per-tenant usage report keyed by `csp_partner_tenant_id`
- Tenant model extended with `csp_managed` and `csp_partner_tenant_id` fields

### P9 — Admin Consent Flow
- `apps/identity-service/src/routes/consent.ts`
- Generates Entra ID admin consent URL with state token
- Enables multi-tenant app consent for delegated Graph access

### P10 — Customer Portal
- `apps/frontend/src/pages/CustomerPortalPage.tsx`
- Role-gated (`Customer` role only), read-only view of tenant security posture
- Fetches assessment, recommendations, and Copilot readiness

---

## Next Sprint Candidates

- [ ] Production Neon PostgreSQL deployment with RLS policies active
- [ ] Azure Bicep infra apply (App Services, Front Door + WAF)
- [ ] Partner Center publisher verification and AppSource listing submission
- [ ] Security Copilot plugin registration in test tenant
- [ ] Application Insights telemetry wiring (`@cloudmatrix/observability`)
- [ ] End-to-end integration tests for all P1–P10 routes
- [ ] Billing webhook for Azure Marketplace SaaS subscription lifecycle

# RELEASE_READINESS.md

## SecurePulse — Release Readiness Checklist

**Version assessed:** Branch `copilot/analyze-mcaps-start-2026`  
**Date:** May 2026  
**Purpose:** Honest current state for go/no-go decisions per capability area

Status key:  
✅ **Ready** — implemented, tested, deployable  
⚠️ **Ready (pending credentials/config)** — code complete, needs environment setup  
🔄 **Partial** — implemented but incomplete or not end-to-end tested  
❌ **Not ready** — not implemented or has known blockers

---

## Authentication (Entra ID + MSAL)

| Check | Status | Notes |
|---|---|---|
| MSAL React integration in frontend | ✅ Ready | `@azure/msal-react` configured with redirect flow |
| JWT validation middleware in all services | ✅ Ready | `@cloudmatrix/auth-utils` package used by all services |
| Role-based access control (Sales/Analyst/Admin/Customer) | ✅ Ready | Enforced server-side at route level |
| Tenant isolation in JWT claims | ✅ Ready | `tenant_id` extracted from JWT, injected into all queries |
| Service-to-service managed identity auth | 🔄 Partial | Pattern established; not fully wired in all inter-service calls |

**Overall: ✅ Ready for demo and initial onboarding**

---

## Graph Integration (Real MSAL — Pending Credentials)

| Check | Status | Notes |
|---|---|---|
| `@azure/msal-node` app-only token flow | ✅ Ready | Implemented in `graph-proxy` |
| Secure Score pull (`/security/secureScores`) | ⚠️ Ready (pending creds) | Code ready; needs `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`, `ENTRA_TENANT_ID` |
| Secure Score control profiles | ⚠️ Ready (pending creds) | Same credential requirement |
| Mock fallback when credentials absent | ✅ Ready | Returns realistic seed data without credentials |
| Rate limiting / throttling handling | 🔄 Partial | Basic error propagation; no retry-after logic |

**Overall: ⚠️ Ready pending live Graph credentials in environment**

---

## Defender XDR Signals

| Check | Status | Notes |
|---|---|---|
| Active incident pull (`/security/incidents`) | ⚠️ Ready (pending creds) | Implemented in graph-proxy |
| Risky user pull (`/identityProtection/riskyUsers`) | ⚠️ Ready (pending creds) | Implemented in graph-proxy |
| Defender signal summary endpoint | ⚠️ Ready (pending creds) | `/defender-signals/:tenantId` in graph-proxy |
| Integration into SecurityAssessment | ✅ Ready | `active_incident_count`, `risky_user_count` fields populated |
| Defender data displayed in frontend | 🔄 Partial | Data available in API; frontend display in progress |

**Overall: ⚠️ Ready pending live credentials**

---

## Copilot Readiness Assessment

| Check | Status | Notes |
|---|---|---|
| Seven-check readiness assessment | ✅ Ready | MFA, MDM, DLP, Labels, Secure Score, Defender, PIM |
| 0–100 scoring and readiness status | ✅ Ready | ready/partial/not-ready thresholds defined |
| Copilot lead rank (upsell signal) | ✅ Ready | Hot/Warm/Cold based on readiness score |
| Remediation hints per failed check | ✅ Ready | Each check includes `remediation_hint` |
| Frontend Copilot readiness card | ✅ Ready | `CopilotReadinessCard` component built |

**Overall: ✅ Ready**

---

## Customer Portal (Phase 2 Feature)

| Check | Status | Notes |
|---|---|---|
| `CustomerPortalPage` React component | ✅ Ready | Built and route-registered |
| Customer role enforcement (server-side) | ✅ Ready | RBAC middleware blocks non-Customer access |
| Customer role enforcement (client-side) | ✅ Ready | Role-gated route in React router |
| Customer sees only own tenant data | ✅ Ready | `tenant_id` from JWT, enforced at API layer |
| Read-only (no write operations exposed) | ✅ Ready | Customer routes are GET-only |

**Overall: ✅ Ready (production infra required for live deployment)**

---

## AI Summaries and Transparency

| Check | Status | Notes |
|---|---|---|
| Executive summary generation (mock mode) | ✅ Ready | MockOpenAiService works without credentials |
| Executive summary generation (Azure OpenAI) | ⚠️ Ready (pending creds) | Needs `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY` |
| AI provenance fields (`model_version`, `guardrails_applied`, `data_sources`) | ✅ Ready | Populated in both mock and real service |
| Per-tenant usage tracking (`UsageService`) | ✅ Ready | In-memory; `getRecordsByTenant()` implemented |
| AI transparency panel in frontend | ✅ Ready | `AITransparencyPanel` component built |
| Usage persisted to database | ❌ Not ready | In-memory only in Phase 1; `ai_usage_logs` table defined but not wired |

**Overall: ✅ Ready for demo; ⚠️ usage persistence requires database deployment**

---

## AppSource / Azure Marketplace Listing

| Check | Status | Notes |
|---|---|---|
| SaaS offer documentation | ✅ Ready | `infra/marketplace/saas-offer-manifest.md` complete |
| Plan mapping (Free/Core/Pro/Elite) | ✅ Ready | Documented with pricing guidance |
| Partner Center account | ❌ Not ready | Publisher verification not completed |
| Landing page (`https://app.securepulse.ca`) | ❌ Not ready | Production deployment required |
| SaaS billing webhook endpoint | ❌ Not ready | `POST /api/webhooks/marketplace` not implemented |
| AAD app registration for marketplace | ❌ Not ready | Separate registration required for marketplace auth |
| Publisher verification with Microsoft | ❌ Not ready | Legal entity submission required |

**Overall: ❌ Not ready — manifest-only state; submission blockers remain**

---

## Security Copilot Plugin

| Check | Status | Notes |
|---|---|---|
| Plugin manifest (`plugin-manifest.json`) | ✅ Ready | Schema v2, four functions declared |
| OpenAPI spec endpoint | ❌ Not ready | `https://app.securepulse.ca/api/openapi.json` not deployed |
| Plugin registered in Security Copilot tenant | ❌ Not ready | Requires live endpoint and tenant access |
| OAuth flow for plugin auth | 🔄 Partial | Bearer token auth declared; Entra OAuth flow not wired for plugin |
| Functions tested via Copilot | ❌ Not ready | Requires registration |

**Overall: ❌ Not ready — manifest-only; registration and live endpoint required**

---

## CSP Attribution

| Check | Status | Notes |
|---|---|---|
| Tenant model `csp_managed` field | ✅ Ready | In shared-types and core-backend |
| Monthly CSP usage report endpoint | ✅ Ready | `GET /api/v1/csp-report/:partnerTenantId/:month` |
| In-memory usage aggregation | ✅ Ready | Phase 1 in-memory store |
| Persisted to database | ❌ Not ready | Requires production database |
| Microsoft partner network submission | ❌ Not ready | Manual process; not automated |

**Overall: 🔄 Partial — code ready, persistence and partner submission pending**

---

## Infrastructure and Security

| Check | Status | Notes |
|---|---|---|
| Azure Bicep templates | 🔄 Partial | Written; not applied |
| Production deployment (App Services) | ❌ Not ready | Not deployed |
| Front Door + WAF | ❌ Not ready | Not applied |
| Key Vault for secrets | 🔄 Partial | Pattern defined; not provisioned |
| Application Insights telemetry | 🔄 Partial | Package exists; not wired to services |
| CI/CD pipeline (GitHub Actions) | 🔄 Partial | Basic workflow; no deploy step |

**Overall: ❌ Not production-deployed**

---

## Summary Scorecard

| Area | Status |
|---|---|
| Authentication | ✅ Ready |
| Graph Integration | ⚠️ Pending creds |
| Defender Signals | ⚠️ Pending creds |
| Copilot Readiness | ✅ Ready |
| Customer Portal | ✅ Ready |
| AI Summaries | ✅ Ready (demo) |
| AppSource Listing | ❌ Not ready |
| Security Copilot Plugin | ❌ Not ready |
| CSP Attribution | 🔄 Partial |
| Production Infrastructure | ❌ Not deployed |

# PROJECT_RULES.md

## Non-Negotiable Architectural and Product Rules

Source of truth: `docs/PHASE1_SPEC.md`, `docs/MASTER_SPEC.md`, `GITHUB_DEVOS_OPERATOR_v2_SECUREPULSE.md`

These rules are hard constraints. Violations are not acceptable in any PR.

---

## Architecture Rules

### 1. Microsoft Graph is accessed ONLY via `graph-proxy`
No other service may call Microsoft Graph API directly. The graph-proxy service is the sole boundary between the platform and Microsoft's APIs. All Graph calls must pass through it. Rationale: credential isolation, permission control, audit surface, throttling management.

### 2. All data is tenant-scoped
Every database query, API call, and AI prompt must be scoped to a specific `tenant_id`. No cross-tenant data leakage. Row-Level Security (RLS) policies on PostgreSQL enforce this at the database layer. Service-layer code must never bypass `tenant_id` filtering.

### 3. Frontend contains no business logic
All scoring, ranking, compliance evaluation, and authorization decisions happen in backend services. The frontend is a presentation layer only. It may format and display data, but it must not compute scores, determine access, or make trust decisions.

### 4. AI services may not call Microsoft Graph or execute privileged actions
The `ai-service` receives sanitized, pre-processed assessment data from `core-backend`. It does not hold Graph credentials, does not call identity APIs, and does not mutate any tenant data. AI outputs are advisory only — they do not trigger automated changes.

### 5. No secrets in code or in repository
All credentials, API keys, and connection strings are environment variables. Production secrets are stored in Azure Key Vault and referenced via managed identity. `.env.example` documents required variables. Never commit secrets.

### 6. Each service is independently deployable
Services communicate over HTTP (internal network). No shared in-process state between services except the `packages/` layer (types, logger, auth-utils). A service failing must not cascade to all others.

### 7. Zero Trust everywhere
Every inbound request is authenticated and authorized regardless of network origin. Internal service-to-service calls use Entra ID managed identity tokens. No implicit trust based on IP, network segment, or service co-location.

### 8. Strict tenant isolation
Tenants are fully isolated from each other. No tenant may query, enumerate, or infer data about another tenant. This includes AI outputs, audit logs, and error messages. Tenant-specific data never appears in shared caches without tenant-scoped keys.

---

## Role and Access Rules

### 9. Customer role is read-only
Users with `UserRole = 'Customer'` may only read their own tenant's assessment data, recommendations, and Copilot readiness. They cannot trigger assessments, modify data, manage users, or access any other tenant. This is enforced server-side via RBAC middleware — frontend enforcement alone is insufficient.

### 10. Role hierarchy
- **Admin**: full platform access; manage tenants, users, entitlements
- **Analyst**: read/write access to assessments, compliance, recommendations; no user management
- **Sales**: read access to lead rankings, assessments, opportunity scores; no compliance detail
- **Customer**: read-only, own tenant only

All role checks must be performed in the service layer, not in the frontend or in the database alone.

---

## Product Integrity Rules

### 11. No fake trust claims
SecurePulse must not claim SOC 2 certification, ISO 27001, Microsoft endorsement, or guaranteed breach prevention unless these are formally obtained and verified. Use approved language (see `docs/security/TRUST_CLAIMS_POLICY.md`). ROI numbers must be labeled as modeled estimates.

### 12. No misleading AI outputs
AI summaries must include `model_version`, `guardrails_applied`, and `data_sources` in every response. The AI transparency panel must be accessible to all users with legitimate access to a tenant. AI outputs are labeled as AI-generated and must not be presented as certified security audits.

### 13. No business logic duplication between services
Each service owns a specific domain. Do not re-implement scoring in the AI service, do not re-implement compliance evaluation in the frontend. If logic is needed in multiple places, it belongs in `packages/shared-types` or a new shared package — never copy-pasted.

### 14. Audit logging is mandatory for security-relevant events
All authentication events, tenant data access, mutations, and AI operations must be logged via the `@cloudmatrix/logger` package with `tenant_id`, `user_id`, operation, and timestamp. This is non-negotiable for compliance posture.

---

## Service Boundary Quick Reference

| Service | Owns | Must NOT |
|---|---|---|
| `graph-proxy` | All Graph API calls | Store data, apply business logic |
| `identity-service` | Auth, JWT, RBAC, tenant mgmt | Call Graph, apply scoring |
| `core-backend` | Scoring, CIS, compliance, leads | Call Graph directly |
| `ai-service` | AI summaries, usage tracking | Call Graph, mutate tenant data |
| `automation-service` | Notifications, event processing | Own business data |
| `frontend` | UI rendering, MSAL auth | Contain business logic, hold secrets |

Full detail: `docs/architecture/SERVICE_BOUNDARIES.md`

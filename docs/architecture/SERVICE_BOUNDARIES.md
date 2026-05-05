# SERVICE_BOUNDARIES.md

## SecurePulse — Service Boundary Definitions

**Source of truth for what each service owns, exposes, and must not do.**  
**Architectural rule:** Microsoft Graph is accessed ONLY via `graph-proxy`. All data is tenant-scoped. Frontend contains no business logic.

---

## Service Map

```
Browser (MSAL auth)
        │
        ▼
   frontend :5173
        │  (bearer JWT)
        ├──────────────────────────────────────────────────┐
        ▼                                                  ▼
identity-service :3001          core-backend :3003
        │                               │
        │                   ┌───────────┤
        ▼                   ▼           ▼
   (JWT issuance)    graph-proxy     ai-service :3005
                        :3002        automation-service :3004
                          │
                   Microsoft Graph API
```

---

## `graph-proxy` — Port 3002

### Owns
- The **only** connection to Microsoft Graph API
- Entra ID app-only token management (`@azure/msal-node`)
- Microsoft Secure Score data retrieval
- Secure Score control profiles retrieval
- Defender XDR incident ingestion
- Entra ID Protection risky user ingestion
- Mock fallback data when Graph credentials absent

### Must NOT
- Store assessment data in a database
- Apply scoring logic or ranking logic
- Call identity-service or core-backend
- Hold tenant-specific business state
- Expose raw Microsoft Graph responses without normalisation

### APIs Exposed
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/secure-score/:tenantId` | Secure Score for tenant |
| `GET` | `/api/v1/secure-score/:tenantId/control-profiles` | Control profile list |
| `GET` | `/api/v1/defender-signals/:tenantId` | Defender incidents + risky users *(added this sprint)* |

### Depends On
- Microsoft Graph API (external)
- Entra ID app registration credentials (environment)
- `@cloudmatrix/logger`, `@cloudmatrix/shared-types`

---

## `identity-service` — Port 3001

### Owns
- JWT token validation for all inbound requests
- Role-based access control (RBAC) middleware
- Tenant management (CRUD)
- User management
- Entra ID admin consent URL generation *(added this sprint)*
- Audit logging of auth events

### Must NOT
- Call Microsoft Graph directly
- Perform security scoring or compliance evaluation
- Return business data (assessments, recommendations)
- Issue its own tokens (tokens come from Entra ID)

### APIs Exposed
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/me` | Current user profile from JWT |
| `POST` | `/api/v1/tenants` | Create tenant |
| `GET` | `/api/v1/tenants/:id` | Get tenant |
| `GET` | `/api/v1/consent/url` | Generate admin consent URL *(added this sprint)* |
| `GET` | `/api/v1/consent/callback` | Handle consent callback *(added this sprint)* |

### Depends On
- Microsoft Entra ID (external — token validation)
- `@cloudmatrix/auth-utils`, `@cloudmatrix/logger`, `@cloudmatrix/shared-types`

---

## `core-backend` — Port 3003

### Owns
- Security assessment orchestration and storage
- Secure Score normalization and risk level determination
- Lead ranking (Hot/Warm/Cold) with opportunity scoring
- CIS Controls v8 mapping and compliance evaluation
- Multi-framework compliance assessment (PIPEDA, Law 25, Zero Trust, FSI, MISA)
- Trend analysis (improving/stable/declining)
- Copilot for M365 readiness scoring *(added this sprint)*
- CSP attribution and monthly usage reporting *(added this sprint)*

### Must NOT
- Call Microsoft Graph directly (use graph-proxy)
- Generate AI summaries (use ai-service)
- Send notifications (use automation-service)
- Hold credentials for external Microsoft services

### APIs Exposed
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/assessments` | Trigger or store assessment |
| `GET` | `/api/v1/assessments/:tenantId/latest` | Latest assessment |
| `GET` | `/api/v1/assessments/:tenantId/history` | Assessment history |
| `GET` | `/api/v1/leads` | All lead rankings |
| `GET` | `/api/v1/leads/:tenantId` | Lead rank for tenant |
| `GET` | `/api/v1/compliance/:tenantId` | Compliance framework statuses |
| `GET` | `/api/v1/copilot-readiness/:tenantId` | Copilot readiness assessment *(added this sprint)* |
| `GET` | `/api/v1/csp-report/:partnerTenantId/:month` | CSP monthly usage report *(added this sprint)* |

### Depends On
- `graph-proxy` (Secure Score data)
- `@cloudmatrix/auth-utils`, `@cloudmatrix/logger`, `@cloudmatrix/shared-types`
- PostgreSQL (Neon) via `DATABASE_URL`

---

## `ai-service` — Port 3005

### Owns
- AI-powered executive summary generation
- AI-powered recommendation prioritization
- AI-powered risk analysis
- AI token usage tracking (`UsageService`)
- Per-tenant AI usage history (`getRecordsByTenant`) *(added this sprint)*
- AI provenance metadata: `model_version`, `guardrails_applied`, `data_sources` *(added this sprint)*
- Mock AI mode for development (no Azure OpenAI credentials required)

### Must NOT
- Call Microsoft Graph API
- Store or access raw tenant user data, PII, or security incident details
- Execute privileged actions (Graph write, policy changes, user mutations)
- Bypass input sanitization — AI prompts must use normalised assessment data only

### APIs Exposed
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/ai/summary` | Generate executive summary |
| `POST` | `/api/v1/ai/recommendations` | Prioritize recommendations |
| `POST` | `/api/v1/ai/risk-analysis` | Generate risk analysis |
| `GET` | `/api/v1/summaries/usage` | AI usage statistics |
| `GET` | `/api/v1/summaries/records` | Raw usage records |

### Depends On
- Azure OpenAI Service (external, optional — falls back to mock)
- `@cloudmatrix/auth-utils`, `@cloudmatrix/logger`, `@cloudmatrix/shared-types`

---

## `automation-service` — Port 3004

### Owns
- Event ingestion and processing
- Notification dispatch (Microsoft Teams webhooks, email)
- Automation rule evaluation
- Action history logging

### Must NOT
- Evaluate compliance or scoring logic
- Hold business data about tenants beyond event payloads
- Call Microsoft Graph directly

### APIs Exposed
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/events` | Ingest automation event |
| `POST` | `/api/v1/actions` | Trigger action |
| `GET` | `/api/v1/actions/history` | Action history |

### Depends On
- `@cloudmatrix/auth-utils`, `@cloudmatrix/logger`, `@cloudmatrix/shared-types`
- Microsoft Teams webhook (external, optional)

---

## `frontend` — Port 5173

### Owns
- React UI rendering
- MSAL authentication flow (redirects to Entra ID)
- User-facing dashboard, assessment views, recommendation lists
- Copilot readiness UI (`CopilotReadinessCard`)
- AI transparency panel (`AITransparencyPanel`) *(added this sprint)*
- Customer portal (`CustomerPortalPage`) *(added this sprint)*
- Client-side role-based route gating (in addition to server-side enforcement)

### Must NOT
- Contain business logic (scoring, compliance evaluation, ranking)
- Hold service credentials or secrets
- Make direct calls to Microsoft Graph
- Present AI outputs without transparency labels
- Display data from another tenant under any circumstances

### Depends On
- All backend services via authenticated HTTP
- Microsoft Entra ID (MSAL redirect flow)
- `@cloudmatrix/shared-types` (types only, no logic)

---

## Cross-Cutting Rules

1. All inter-service calls use bearer tokens validated by `@cloudmatrix/auth-utils`
2. All services log with `@cloudmatrix/logger` including `tenant_id` context
3. `tenant_id` is present in every request and every log entry for security-relevant operations
4. Services do not share a database schema — each service owns its own tables (future state; currently core-backend owns the primary schema)
5. No service exposes another service's internal models directly — always through typed contracts in `@cloudmatrix/shared-types`

# CloudMatrix MSSP Platform

## PHASE 1 SPECIFICATION — SOURCE OF TRUTH

Status: FINAL  
Scope: Phase 1 only  
Audience: Engineers and AI coding agents  
Creativity: NOT PERMITTED

---

## 1. Objective (Non-Negotiable)

Build an internal MSSP web platform for CloudMatrix to:

- Assess Microsoft 365 tenant security
- Normalize and score security posture
- Rank prospects and opportunities
- Automate internal sales and analyst workflows

This platform is internal-only in Phase 1.

---

## 2. Users & Access Model

Roles:
- Sales
- Analyst
- Admin

Rules:
- Microsoft Entra ID authentication only
- Role-based access enforced server-side and client-side
- No anonymous access
- No customer accounts in Phase 1

---

## 3. Canonical Architecture

```
Frontend (React + TypeScript + Tailwind)
        |
        v
Identity Service (Entra, RBAC, Tenants)
        |
        +---> Graph Proxy (ONLY Graph access)
        |
        +---> Core Backend (Scoring, CIS, Trends)
                    |
                    +---> Automation Service
                    |
                    +---> AI Service
```

No alternate architecture is allowed.

---

## 3a. Inter-Service Communication

- All inter-service communication is **REST/HTTP**
- Service ports: identity-service=3001, graph-proxy=3002, core-backend=3003, automation-service=3004, ai-service=3005, frontend=5173
- Service-to-service authentication uses **Entra ID managed identity tokens**
- All API responses use the `{ data, error, meta }` envelope (via `ApiResponse<T>` from `@cloudmatrix/shared-types`)

---

## 4. Non-Negotiable Architectural Rules

1. Microsoft Graph is accessed ONLY via graph-proxy
2. All data and requests are tenant-scoped
3. No secrets in code
4. Zero Trust everywhere
5. Each service must be independently deployable
6. Strict tenant isolation
7. Frontend contains no business logic
8. AI services never call Microsoft Graph

Violation of any rule is a hard failure.

---

## 5. Repository Structure (Authoritative)

```
cloudmatrix-mssp/
├── apps/
│   ├── identity-service
│   ├── graph-proxy
│   ├── core-backend
│   ├── automation-service
│   ├── ai-service
│   └── frontend
├── packages/
│   ├── shared-types
│   ├── auth-utils
│   ├── logger
│   └── observability
├── infra/
│   ├── bicep
│   └── pipelines
└── docs/
    └── PHASE1_SPEC.md
```

---

## 6. Service Responsibilities

### identity-service (port 3001)
- Entra ID JWT validation
- RBAC (Sales, Analyst, Admin)
- Tenant registry
- Tenant lifecycle (trial → active → suspended)
- Admin consent onboarding
- Tenant context propagation

Must NOT access Microsoft Graph.

---

### graph-proxy (port 3002)
- Sole Microsoft Graph boundary
- Secure Score ingestion
- Secure Score recommendations
- Alerts (basic)
- Device compliance (basic)
- Per-tenant rate limiting
- Audit logging
- Managed Identity–ready

Must NOT perform scoring or persistence.

---

### core-backend (port 3003)
- Consume graph-proxy only
- Normalize Secure Score
- CIS-aligned mapping
- Calculate: security percentage, risk level, opportunity score, lead rank
- Persist assessments
- Compute historical trends
- Publish events

Must NOT call Microsoft Graph.

---

### automation-service (port 3004)
- Receive events from core-backend
- Evaluate automation rules
- Trigger Teams, Email, Planner
- Power Automate / Logic Apps compatible

Internal-only workflows in Phase 1.

---

### ai-service (port 3005)
- Executive security summaries
- Tenant-scoped, sanitized input only
- Azure OpenAI–ready
- Usage logging and audit hooks

Must NOT authenticate users or access Graph.

---

### frontend (port 5173)
- Entra ID auth (MSAL)
- Protected routes
- Role-aware UI
- Security dashboard
- Trend visualization
- AI executive summary display
- Admin consent onboarding UX

Must NOT contain business logic or secrets.

---

## 7. Shared Contracts

JWT claims: sub, email, role (Sales | Analyst | Admin), tenant_id

Enums:
- RiskLevel = Low | Medium | High
- LeadRank = Hot | Warm | Cold
- TenantStatus = trial | active | suspended

API Response Envelope (`ApiResponse<T>` from `@cloudmatrix/shared-types`):
- `data: T | null`
- `error: string | null`
- `meta?: Record<string, unknown>`

All API endpoints MUST return responses in this envelope format.

---

## 8. Data & Persistence

- PostgreSQL (Neon)
- Shared DB with tenant_id enforced
- Row Level Security enabled

Persist:
- Assessment snapshots
- Secure Score history
- Lead rank history
- Timestamps

---

## 9. Required Environment Variables

See `.env.example` at the root and each service's `.env.example`.

---

## 10. Build Order (Strict)

1. packages (in order: shared-types → logger → auth-utils → observability)
2. identity-service
3. graph-proxy
4. core-backend
5. automation-service
6. ai-service
7. frontend
8. infra + docs

All services must start independently.

---

## 11. Phase 1 Definition of Done

- Entra ID authentication works end-to-end
- Tenant admin consent onboarding flow functional
- Security assessment pipeline works (Graph → Proxy → Core → Score)
- CIS Controls v8 mapping implemented
- Risk level + lead rank calculated correctly
- Automation events fire on assessment completion
- AI executive summaries generated
- Frontend dashboard shows live data
- All services deployed to Azure App Services
- CI/CD pipeline passing

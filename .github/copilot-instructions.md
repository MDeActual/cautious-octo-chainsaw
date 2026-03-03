# Copilot Instructions for CloudMatrix MSSP Platform

## Project Overview

CloudMatrix is an **AI-native, security-first MSSP/CSP/MSP platform** for Microsoft Cloud Partners (Canada-focused). It automates security assessments of Microsoft 365 tenants, scores them against CIS Controls v8, ranks sales opportunities, and generates AI-powered executive summaries.

**Current status:** Planning/architecture phase — no implementation code exists yet. All planning documents are in `plans/`.

---

## Repository Layout

```
/
├── .github/
│   └── copilot-instructions.md   # This file
├── plans/                         # Architecture and planning documents
│   ├── EXECUTIVE_SUMMARY.md
│   ├── ARCHITECTURE_PLAN.md
│   ├── TECHNICAL_SPECIFICATION.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   └── COMPLIANCE_FRAMEWORK_MAPPING.md
├── README.md                      # Full project overview
├── .gitignore                     # Ignores node_modules/, .env
└── package-lock.json              # Placeholder npm lockfile (empty; pnpm-lock.yaml will be used once implementation begins)
```

When implementation begins, the planned structure is:

```
apps/
  identity-service/   # Port 3001 — Entra ID auth, RBAC, tenant management
  graph-proxy/        # Port 3002 — Microsoft Graph API boundary
  core-backend/       # Port 3003 — Scoring, compliance, business logic
  automation-service/ # Port 3004 — Workflow automation, notifications
  ai-service/         # Port 3005 — Azure OpenAI insights
  frontend/           # Port 5173 — React 18 + MSAL UI
packages/
  shared-types/       # Common TypeScript types
  auth-utils/         # Auth utilities
  logger/             # Logging
  observability/      # Monitoring/telemetry
infra/
  bicep/              # Azure IaC
  scripts/            # Deployment scripts
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 LTS |
| Language | TypeScript 5.3+ |
| Package manager | pnpm 8+ |
| Backend framework | Express.js |
| Frontend | React 18 + Vite + Tailwind CSS |
| Auth | Microsoft Entra ID (MSAL) |
| Database | PostgreSQL 15+ (Neon, with RLS) |
| AI | Azure OpenAI (GPT-4) |
| Testing (backend) | Jest + Supertest |
| Testing (frontend) | Vitest + React Testing Library |
| Infrastructure | Azure App Services, Azure Front Door + WAF |

---

## Build & Development Commands

> **Note:** The project is in planning phase. Once implementation begins, the standard pnpm monorepo commands apply:

```bash
# Install dependencies (always run before build/test)
pnpm install

# Run all services in development mode
pnpm dev

# Build all packages and apps
pnpm build

# Run all tests
pnpm test

# Lint all code
pnpm lint

# Database migrations
pnpm migrate:up

# Environment setup — copy and fill in .env before first run
cp .env.example .env
```

Never commit `.env` files (they are gitignored). Always run `pnpm install` before building or testing.

---

## Key Architectural Constraints

- **Zero Trust:** Every service validates JWT tokens from Microsoft Entra ID. No service trusts another without verification.
- **Tenant isolation:** All database queries use Row-Level Security (RLS) scoped to `tenant_id`.
- **Single Graph boundary:** Only `graph-proxy` may call Microsoft Graph API — all other services route through it.
- **RBAC roles:** `admin`, `analyst`, `sales` — check role before allowing access to endpoints.
- **Compliance frameworks in scope (Phase 1):** CIS Controls v8, PIPEDA, Quebec Law 25, Microsoft Zero Trust, FSI, MISA.

---

## Reference Documents

- Full architecture: `plans/ARCHITECTURE_PLAN.md`
- Implementation details: `plans/TECHNICAL_SPECIFICATION.md`
- Week-by-week plan: `plans/IMPLEMENTATION_ROADMAP.md`
- Compliance mappings: `plans/COMPLIANCE_FRAMEWORK_MAPPING.md`
- Business overview: `plans/EXECUTIVE_SUMMARY.md`

Trust these instructions. Only search the repository if the information here appears incomplete or incorrect.

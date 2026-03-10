# GitHub Copilot Instructions

## Project Overview

CloudMatrix is an AI-native, security-first MSSP (Managed Security Service Provider) platform for Microsoft Cloud Partners. It automates Microsoft 365 tenant security assessment, compliance tracking, lead ranking, and AI-powered insights for small-to-medium businesses in Canada.

## Technology Stack

### Backend Services
- **Runtime:** Node.js 20 LTS
- **Language:** TypeScript 5.3+ (strict mode)
- **Framework:** Express.js
- **Database:** PostgreSQL 15+ (Neon) with Row-Level Security (RLS)
- **Authentication:** Microsoft Entra ID (JWT validation)
- **Package Manager:** pnpm 8+
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript 5.3+ (strict mode)
- **Styling:** Tailwind CSS
- **Auth:** MSAL React
- **Charts:** Recharts
- **Testing:** Vitest + React Testing Library

### Cloud & Infrastructure
- **Cloud:** Azure (App Services, Front Door + WAF)
- **AI:** Azure OpenAI (GPT-4)
- **Identity:** Microsoft Entra ID
- **Monitoring:** Application Insights
- **IaC:** Azure Bicep

## Repository Structure

This is a pnpm monorepo:

```
apps/
  identity-service/   # Port 3001 — Authentication, authorization, tenant management
  graph-proxy/        # Port 3002 — Sole Microsoft Graph API boundary
  core-backend/       # Port 3003 — Business logic, scoring, compliance
  automation-service/ # Port 3004 — Workflow automation and notifications
  ai-service/         # Port 3005 — AI-powered insights via Azure OpenAI
  frontend/           # Port 5173 — React UI with MSAL authentication
packages/
  shared-types/       # Common TypeScript types shared across all apps
  auth-utils/         # Authentication utilities
  logger/             # Logging infrastructure
  observability/      # Monitoring & telemetry
infra/
  bicep/              # Azure infrastructure as code
  scripts/            # Deployment scripts
```

## Common Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all services in development mode
pnpm build            # Build all packages and apps
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm migrate:up       # Run database migrations
pnpm migrate:down     # Rollback database migrations
```

## Coding Standards

### TypeScript
- Always use **strict mode** (`"strict": true` in tsconfig)
- Prefer explicit return types on all exported functions
- Use `unknown` over `any`; avoid `any` unless absolutely necessary
- Use `interface` for public API shapes; `type` for unions, intersections, and aliases
- Prefer `const` over `let`; never use `var`

### General
- Follow functional programming patterns; avoid mutating shared state
- Use async/await over raw Promises or callbacks
- Export named exports; avoid default exports except for React components
- All new features must have corresponding unit tests
- All API routes must have integration tests using Supertest

### React / Frontend
- Use functional components with hooks; no class components
- Co-locate component styles, tests, and logic in the same directory
- Use React Query for server state management
- Use React Context only for truly global UI state (theme, auth)

### API Design
- Follow RESTful conventions; use plural nouns for resource paths
- Return consistent JSON envelopes: `{ data, error, meta }`
- All endpoints must validate request bodies using Zod schemas
- Document all routes with JSDoc/OpenAPI comments

### Database
- All queries must respect tenant isolation via Row-Level Security policies
- Use parameterized queries; never interpolate user input into SQL
- Run migrations with the pnpm migration tool; never modify production schema manually

## Security Requirements

- **Zero Trust:** Validate every request; never trust network location
- **Tenant Isolation:** All database queries must include a `tenant_id` filter enforced by RLS
- **Least Privilege:** Assign only required Microsoft Graph API permissions per service
- **Input Validation:** Validate all inputs with Zod at API boundaries
- **Secrets Management:** Never commit secrets; use environment variables and Azure Key Vault
- **Audit Logging:** Log all security-relevant events (auth, access, mutations) via the `logger` package
- **Authentication:** All internal service-to-service calls must use Entra ID managed identity tokens

## Compliance Context

The platform supports the following compliance frameworks:
- **CIS Controls v8** (primary scoring baseline)
- **PIPEDA** (Canadian federal privacy law)
- **Quebec Law 25** (provincial privacy law)
- **Microsoft Zero Trust** framework
- **FSI** (Financial Services Industry)
- **MISA** (Microsoft Intelligent Security Association)

When implementing scoring or compliance logic, map features to CIS Controls v8 using the mappings in `plans/COMPLIANCE_FRAMEWORK_MAPPING.md`.

## Testing Guidelines

- **Unit tests:** Test all service-layer functions in isolation with mocked dependencies
- **Integration tests:** Test all API routes end-to-end using Supertest (backend) or React Testing Library + MSW (frontend)
- **Coverage target:** ≥ 80% line coverage for all new code
- **Test file location:** Place test files in a `tests/` directory adjacent to `src/`, mirroring the source structure
- **Naming convention:** `<module>.test.ts` for unit tests, `<module>.integration.test.ts` for integration tests

## Environment Variables

Each service reads its config from environment variables. Always document new variables in the service's `.env.example` file. Required variables per service:

- `DATABASE_URL` — PostgreSQL connection string
- `ENTRA_TENANT_ID` — Microsoft Entra ID tenant ID
- `ENTRA_CLIENT_ID` — Service principal / app registration client ID
- `ENTRA_CLIENT_SECRET` — Service principal secret (use Key Vault reference in production)
- `AZURE_OPENAI_ENDPOINT` — Azure OpenAI endpoint (ai-service only)
- `AZURE_OPENAI_API_KEY` — Azure OpenAI API key (ai-service only)
- `APP_INSIGHTS_CONNECTION_STRING` — Application Insights connection string

# Core Backend Service

Port: **3003**

## Overview

The core-backend service provides security assessment and scoring functionality for CloudMatrix. It acts as the orchestration layer that:
1. Fetches Microsoft Secure Score data from graph-proxy
2. Computes risk levels and improvement scores using CIS Controls v8 thresholds
3. Fetches security recommendations from graph-proxy
4. Returns combined assessment data for tenant security analysis

## Architecture

```
┌─────────────┐
│             │
│   Client    │
│             │
└──────┬──────┘
       │
       │ GET /assessment/:tenantId
       │
       ▼
┌─────────────────────────────────────┐
│     Core Backend (Port 3003)        │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  GraphProxyClient            │  │
│  │  - getSecureScore()          │  │
│  │  - getRecommendations()      │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Scoring Service             │  │
│  │  - buildAssessment()         │  │
│  │  - calculateRiskLevel()      │  │
│  │  - calculateOpportunityScore │  │
│  └──────────────────────────────┘  │
└─────────────┬───────────────────────┘
              │
              │ HTTP calls
              │
              ▼
┌─────────────────────────────────────┐
│     Graph Proxy (Port 3002)         │
│                                     │
│  - GET /tenants/:id/secure-score   │
│  - GET /tenants/:id/recommendations│
└─────────────────────────────────────┘
```

## Key Constraints

1. **No Direct Graph Calls**: Core-backend must NEVER call Microsoft Graph APIs directly. All Graph API access goes through graph-proxy.
2. **Tenant Isolation**: All operations are scoped to a specific tenant ID.
3. **Security First**: All inputs validated, all operations logged.

## API Endpoints

### GET /assessment/:tenantId

Generates a complete security assessment for a tenant.

**Request:**
```
GET /assessment/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "data": {
    "score": 61,
    "riskLevel": "Medium",
    "recommendations": [
      {
        "id": "mfa-required-for-admins",
        "category": "Identity",
        "title": "Require MFA for administrative roles",
        "implementation_cost": "Low",
        "user_impact": "Medium",
        "threats": ["Credential Theft", "Account Takeover"],
        "score_in_percentage": 8.5,
        "remediation_impact": 34
      }
    ],
    "assessment": {
      "id": "5b1fbe0c-fac3-4d52-8f51-97bee36b0758",
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
      "secure_score_raw": 245,
      "secure_score_max": 400,
      "security_percentage": 61,
      "risk_level": "Medium",
      "opportunity_score": 39,
      "lead_rank": "Warm",
      "assessed_at": "2026-04-16T08:01:00.432Z"
    }
  },
  "error": null,
  "meta": {
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "assessed_at": "2026-04-16T08:01:00.432Z",
    "recommendation_count": 3
  }
}
```

**Risk Level Thresholds (CIS Controls v8):**
- **Low**: ≥ 80% security score
- **Medium**: 50-79% security score
- **High**: < 50% security score

**Lead Ranking:**
- **Hot**: High risk + opportunity score ≥ 50
- **Warm**: Medium risk
- **Cold**: Low risk

## Project Structure

```
apps/core-backend/
├── src/
│   ├── server.ts              # Express app entry point
│   ├── config.ts              # Configuration loader
│   ├── routes/
│   │   ├── assessment.ts      # GET /assessment/:tenantId
│   │   ├── assessments.ts     # Legacy POST endpoint (Phase 1)
│   │   └── health.ts          # Health check endpoint
│   └── services/
│       ├── graphProxyClient.ts # HTTP client for graph-proxy
│       └── scoring.ts          # Scoring and risk calculation logic
├── package.json
└── tsconfig.json
```

## Environment Variables

```bash
CORE_BACKEND_PORT=3003
GRAPH_PROXY_URL=http://localhost:3002
IDENTITY_SERVICE_URL=http://localhost:3001
POSTGRES_URL=postgresql://user:pass@localhost:5432/cloudmatrix
AUTOMATION_SERVICE_URL=http://localhost:3004
AI_SERVICE_URL=http://localhost:3005
APP_INSIGHTS_CONNECTION_STRING=InstrumentationKey=...
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck

# Run tests
pnpm test
```

## Testing

Integration test verifies:
1. Graph-proxy connectivity
2. Secure Score retrieval
3. Recommendations retrieval
4. Scoring logic execution
5. Response structure compliance

Run the test:
```bash
/tmp/test-core-backend.sh
```

## Dependencies

- **@cloudmatrix/logger**: Structured logging
- **@cloudmatrix/observability**: Telemetry and monitoring
- **@cloudmatrix/shared-types**: Shared TypeScript types
- **express**: Web framework
- **zod**: Schema validation
- **uuid**: UUID generation

## Compliance Mapping

The scoring logic maps to:
- **CIS Controls v8**: Primary security baseline
- **PIPEDA**: Canadian federal privacy law
- **Quebec Law 25**: Provincial privacy requirements
- **Microsoft Zero Trust**: Framework alignment

See `plans/COMPLIANCE_FRAMEWORK_MAPPING.md` for detailed mappings.

# automation-service

**Phase 1 Implementation**: Control-plane logic for remediation action execution.

## Overview

The automation-service receives requested remediation actions and decides whether to:
1. Auto-execute
2. Require approval
3. Deny due to permissions/plan limitations

**Important**: Phase 1 simulates all execution. No real Microsoft tenant modifications occur.

## Endpoints

### GET /health

Returns service health status.

**Response**:
```json
{
  "data": {
    "status": "ok",
    "service": "automation-service",
    "version": "0.1.0",
    "timestamp": "2026-04-16T22:00:00.000Z"
  },
  "error": null
}
```

### POST /execute-action

Evaluates and executes (simulated) remediation actions based on entitlement tier and risk level.

**Request**:
```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "actionType": "enable_mfa",
  "riskLevel": "low",
  "requestedBy": "admin@example.com"
}
```

**Supported Action Types**:
- `enable_mfa` — Enable MFA for all users
- `tighten_conditional_access` — Strengthen conditional access policies
- `disable_legacy_auth` — Disable legacy authentication protocols
- `rotate_admin_review` — Trigger admin privilege review
- `isolate_device` — Isolate compromised device

**Risk Levels**: `low`, `medium`, `high`

**Response**:
```json
{
  "data": {
    "status": "executed",
    "actionId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
  },
  "error": null
}
```

**Status Values**:
- `executed` — Action was auto-executed
- `pending_approval` — Action requires manual approval (high-risk on Elite tier)
- `denied` — Action denied due to entitlement tier limitations

## Entitlement Tier Rules

| Tier   | Low Risk | Medium Risk | High Risk      |
|--------|----------|-------------|----------------|
| Free   | ❌ Deny  | ❌ Deny     | ❌ Deny        |
| Core   | ✅ Allow | ❌ Deny     | ❌ Deny        |
| Pro    | ✅ Allow | ✅ Allow    | ❌ Deny        |
| Elite  | ✅ Allow | ✅ Allow    | ⏳ Approval Required |

## Architecture

```
src/
  routes/
    actions.ts          — POST /execute-action endpoint
    health.ts           — GET /health endpoint
    events.ts           — POST /events (automation events)
  services/
    policyEngine.ts     — Entitlement & risk evaluation logic
    executor.ts         — Simulated action execution
    auditLog.ts         — Structured audit logging
  types.ts              — TypeScript type definitions
  config.ts             — Configuration loader
  index.ts              — Express server setup
```

## Phase 2 Roadmap

Future enhancements will include:
- **Real Microsoft Graph API integration** for actual tenant modifications
- **Approval workflow queue** with admin consent UI
- **Rollback system** for failed or reverted actions
- **Database persistence** for audit logs and compliance tracking
- **Teams/Email notifications** for approval requests
- **Retry logic** with exponential backoff

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

# Start production server
pnpm start
```

## Environment Variables

See `.env.example` for required configuration:

- `AUTOMATION_SERVICE_PORT` — Port number (default: 3004)
- `APP_INSIGHTS_CONNECTION_STRING` — Azure Application Insights connection string

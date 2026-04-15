# identity-service

Foundation authentication and authorization service for SecurePulse/CloudMatrix.

**Port:** 3001

## Purpose

The identity-service provides **authentication-only** functionality:
- JWT validation for Microsoft Entra ID tokens
- Role extraction from tokens
- Tenant context extraction from tokens
- User information endpoint

## Architecture Constraints

Following MASTER_SPEC.md and PERMISSION_MODEL.md:
- **NO business logic** — only authentication and token validation
- **NO Microsoft Graph calls** — all Graph interactions go through graph-proxy
- **NO tenant management** — that belongs in core-backend
- **NO direct actions** — only validates and extracts authentication context

## Routes

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "data": {
    "status": "ok",
    "service": "identity-service",
    "version": "0.1.0",
    "timestamp": "2026-04-15T08:00:00.000Z"
  },
  "error": null
}
```

### `GET /me`
Returns authenticated user information from JWT token.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Response:**
```json
{
  "data": {
    "user_id": "00000000-0000-0000-0000-000000000000",
    "email": "user@example.com",
    "role": "Analyst",
    "tenant_id": "tenant-uuid"
  },
  "error": null
}
```

**Errors:**
- `401 Unauthorized` — Missing, invalid, or expired token

## File Structure

```
src/
├── server.ts              # Express server setup
├── config.ts              # Environment configuration
├── middleware/
│   └── auth.ts           # JWT validation middleware
├── routes/
│   ├── health.ts         # Health check route
│   └── me.ts             # User info route
└── types/
    └── auth.ts           # Authentication types
```

## Middleware

### `requireAuth`
Validates Microsoft Entra ID JWT tokens and attaches claims to the request object.

```typescript
app.use(requireAuth);
```

### `requireRole(role)`
Enforces role-based access control with hierarchical permissions:
- `Sales` < `Analyst` < `Admin`

```typescript
app.get('/admin-only', requireAuth, requireRole('Admin'), handler);
```

## Configuration

Environment variables (see `.env.example`):

- `IDENTITY_SERVICE_PORT` — Port to listen on (default: 3001)
- `TENANT_ISSUER` — Microsoft Entra ID issuer URL
- `API_AUDIENCE` — Expected JWT audience
- `ENTRA_CLIENT_ID` — Azure AD client ID
- `ENTRA_TENANT_ID` — Azure AD tenant ID
- `APP_INSIGHTS_CONNECTION_STRING` — Application Insights (optional)

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Build shared packages first
pnpm -r --filter "@cloudmatrix/*" run build

# Run in development mode
cd apps/identity-service
pnpm dev

# Build
pnpm build

# Run production build
pnpm start
```

## Dependencies

### Workspace Packages
- `@cloudmatrix/auth-utils` — JWT validation utilities
- `@cloudmatrix/logger` — Structured logging
- `@cloudmatrix/shared-types` — Shared TypeScript types

### External Packages
- `express` — HTTP server
- `zod` — Schema validation
- `uuid` — UUID generation

## Logging

All logs are JSON-structured and written to stdout/stderr:

```json
{
  "level": "info",
  "message": "identity-service listening on port 3001",
  "service": "identity-service",
  "timestamp": "2026-04-15T08:00:00.000Z"
}
```

## Testing

JWT validation is handled by `@cloudmatrix/auth-utils`. In development without Entra configured, authentication is skipped.

## Future Enhancements

Phase 2+ may add:
- Token refresh endpoint
- Service-to-service authentication
- Multi-tenant token validation
- Rate limiting per tenant

# Identity service

`GET /health` is public. `GET /me` requires a validated SecurePulse application
access token and returns `{ data: { user_id: oid, tenant_id: tid }, error: null }`.
The canonical user key is the pair `(tenant_id, user_id)`, never email or UPN.

The shared validator checks signature, time validity, v2 workforce issuer/tenant
and signing-key issuer, API audience, immutable claims and the configured delegated
scope. Authentication failures return 401; missing API scope returns 403.
No mock identity or authentication bypass is available in any environment.

Required environment: `TENANT_ISSUER`, `API_AUDIENCE`, `API_REQUIRED_SCOPE`.
The port defaults to 3001 (`IDENTITY_SERVICE_PORT`). `ALLOW_AUTH_BYPASS=true` is
rejected, not a development option. Use offline fixtures for tests instead.

See [PR-01 contract and configuration](../../docs/PR01_IDENTITY_BOUNDARY.md) for
the supported v2 audience/scopes, multitenant issuer relationship, frontend setup,
test commands and intentionally deferred services. No production registration or
permission grant is established by the source configuration examples.

Build with `pnpm --filter identity-service build` after building shared packages.
The core's `pnpm test:security` suite exercises the shared validator and protected
core routes. The identity service does not claim a separate Jest suite.

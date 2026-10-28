# PR-01: Entra identity and tenant authorization

Baseline: `9cce8ee340377262e6ab07ca297bd6b9381a83ef`, still the default branch
when implementation began. Branch: `codex/pr01-identity-tenant-boundary`.
No other repositories are modified. No production service/configuration is used.

## Invariant and supported contract

The verified Entra principal determines the tenant (`tid`) and user (`tid`, `oid`).
Only delegated **v2 workforce access tokens** for the configured SecurePulse API,
with its required scope, are accepted. ID tokens, Graph tokens, app-only/role-only
tokens, consumer accounts, v1 tokens and missing configuration fail closed.
No anonymous or mock Admin mode exists in the server identity boundary.

`jsonwebtoken` continues to perform signature, algorithm, issuer, audience and
time verification. Required `exp`, `nbf`, `iat`, `tid`, `oid`, `ver` and `scp` are
checked explicitly. Only RS256 is accepted. No expiration tolerance is added.
For multitenant configuration, the GUID tenant and the exact issuer must match.
The signing key's Entra `issuer` extension must match that same issuer, after
expanding `{tenantid}` if applicable. Unverified claims can select an expected
issuer **string**, never a network destination or authorized tenant context.

The existing `jwks-rsa` client fetches only the fixed Microsoft global-cloud
organizations JWKS endpoint with a five-second timeout, bounded key cache and
rate limiting. A small subclass preserves the issuer extension on the **same
cached key** (the library's default conversion drops it). Node imports the public
JWK; no custom cryptographic signature verification or new dependency is added.
The explicit fetcher/validator parameters are local test seams; no environment
setting or HTTP input can activate fixtures. Sovereign clouds and custom signing
key/claims-mapping app policies are not supported by this contract.

Core authentication precedes JSON parsing and business dispatch. Only `/health`
is intentionally public. All core business routes require authentication and
scope; tenant path parameters are checked at router entry before handlers.
`tenantId`, `tenant_id`, `tid`, `tenant`, and Entra tenant aliases in bodies and
queries (including nested/duplicate shapes), plus documented tenant headers,
are consistency checks only. Unknown fields are not authorization inputs.
Handlers use the verified context instead of the request's tenant value.
The refresh path also refuses an upstream score attributed to a different tenant.

Unauthenticated requests receive 401, missing scope and tenant mismatches receive
403. Error messages never echo credentials. Touched refresh/error logging no
longer emits scores, risk/lead results or raw upstream error text.

## Configuration — no Entra registration changes in this PR

Configure both core and identity service using:

| Variable | Required value |
|---|---|
| `TENANT_ISSUER` | `https://login.microsoftonline.com/{tenantid}/v2.0` for workforce multitenancy, or an exact tenant GUID issuer for a single tenant |
| `API_AUDIENCE` | API registration's application/client **GUID**, the v2 `aud`; not `api://...`, the SPA client ID, or Microsoft Graph |
| `API_REQUIRED_SCOPE` | Exact exposed delegated scope value in the access token's `scp` |

The old frontend requested `user_impersonation`, so the example retains that
existing name. There is no silent scope default: the actual API registration must
expose/authorize the selected value. Its access-token version must be 2. The
application-side configuration is implemented; real registration/grants remain
unverified and are a later configuration task, not a reason to request secrets.
`ALLOW_AUTH_BYPASS=true` is rejected in every environment, including development.

Frontend:

| Variable | Value |
|---|---|
| `VITE_ENTRA_CLIENT_ID` | SPA application ID |
| `VITE_ENTRA_TENANT_ID` | Optional authority tenant; defaults to `organizations` |
| `VITE_API_SCOPE` | Explicit `api://<API application GUID>/<exposed delegated scope>` |
| `VITE_CORE_API` | Trusted core API origin; use HTTPS outside local development |

Use separate SPA and API registration IDs. No Graph scopes are requested by this
change. The same initialized MSAL instance performs sign-in and per-request
application access-token acquisition. Interactive reauthorization requests the
same API scope only when MSAL reports interaction required. The fetch wrapper
uses `accessToken`, never `idToken`, and denies redirects rather than forwarding
credentials to another endpoint. Failed acquisition makes no core request.

Redirect sign-in establishes MSAL's active account. Both dashboard tenant selection
and API acquisition use the same cached-account selector. An ambiguous cache with
no active selection shows sign-in rather than a dashboard that cannot authenticate;
the sign-in request explicitly prompts for account selection. Stale selections and
tenant profiles that disagree with the selected account are rejected.

Missing frontend identity configuration displays an unavailable message instead
of silently entering the mock application. An explicit `VITE_ENABLE_DEMO=true`
works only with Vite development mode. The existing public `/preview` remains a
sample UI; neither it nor local mocks authorize backend access.

The identity `/me` response preserves `user_id` and `tenant_id` keys, now derived
from `oid` and `tid`. Mutable email/custom role fields were removed from that
response because they are not required identity claims. No caller in this repo
uses those removed fields. Tenant-wide access to the scoped core routes is the
PR-01 contract; fine-grained per-user/operator roles are not invented here.

## Validation

After installing locked dependencies, run:

```sh
pnpm --filter=./packages/** build
pnpm -r typecheck
pnpm -r build
pnpm test:security
```

Core uses Node 20's built-in test runner on compiled source: the preexisting
`test: jest` script had no installed Jest or tests. This avoids adding a test
framework. Frontend uses its existing Vitest dependency. CI now runs both after
building. There is no lockfile dependency upgrade: core only links the existing
auth-utils workspace package.

Tests sign local tokens and feed a local JWKS through the real key conversion,
cache and validator. A loopback Express server uses the real protected routes.
Spies count every real business-handler entry and storage/Graph-adapter call;
every negative authorization case asserts zero. Outbound collection and event
calls are stubbed. Tests include the 18 requested negative/positive cases,
both cross-tenant directions, all seven routes, ID/Graph token confusion, scope,
key issuer, time/claim failures, unsafe config, cache behavior, and distinct
two-tenant histories. Frontend tests cover scope selection, access-token usage,
denial, missing token/account, and no anonymous or Graph fallback.

No live login, customer data or remote identity provider is required by tests.
Passing tests do not verify app registrations or deployed production behavior.

## Remaining risks and next dependency

PR-01 deliberately does not protect Graph proxy, AI, automation or future report
services; they must not be exposed to customers on the strength of this PR.
The core still uses an in-memory store, mock Graph data and heuristic scoring.
Frontend recommendations still have a legacy mock fallback; this is a later
evidence-integrity task, not authorization. No real collection, consent, RLS,
commercial, Partner Center, reporting or deployment implementation is included.
Tokens remain usable until expiry; revocation/continuous-access evaluation and
durable consent lifecycle need subsequent work. The required delegated scope
does not establish a paid service entitlement or an operator-wide cross-tenant
role. UI display names never do so either.

Next dependency: durable tenant/principal/consent records and tenant-scoped
storage, with two-tenant and pooled-connection isolation tests. Protect other
service boundaries before exposing them. Do not begin that work in PR-01.

## Authoritative sources and audit reference

- [Microsoft access-token validation](https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens)
- [API scopes and roles](https://learn.microsoft.com/en-us/entra/identity-platform/scenario-protected-web-api-verification-scope-app-roles)
- [ID tokens are not API credentials](https://learn.microsoft.com/en-us/entra/identity-platform/id-tokens)
- [MSAL access-token acquisition](https://learn.microsoft.com/en-us/entra/msal/javascript/browser/acquire-token)
- Essential-Oils `66e8f8b0f015a212bd68480dac9d9ffcaeb3e714`,
  `src/api/__tests__/authorization.test.ts` and `src/api/security/middleware.ts`
  were read as reference patterns for denial-before-handler and explicit context.
  No Phyto code, schema or dependencies were transplanted.

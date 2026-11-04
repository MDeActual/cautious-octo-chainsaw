# SecurePulse MVP implementation handoff

This is a reviewable pilot built from PR #41, not a declaration of production readiness. PR #42's assessment-first blueprint is retained; the November 4 user direction adds direct package discovery and an optional guided purchase path. No remote branch was overwritten, merged, or deployed.

## Run locally

Use the repository's pinned pnpm 8.15.0 and Node 20 or newer:

1. `pnpm install --frozen-lockfile`
2. `pnpm --filter=./packages/** build`
3. `pnpm -r typecheck && pnpm -r build`
4. `pnpm test:security`
5. `pnpm --filter frontend dev --host 127.0.0.1`

The public experience renders without credentials. This does not grant access to customer findings or enable collection. Do not expose the legacy proxy, AI, identity or automation services publicly merely because the frontend is running.

## Deployment and founder decisions still required

- A controlled CloudMatrix tenant, approved API and SPA registrations, appropriate admin consent and security-reader user, a server credential, and explicit authorized member mapping.
- Hosting, secret handling, encrypted data volumes, retention/deletion policy, backups, operational monitoring, and production persistence. The pilot file store is single-process only and is not PostgreSQL RLS or a production multi-instance design.
- Approved service catalog, prices/currency, recurring commitment, exclusions, prerequisites, contracts, payment configuration and onboarding. Until then no live purchase or invented package promise.
- Original proprietary responsibility/risk rules if different from recovered public prototype content. UI controls do not alter legal obligations.
- Customer-specific TEI input assumptions; the report's historical US composite is not a Canadian service quote or SecurePulse guarantee.
- Live two-tenant checks, real Graph responses, Conditional Access cases, consent denial/revocation and end-to-end deployment testing.

## Agent coordination

The build uses a dedicated branch and disjoint frontend/backend ownership. Before resuming, inspect current git status and remote heads; do not overwrite another worker's changes. GitHub-visible state cannot prove the absence of unpushed work elsewhere.

## Validation in the build environment

- Installed the unchanged lockfile with pinned pnpm 8.15.0; build host Node 24.22.1 (CI targets Node 20).
- Full workspace typecheck and production build passed.
- Offline suite: 50 backend tests and 28 frontend tests passed. Fixtures cover membership, tenant boundaries, live-adapter request shape, disconnect races, invalid/missing telemetry, and TEI report reproduction. No live customer tenant was contacted.
- Existing lint script could not run: ESLint executable/configuration is absent from the baseline. This is not a lint pass.
- Rendered/browser QA is not verified: local Chromium failed its process socket startup in this environment, and the cloud browser could not reach the local Vite host. A working private preview host or connected development environment is needed for visual and end-to-end sign-in QA.
- No public deployment, permission grant, customer message, payment, or merge was performed.

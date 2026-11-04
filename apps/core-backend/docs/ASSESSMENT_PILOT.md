# Read-only assessment pilot

The new `/assessment-evidence/:tenantId` API returns source-labelled Microsoft Graph evidence. Legacy `/assessments`, `/compliance`, and `/leads` endpoints return HTTP 410, not mock data, guessed regulatory compliance, or inferred purchase intent.

## Boundaries

Every private route first validates the incoming SecurePulse API access token, tenant selectors, and an explicit `ASSESSMENT_MEMBERS` entry containing the verified `tid:oid`. Possession of a delegated API scope alone is not membership. The pilot membership list is operator-managed configuration; it cannot be self-granted through an HTTP endpoint. Restart after membership changes. Current/history access is shared only among explicitly authorized and connected members of that tenant.

The confidential API exchanges the verified user assertion using OAuth OBO against that token's verified tenant, requesting only delegated `SecurityEvents.Read.All`. Graph tokens and assertions remain in request memory and are never written to findings or logs. The token endpoint and two Graph resource URLs are fixed. An API application credential and tenant administrator consent must be provided separately through approved setup. No registration, grant or permission is created by this code. A certificate/MSAL-backed adapter should replace the simple secret-based pilot adapter before production credential hardening.

## Routes

- GET `connection`: configuration/storage readiness and per-account app connection state.
- POST `connect`: performs the first authorized Graph read, persists results, and enables app-local access. This does not grant Microsoft consent.
- POST `refresh`: collects again only while the account is connected.
- GET `current` or `history`: reads only when that member is connected.
- POST `disconnect`: blocks collection and stored-result access for this account and invalidates an in-flight collection. It does not revoke tenant admin consent or erase retained findings. Microsoft grant revocation is a separate administrative action.

Secure Score is not a breach probability, legal compliance verdict, or estimate of buying intent. Control profiles are joined to current score control observations where exact identifiers match, then sorted by validated point gap. Missing or invalid observations remain null. A point gap is not a breach probability or financial impact. The pilot takes the newest timestamp among up to 100 returned scores and up to 100 control profiles; it does not yet traverse Graph pagination. Missing/invalid scores fail explicitly rather than becoming zero. Conditional Access or consent/role challenges return an actionable denied state, without logging or echoing raw upstream responses. Automated claims-challenge handling remains a live-integration task.

## Storage and production limits

Set `ASSESSMENT_DATA_DIR` to an absolute path on a private encrypted volume with mode 0700. The pilot uses synchronous, atomic, mode-0600 tenant-separated JSON files and retains the latest 30 evidence records per tenant, plus per-account connection state. No path is selected by arbitrary request text. Storage remains disabled when the path is absent. This is durable for one process on one volume, **not** Postgres/RLS or a horizontally scalable transactional store. Encryption, backups, retention policy, multi-instance concurrency, hosted identity setup and live CloudMatrix testing are release gates. Do not publicly expose this pilot as production-ready.

Tests use injected validators/collectors or ephemeral signing fixtures and temporary local directories. No customer or Microsoft tenant is contacted.

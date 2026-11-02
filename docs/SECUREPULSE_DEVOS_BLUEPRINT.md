# SecurePulse + DevOS operating blueprint

Date: 2026-11-02 | Status: proposed operating baseline for review

## Purpose and customer promise
CloudMatrix will offer a self-service way for businesses to understand and purchase MSP/MSSP services, with an AI guide and optional human assistance. Education and demonstrations remain accessible without a marketing form. An explicitly authorized Microsoft tenant connection earns useful, personalized findings before any sales commitment. Authentication is not marketing consent. The assessment remains useful even if the prospect never buys.

## First deployable release — fixed scope
A controlled prospect pilot: learn what the assessment offers → sign in → obtain the necessary tenant authorization → collect real Microsoft security data → explain gaps and recommended actions in plain English/French → present a clearly scoped next service and indicative pricing approved by the founder.

Acceptance: a permitted test tenant completes this journey on the hosted site; another tenant cannot access its results; denied consent, insufficient permissions and missing data produce honest states; no live assessment silently substitutes mocks. Show source and collection time. Show a 30-day trend only from available dated records, explicitly label partial history, and show peer comparisons only when returned and meaningful. Do not represent Secure Score as breach probability, certification, or a complete compliance/AI-readiness assessment. Unsupported compliance scores, savings and comparisons are not launch claims.

Later increments: full online purchasing and automated onboarding, grant eligibility assistance and compliant quoting, broader compliance coverage, partner resale and managed remediation. Funding approval is never promised. These do not expand PR 41.

## Verified starting point and immediate gaps
PR 41 (`codex/pr01-identity-tenant-boundary`, head `68c5c7e`) implements the application identity/tenant boundary. Observed CI passed; the earlier account-selection review thread remained unresolved and outdated at inspection. No merge or deployment is established. Its documentation identifies mock Graph data, in-memory storage and missing collection/consent lifecycle work. DashboardPage.tsx already composes score, trend, recommendation and remediation components, but contains a mock recommendation fallback. Component presence is not proof of live data.

Root README and `.github/copilot-instructions.md` specify conflicting stacks. Reconcile instructions against actual code before agent implementation. Preserve the existing React/Vite and Express implementation for this release unless a documented blocker warrants a founder-approved change. No root AGENTS.md was found on the inspected PR branch; other branches were not exhaustively searched.

## Microsoft alignment — evidence versus interpretation
Official FY27 guidance emphasizes customer conversations, differentiated capabilities and measurable outcomes. Interpretation: lead with Security, expand into AI Business Solutions when supported by customer evidence, and use cloud infrastructure as needed. Alignment does not establish partner designation, incentive, co-sell or Marketplace eligibility.

Sources reviewed: [FY27 partner guidance](https://partner.microsoft.com/en-US/blog/article/reheat-of-MCAPS-start-content-Sept-2026), [FY27 customer conversations](https://microsoftpartners.microsoft.com/), [Secure Score API](https://learn.microsoft.com/en-us/graph/api/security-list-securescores?view=graph-rest-1.0), [control profiles](https://learn.microsoft.com/en-us/graph/api/security-list-securescorecontrolprofiles?view=graph-rest-1.0). Graph documents read permissions separately from SecurePulse sign-in. Validate the chosen consent flow and real tenant access before promising availability. This morning's wider briefing is only partially reverified; restricted partner playbooks and CloudMatrix account eligibility remain unchecked.

## DevOS: internal delivery framework
Every task produces (1) a verified product result and (2) reusable delivery evidence or procedure. Keep reusable operating rules separate from product-specific requirements. DevOS commercialization remains a later hypothesis, not this release's scope.

Orchestrator: maintain one current achievement, dependencies, owner, exit criteria, evidence, blockers and next action. Assign bounded work against explicit interfaces; integrate only verified results. Proposed work roles: identity/consent and collection; customer experience and explanations; independent security/quality review; release operations. These roles are not yet running agents. Parallelize independent tasks, not conflicting edits or dependent authorization changes.

Agent entry point: a future AGENTS.md should reference this blueprint, repository conventions and reconciled architecture. Each assignment specifies inputs, permitted tools/data, branch/files, prohibited actions, tests and handoff evidence. Keep secrets out of prompts, logs and commits. Founder retains commercial commitments, spending, production/customer access approvals, merges and releases unless explicitly delegated.

## Completion gates and change control
1. Close PR 41 review and reconcile agent instructions; obtain merge approval.
2. Prove authorized read-only Microsoft collection in a controlled tenant; implement necessary consent records, tenant-scoped storage and protected service boundaries.
3. Connect real evidence to the existing UI; remove live mock fallbacks and unsupported claims; verify explanations and available history.
4. Verify isolation, consent failure/revocation behavior, missing-data handling and hosted operation; document rollback/support; obtain pilot-release approval.

Target: days to one week for a bounded pilot, conditional on repository audit, tenant/admin access, permissions and hosting readiness—not a delivery guarantee. New announcements enter the backlog unless they change a required API, security obligation or eligibility condition. Other prototypes supply reusable assets only after compatibility review; do not restart the platform. Track verified gate completion, defects and founder interventions rather than agent count.

## Next brick: durable evidence and removal of live mock dependencies
Persistence alone does not make an assessment real: a database can persist sample data. Deliver the storage foundation and prove the real-data path as separate, explicit outcomes.

- **Foundation:** after PR 41 review closure and approved integration, add versioned migrations for tenants, principals, authorization/consent records and assessments; enforce tenant isolation in application and database; record audit events and evidence source, collection time and completeness. Test pooled-connection isolation, restart persistence, idempotent writes and backup/restore before relying on production records. Local consent records describe app state; they do not grant Microsoft permissions.
- **Real collection proof:** configure the actual Entra application registrations and chosen Graph authorization flow with least-privilege read permissions and required administrator consent. SecurePulse API sign-in tokens are not Graph access tokens. In an authorized controlled tenant, obtain Secure Score and applicable control-profile information and compare returned identifiers, timestamps and values with the source. A read-only integration experiment may proceed alongside storage work; customer release waits for both gates. Record missing permissions, unavailable workloads and incomplete history explicitly.
- **Application path:** replace mock collectors on the live path, connect real assessment and recommendation results to the existing UI and eliminate silent sample fallbacks, including DashboardPage.tsx. On collection failure, display unavailable or previously collected data with its date and stale status; do not invent scores, recommendations, compliance progress, savings or history. Keep synthetic fixtures in tests and clearly identified isolated demonstrations.
- **Lifecycle and release evidence:** demonstrate two controlled tenants, denied access between them, revoked/disconnected access stopping new collection, repeat collection without duplicate records, and consistent evidence after service restart. Treat token expiry and external revocation detection as explicit implementation concerns; do not promise instantaneous detection. Define retention/deletion behavior separately from disconnection. Verify the hosted customer assessment end to end before pilot admission.

Exit criterion: a controlled customer can authorize access and receive traceable, real tenant findings through the hosted assessment; no live failure path fabricates results. This section authorizes no tenant configuration, infrastructure purchase, merge or deployment by itself. DevOS records code/test evidence and the reusable collection-and-isolation procedure.

## Customer zero: CloudMatrix verification checklist
CloudMatrix's own Microsoft tenant is the first real assessment target. Its ID, licensing, roles, app registrations and data availability have not yet been verified. This plan does not authorize changes to tenant permissions or create a second tenant.

1. Identify the intended CloudMatrix tenant and authorized administrator. Confirm available Secure Score data and approved hosting/data-retention scope; record non-secret configuration references.
2. Validate the separate SPA/API registrations, API scope and chosen least-privilege Graph read authorization flow. Obtain required administrator consent through Microsoft's supported flow; never request passwords or secrets in chat.
3. Sign in as customer zero and verify the selected account and tenant match the assessment context. Confirm the UI explains requested access and does not imply marketing consent.
4. Collect actual Secure Score and applicable control-profile recommendations. Record source IDs, collection time, source timestamps and missing-data status. Compare like-for-like score values and time periods with Microsoft's view, investigating differences rather than forcing agreement.
5. Show plain-language findings and available dated history. Verify missing permissions/data and upstream failures produce explicit unavailable or stale states, never synthetic replacements. Do not imply compliance certification or guaranteed risk reduction.
6. Refresh and restart the application; confirm persistence, correct tenant ownership and duplicate-safe ingestion. Disconnect customer zero and verify future collection is blocked by the application; separately test handling of externally revoked permissions/token failures. Apply the agreed retention/deletion policy.
7. Record test outcomes, sanitized evidence and unresolved issues. Obtain founder approval before inviting outside prospects.

### Why tenant B exists in testing
A tenant is an organization's Microsoft directory and security boundary. CloudMatrix is tenant A. Tenant B represents an unrelated organization whose records must remain inaccessible to A, and vice versa. A second user inside CloudMatrix is not a second tenant.

Automated fixtures can model two tenants and test API/database isolation, including malicious tenant-ID substitution, histories, caches and pooled connections. These are necessary engineering tests but do not prove live Entra/Graph configuration across two real organizations. When an authorized separate test tenant is available, run the same hosted journey under two real tenant identities, verify legitimate access and cross-tenant denial in both directions, and record that stronger integration evidence. Do not use another customer's environment without permission. A second real tenant is not a prerequisite to the first customer-zero read-only connection; the remaining live multitenant validation must stay explicit in prospect-release readiness.

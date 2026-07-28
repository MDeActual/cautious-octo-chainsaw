# PROJECT_IDENTITY.md

## Product

**SecurePulse by CloudMatrix Business Solutions**

---

## What It Is

SecurePulse is a Microsoft-native, AI-assisted security operations and compliance platform for small-to-medium businesses (SMBs) in Canada. It connects to Microsoft 365 tenants via Graph API and surfaces automated security posture assessments, CIS Controls v8 compliance mapping, AI-generated executive summaries, remediation prioritization, and Copilot for Microsoft 365 readiness scoring.

It is built as a monorepo of TypeScript microservices running on Azure, authenticated via Microsoft Entra ID, and designed for MSSP (Managed Security Service Provider) operating workflows.

---

## What It Does

| Capability | Description |
|---|---|
| Security Assessment | Pulls Microsoft Secure Score, normalizes it to a percentage, determines risk level (Low/Medium/High), and ranks prospects (Hot/Warm/Cold) |
| CIS Controls v8 Mapping | Maps Secure Score control profiles to CIS v8 controls, produces compliance percentage per framework |
| AI Executive Summaries | Generates plain-language security summaries via Azure OpenAI (GPT-4) or mock mode |
| Recommendation Prioritization | Ranks remediation actions by score impact, implementation cost, and business risk |
| Copilot Readiness Assessment | Scores M365 tenants on their readiness to deploy Microsoft Copilot for Microsoft 365 |
| Defender Signal Ingestion | Pulls active Defender XDR incidents and Entra ID risky users into the assessment context |
| Customer Portal | Read-only portal for end-customer tenants to view their own security posture |
| CSP Attribution Reporting | Aggregates per-tenant usage for Microsoft CSP incentive reporting |
| AI Transparency Panel | Shows per-tenant AI usage history, model version, guardrails applied, and data sources used |
| Automation Notifications | Event-driven alerts via Microsoft Teams webhooks and email |

---

## Who It's For

**Primary users (internal — Phase 1):**
- CloudMatrix Sales team: uses lead rank and opportunity scores to prioritize outreach
- CloudMatrix Analysts: uses assessment details, CIS gaps, and remediation plans for client engagements
- CloudMatrix Admins: manages tenants, users, and platform configuration

**Secondary users (external — Phase 2, now live):**
- Customer role: read-only access to their own tenant's posture dashboard

**Target customer segment:**
- SMBs in Canada with Microsoft 365 Business Premium or E3/E5
- Industries: financial services, healthcare, professional services, regulated SMBs
- Compliance drivers: PIPEDA, Quebec Law 25, CIS v8, Microsoft Zero Trust

---

## Current State

**Stage: MVP/demo-stage transitioning to commercialization-stage.**

Core infrastructure is operational:
- All six services scaffold complete and running (identity, graph-proxy, core-backend, ai-service, automation-service, frontend)
- Microsoft Entra ID MSAL auth integrated (real, not mock)
- Microsoft Graph Secure Score pull working (pending live credentials)
- Defender signal ingestion built (pending live credentials)
- CIS Controls v8 mapping implemented
- AI summaries working in mock mode; Azure OpenAI path built
- Copilot readiness scoring implemented
- Customer portal built (Phase 2 feature, delivered early)
- CSP attribution reporting built
- AI transparency panel built
- Copilot plugin manifest authored (not yet registered in Security Copilot)
- AppSource listing: not yet submitted

What is NOT done:
- Live Microsoft Graph credentials for demo environment
- AppSource / Partner Center listing submission
- Security Copilot plugin registration
- Production database (Neon PostgreSQL with RLS — schema ready, not deployed)
- Azure Bicep infra deployment (IaC written, not applied)

---

## Key Differentiators

1. **Microsoft-native, Azure-first** — Built entirely on Microsoft stack. No third-party identity. No off-cloud AI. Graph is the only data source.
2. **Canadian compliance advantage** — Explicitly designed for PIPEDA and Quebec Law 25. Bilingual market opportunity. No US-centric competitor owns this positioning.
3. **MSSP-grade architecture** — Strict tenant isolation, Row-Level Security, audit logging, zero-trust posture, role-based access, service boundaries enforced at code level.
4. **AI transparency** — Every AI output includes model version, guardrails applied, and data sources used. No black-box AI claims.
5. **CSP/MCaps aligned** — Built with Microsoft MCaps 2026 program alignment in mind: Cloud Security Specialization, co-sell readiness, CSP incentive attribution.
6. **Copilot readiness as upsell** — Unique feature that creates a natural upsell path: assess → remediate → become Copilot-ready → upgrade plan.

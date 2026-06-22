# Service Catalog and Shared Responsibility

## Purpose

This document captures the current service-catalog direction implied by uploaded CloudMatrix materials.

It is not a final commercial catalog. It is a strategic draft that organizes the platform around major capability domains and shared responsibility boundaries.

## Core principle

The SecurePulse service catalog should be built from Microsoft capability bundles, especially the flagship Microsoft 365 E7-centered offering, and translated into managed services with clear business outcomes.

The service catalog should not be a random list of disconnected services.

It should express a coherent maturity journey across:

- identity
- security
- data
- compliance
- AI
- agent governance
- managed operations

## Shared responsibility model

CloudMatrix is not intended to replace the customer’s leadership, approvals, or ownership.

Instead, the product and service model should make clear:
- what CloudMatrix manages
- what the customer manages
- where approvals are required
- how compliance, governance, and operational outcomes are shared

## Capability stages from uploaded service material

### 1. Identity Foundation
**Subtitle:** Entra Suite

#### CloudMatrix responsibilities
- secure identity across the organization
- enforce Zero Trust architecture
- manage Conditional Access, MFA, and privileged access

#### Customer responsibilities
- approve who should have access
- ensure staff follow identity rules and access policies

#### Business outcome
Protect the business from common identity-driven attacks by controlling who gets access.

#### Regulatory alignment examples
- CIS v8 IG1 / IG2
- Law 25 — Access Governance
- PIPEDA — Safeguards

---

### 2. Secure Collaboration
**Subtitle:** SharePoint, OneDrive, Teams

#### CloudMatrix responsibilities
- organize and secure files and collaboration tools
- implement governance and retention policies
- prevent accidental data leaks

#### Customer responsibilities
- define data ownership
- follow collaboration and sharing guidelines

#### Business outcome
Improve collaboration while reducing accidental exposure and information sprawl.

---

### 3. Baseline Security
**Subtitle:** CIS v8 + Secure Score

#### CloudMatrix responsibilities
- implement Microsoft security baselines
- close Secure Score gaps
- monitor for baseline drift

#### Customer responsibilities
- approve configuration changes
- follow core security practices

#### Business outcome
Deliver a measurable and defensible security baseline.

---

### 4. Extended Defense
**Subtitle:** Defender XDR + Cloud + Servers

#### CloudMatrix responsibilities
- deploy Defender across environments
- investigate alerts and suspicious activity
- automate response playbooks where appropriate

#### Customer responsibilities
- report suspicious behavior
- approve remediation when required

#### Business outcome
Improve threat detection and response maturity without requiring the customer to build a full in-house security team.

---

### 5. Data Management and Compliance
**Subtitle:** Purview + Fabric

#### CloudMatrix responsibilities
- classify and protect sensitive data
- implement compliance policies
- monitor for violations and exposure

#### Customer responsibilities
- define sensitive data expectations
- approve compliance and retention rules

#### Business outcome
Reduce legal, regulatory, and operational exposure by governing sensitive data properly.

---

### 6. AI Enablement
**Subtitle:** Copilot + Custom Agents

#### CloudMatrix responsibilities
- deploy Microsoft Copilot securely
- build custom AI agents and workflows
- establish AI guardrails and governance

#### Customer responsibilities
- approve AI use cases
- train staff on acceptable AI usage

#### Business outcome
Enable productivity gains from AI without sacrificing governance and control.

---

### 7. Agent Governance
**Subtitle:** Agent 365

#### CloudMatrix responsibilities
- monitor AI agents organization-wide
- manage permissions and policy enforcement
- track drift and risk exposure

#### Customer responsibilities
- approve agent roles and scope
- report unexpected or undesirable agent behavior

#### Business outcome
Prevent uncontrolled AI sprawl and keep agentic systems governed over time.

---

### 8. Managed Operations
**Subtitle:** Identity, Security, Data, AI, Agents

#### CloudMatrix responsibilities
- run daily monitoring and operational oversight
- manage governance and optimization
- provide continuous lifecycle support

#### Customer responsibilities
- make strategic business decisions
- approve major changes

#### Business outcome
CloudMatrix runs the platform and managed lifecycle so the customer can focus on running the business.

## Service catalog guidance

As the commercial catalog is finalized, each offering should ideally define:

1. capability domain
2. relevant Microsoft licenses or prerequisites
3. managed service scope
4. customer responsibilities
5. CloudMatrix responsibilities
6. measurable business outcomes
7. compliance/governance alignment
8. upgrade path to adjacent or higher-tier offerings

## Relationship to Microsoft licensing

The catalog should be informed by Microsoft licensing realities.

Important rule:
- service packaging should be grounded in what the underlying Microsoft license enables
- the flagship design center is Microsoft 365 E7
- adjacent licenses should be handled as fit variations, supporting bundles, or extensions

## Product implication

This service model supports both:
- prospect conversion
- long-term managed service delivery

That means the platform recommendation engine should eventually be able to connect:
- observed customer posture
- compliance exposure
- Microsoft capability gaps
- recommended service package
- operational maturity pathway

## MVP note

The production-ish MVP does not need the full final commercial catalog implemented.

However, the architecture and product language should preserve room for:
- E7-centered packaging
- score-based posture recommendations
- compliance-aware service matching
- future AI and agent governance offerings
- future partner / white-label packaging variants

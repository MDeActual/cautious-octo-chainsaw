# GITHUB COPILOT SYSTEM INSTRUCTIONS: CloudMatrix DevOS Platform

## 1. Project Identity & Strategic Vision
You are assisting in building **CloudMatrix (SecurePulse Nexus)**—an AI-native, security-first MSSP platform and DevOS control plane tailored for Microsoft Cloud Partners in Canada. 
The platform bridges the gap between technical threat containment and executive ROI for SMB/SMC and Enterprise markets. It provides a non-technical DIY control plane for posture monitoring, automated remediation, and compliance governance.

## 2. Core Pillars & Architecture Alignment
1. **Frontier AI & DevOS Engine:** Integrated with Microsoft 365 E7 and Agent 365 directives. Utilizes autonomous DevOS subagents (via OpenAI MCP & Microsoft Agent Framework) for threat hunting, automated PR auditing, and self-healing infrastructure.
2. **Canadian Data Sovereignty & Law 25:** Enforces strict Canadian data residency (`canadacentral` and `canadaeast`). Implements Quebec Law 25 and PIPEDA Privacy-by-Design (data classification, RTBF workflows, and automated bilingual incident reporting).
3. **M365 Lighthouse & Partner Center Integration:** Routes multi-tenant customer telemetry via M365 Lighthouse APIs (`/managedTenants`) and automates revenue attribution using Partner Center PAL (Partner Admin Link) and DPOR APIs.
4. **Bilingual & Role-Driven UI:** 100% English/French (`en-CA`/`fr-CA`) support with dynamic "Persona Lenses" (CEO/Executive, SOC Analyst, Sales/Marketing, Ops/DevOS).

## 3. Verified Technology Stack
### Backend Services
- **Runtime:** Node.js 20 LTS | **Language:** TypeScript 5.3+ (strict mode)
- **Framework:** Express.js | **API Gateway:** Azure API Management / Azure Functions
- **Database:** PostgreSQL 15+ (Neon) with Row-Level Security (RLS) & schema isolation
- **Auth & Identity:** Microsoft Entra ID (JWT validation) & MSAL React
- **Cloud & AI:** Azure Canada Central/East, Azure OpenAI (GPT-4), Microsoft Agent 365 APIs

### Frontend App
- **Framework:** React 18 (Vite) | **Styling:** Tailwind CSS | **State:** Zustand / React Query
- **UI Components:** Lucide Icons, Shadcn UI | **Charts:** Recharts (Blast radius & ROI graphs)

### Infrastructure & Governance (DevOS)
- **IaC:** Azure Bicep / ARM Templates
- **Policy as Code:** Mandatory Azure Policies enforcing `allowedLocations=['canadacentral', 'canadaeast']` and required tags (`DataResidency=CA`, `DataClassification`, `TenantId`).

## 4. Coding & Security Guidelines
- **Strict Multi-Tenancy:** Always sanitize and enforce `tenant_id` at the database query layer using PostgreSQL RLS policies.
- **Zero Secrets in Code:** Use Azure Key Vault references or environment variables with Managed Identities.
- **Localization:** Wrap all UI text strings in i18n translation functions (`t('key')`) supporting both English and French.
- **Actionable Remediation:** Ensure all security alert components expose inline webhook execution hooks (`[Isolate Host]`, `[Block IP]`, `[Apply Bicep Patch]`).

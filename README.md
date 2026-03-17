# CloudMatrix MSSP Platform

**AI-Native, Security-First MSSP Platform for Microsoft Cloud Partners**

![Status](https://img.shields.io/badge/status-planning-blue)
![Phase](https://img.shields.io/badge/phase-1%20MVP-green)
![License](https://img.shields.io/badge/license-proprietary-red)

---

## 🎯 Vision

Build Canada's first fully automated, AI-forward MSSP/CSP/MSP platform that establishes CloudMatrix as the emergent leader for small to medium-sized businesses, with a clear path to enterprise market expansion.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS
- pnpm 8+
- PostgreSQL 15+ (or Neon account)
- Azure subscription
- Microsoft Entra ID tenant

### Installation

```bash
# Clone repository
git clone <repo-url>
cd <repo-dir>

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm migrate:up

# Start development servers
pnpm dev
```

---

## 📋 Project Overview

### What is CloudMatrix?

CloudMatrix is an internal MSSP web platform designed to:

- **Assess** Microsoft 365 tenant security posture
- **Normalize** and score security using CIS Controls v8
- **Rank** prospects and opportunities for sales prioritization
- **Automate** internal sales and analyst workflows
- **Generate** AI-powered executive summaries and insights
- **Track** compliance across multiple frameworks

### Key Features

✅ **Automated Security Assessment** - Real-time Microsoft 365 security scoring  
✅ **AI-Powered Insights** - Executive summaries via Azure OpenAI  
✅ **Multi-Framework Compliance** - CIS v8, PIPEDA, Quebec Law 25, Zero Trust, FSI, MISA  
✅ **Lead Ranking** - Hot/Warm/Cold classification based on risk and opportunity  
✅ **Workflow Automation** - Event-driven notifications and task creation  
✅ **Zero Trust Architecture** - Security-first design with tenant isolation  

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│              Beautiful UI + MSAL Authentication              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Identity Service                           │
│           Entra ID JWT Validation + RBAC                     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Graph Proxy  │    │ Core Backend │    │  AI Service  │
│ (MS Graph)   │───▶│  (Scoring)   │    │ (Azure AI)   │
└──────────────┘    └──────────────┘    └──────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Automation       │
                  │ Service          │
                  └──────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │   PostgreSQL     │
                  │   (Neon + RLS)   │
                  └──────────────────┘
```

### Services

| Service | Port | Purpose |
|---------|------|---------|
| **identity-service** | 3001 | Authentication, authorization, tenant management |
| **graph-proxy** | 3002 | Sole Microsoft Graph API boundary |
| **core-backend** | 3003 | Business logic, scoring, compliance |
| **automation-service** | 3004 | Workflow automation and notifications |
| **ai-service** | 3005 | AI-powered insights via Azure OpenAI |
| **frontend** | 5173 | React UI with MSAL authentication |

---

## 📁 Project Structure

```
cloudmatrix-mssp/
├── apps/
│   ├── identity-service/      # Authentication & authorization
│   ├── graph-proxy/            # Microsoft Graph integration
│   ├── core-backend/           # Business logic & scoring
│   ├── automation-service/     # Workflow automation
│   ├── ai-service/             # AI-powered insights
│   └── frontend/               # React UI
├── packages/
│   ├── shared-types/           # Common TypeScript types
│   ├── auth-utils/             # Authentication utilities
│   ├── logger/                 # Logging infrastructure
│   └── observability/          # Monitoring & telemetry
├── infra/
│   ├── bicep/                  # Azure infrastructure as code
│   └── scripts/                # Deployment scripts
├── docs/
│   └── ...                     # Additional documentation
└── plans/
    ├── ARCHITECTURE_PLAN.md              # Complete architecture
    ├── TECHNICAL_SPECIFICATION.md        # Implementation details
    ├── IMPLEMENTATION_ROADMAP.md         # Week-by-week plan
    ├── COMPLIANCE_FRAMEWORK_MAPPING.md   # Compliance mappings
    └── EXECUTIVE_SUMMARY.md              # High-level overview
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 20 LTS
- **Language:** TypeScript 5.3+
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon)
- **Authentication:** Microsoft Entra ID
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS
- **Auth:** MSAL React
- **Charts:** Recharts
- **Testing:** Vitest + React Testing Library

### Cloud Services
- **Hosting:** Azure App Services
- **Database:** Neon PostgreSQL
- **AI:** Azure OpenAI (GPT-4)
- **Identity:** Microsoft Entra ID
- **Monitoring:** Application Insights
- **Security:** Azure Front Door + WAF

---

## 📚 Documentation

### Planning Documents

- **[Executive Summary](plans/EXECUTIVE_SUMMARY.md)** - High-level overview and business value
- **[Architecture Plan](plans/ARCHITECTURE_PLAN.md)** - Complete system architecture (22,000+ words)
- **[Technical Specification](plans/TECHNICAL_SPECIFICATION.md)** - Implementation details (11,000+ words)
- **[Implementation Roadmap](plans/IMPLEMENTATION_ROADMAP.md)** - Week-by-week plan (8,000+ words)
- **[Compliance Framework Mapping](plans/COMPLIANCE_FRAMEWORK_MAPPING.md)** - Detailed compliance mappings (8,000+ words)

### Additional Documentation (Coming Soon)

- API Documentation (OpenAPI/Swagger)
- Deployment Guide
- Developer Setup Guide
- User Guides (Sales, Analyst, Admin)
- Security Documentation
- Troubleshooting Guide

---

## 🔒 Security & Compliance

### Zero Trust Architecture

- **Verify Explicitly** - Microsoft Entra ID + MFA required
- **Least Privilege Access** - RBAC with PIM
- **Assume Breach** - Tenant isolation, encryption, audit logging

### Compliance Frameworks

**Phase 1 (MVP):**
- ✅ CIS Controls v8
- ✅ PIPEDA (Canadian privacy law)
- ✅ Quebec Law 25
- ✅ Microsoft Zero Trust
- ✅ FSI (Financial Services Industry)
- ✅ MISA (Microsoft Intelligent Security Association)

**Phase 2 (Expansion):**
- 📋 GDPR
- 📋 HIPAA / PHIPA
- 📋 FINRA
- 📋 SOC 2 Type II
- 📋 ISO 27001
- 📋 NIST CSF
- 📋 PCI DSS

---

## 🎯 Roadmap

### Phase 1: MVP (12 Weeks)

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1-2 | Foundation | Project setup, shared packages, database |
| 3-5 | Core Services | All 5 microservices functional |
| 6-7 | Frontend | Complete UI with all features |
| 8 | Infrastructure | Azure deployment, CI/CD |
| 9 | Testing & Docs | Comprehensive testing, documentation |
| 10 | Launch Prep | UAT, production readiness, launch |
| 11-12 | Post-Launch | Monitoring, optimization, Phase 2 planning |

### Phase 2: Expansion (TBD)

- Customer portal (external access)
- Advanced compliance frameworks
- Automated remediation workflows
- Custom reporting and exports
- Mobile application
- Partner integrations
- Advanced AI features
- Predictive analytics

---

## 🚦 Getting Started

### For Developers

1. **Read the documentation** - Start with [`EXECUTIVE_SUMMARY.md`](plans/EXECUTIVE_SUMMARY.md)
2. **Review the architecture** - See [`ARCHITECTURE_PLAN.md`](plans/ARCHITECTURE_PLAN.md)
3. **Check the roadmap** - Follow [`IMPLEMENTATION_ROADMAP.md`](plans/IMPLEMENTATION_ROADMAP.md)
4. **Set up your environment** - Follow the installation instructions above
5. **Pick a task** - Check the project board for available tasks

### For Stakeholders

1. **Review the executive summary** - [`EXECUTIVE_SUMMARY.md`](plans/EXECUTIVE_SUMMARY.md)
2. **Understand the business value** - See "Business Value" section
3. **Review the timeline** - 12-week delivery plan
4. **Approve the architecture** - Provide feedback on approach
5. **Confirm resources** - Team, budget, timeline

---

## 📊 Success Metrics

### Technical KPIs
- **Uptime:** 99.9% availability
- **Performance:** < 500ms API response time
- **Security:** 100% on Microsoft Secure Score
- **Error Rate:** < 0.1% of requests
- **Assessment Time:** < 30 seconds per tenant

### Business KPIs
- **User Adoption:** 80% of team using platform within 30 days
- **Time to Onboard:** < 5 minutes per tenant
- **Assessment Accuracy:** > 95% alignment with manual audits
- **Customer Satisfaction:** > 4.5/5 rating
- **Lead Conversion:** Track Hot/Warm/Cold conversion rates

---

## 🤝 Contributing

This is a proprietary project for CloudMatrix. Internal team members should:

1. Follow the Git workflow (feature branches, pull requests)
2. Write tests for all new code
3. Follow the TypeScript style guide
4. Update documentation as needed
5. Get code reviews before merging

---

## 📝 License

Proprietary - CloudMatrix Inc. All rights reserved.

---

## 🆘 Support

For questions or issues:

- **Technical Issues:** Create an issue in the project tracker
- **Architecture Questions:** Contact the lead architect
- **Security Concerns:** Contact the security team immediately
- **General Questions:** Post in the team channel

---

## 🎉 Acknowledgments

- Microsoft Cloud Partner Program
- Azure OpenAI team
- CIS Controls community
- CloudMatrix development team

---

## 📞 Contact

**Project Lead:** Senior Software Engineer  
**Organization:** CloudMatrix Inc.  
**Email:** [Contact via internal channels]  
**Status:** Architecture Complete - Ready for Implementation

---

**Built with ❤️ by the CloudMatrix team**

**Ready to build Canada's leading AI-native MSSP platform.**

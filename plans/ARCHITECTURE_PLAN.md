# CloudMatrix MSSP Platform - Phase 1 Architecture Plan

**Status:** Planning Phase  
**Target:** MVP for AI-Native, Security-First MSSP Platform  
**Compliance:** CIS v8, PIPEDA, Quebec Law 25, Microsoft Zero Trust, FSI, MISA

---

## Executive Summary

CloudMatrix is building Canada's first fully automated, AI-forward MSSP/CSP/MSP platform. This Phase 1 MVP will establish the foundation for an industry-leading security and compliance platform targeting small to medium-sized businesses, with expansion plans into the enterprise market.

### Strategic Positioning
- **First-mover advantage** in Canadian AI-native MSSP market
- **Competitive edge** through automation and AI-driven insights
- **Compliance-first** approach supporting multiple frameworks
- **Microsoft Cloud Partner** specialization in Security, Compliance, and Modern Work

---

## 1. System Architecture Overview

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[React Frontend<br/>TypeScript + Tailwind]
    end
    
    subgraph "Identity & Access"
        ENTRA[Microsoft Entra ID]
        IDS[Identity Service<br/>JWT + RBAC]
    end
    
    subgraph "API Gateway Layer"
        GP[Graph Proxy<br/>Sole Graph Access]
    end
    
    subgraph "Core Services"
        CORE[Core Backend<br/>Scoring + CIS Mapping]
        AUTO[Automation Service<br/>Workflows]
        AI[AI Service<br/>Azure OpenAI]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Neon + RLS)]
    end
    
    subgraph "External"
        GRAPH[Microsoft Graph API]
        OPENAI[Azure OpenAI]
    end
    
    FE -->|Auth| ENTRA
    FE -->|API Calls| IDS
    IDS -->|Validate| CORE
    IDS -->|Validate| AUTO
    IDS -->|Validate| AI
    GP -->|Graph Data| GRAPH
    CORE -->|Query| GP
    CORE -->|Store| DB
    CORE -->|Events| AUTO
    AI -->|Generate| OPENAI
    AUTO -->|Read| DB
    AI -->|Read| DB
```

---

## 2. Service Architecture Details

### 2.1 Identity Service
**Purpose:** Authentication, authorization, and tenant management

**Responsibilities:**
- Microsoft Entra ID JWT validation
- Role-Based Access Control (Sales, Analyst, Admin)
- Tenant registry and lifecycle management
- Tenant context propagation
- Admin consent onboarding flow

**Technology Stack:**
- Node.js + TypeScript
- Express.js
- @azure/msal-node
- JWT validation middleware

**API Endpoints:**
```
POST   /auth/validate          - Validate JWT token
GET    /auth/me                - Get current user info
GET    /tenants                - List accessible tenants
POST   /tenants                - Register new tenant (Admin only)
PUT    /tenants/:id/status     - Update tenant status
GET    /tenants/:id/consent    - Get consent URL
```

**Database Schema:**
```sql
-- Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- trial, active, suspended
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    entra_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- Sales, Analyst, Admin
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.2 Graph Proxy Service
**Purpose:** Sole boundary for Microsoft Graph API access

**Responsibilities:**
- Secure Score ingestion
- Secure Score recommendations retrieval
- Alerts (basic)
- Device compliance (basic)
- Per-tenant rate limiting
- Audit logging
- Managed Identity support

**Technology Stack:**
- Node.js + TypeScript
- Express.js
- @microsoft/microsoft-graph-client
- Rate limiting middleware

**API Endpoints:**
```
GET    /graph/secure-score/:tenantId           - Get current Secure Score
GET    /graph/secure-score/:tenantId/history   - Get historical scores
GET    /graph/recommendations/:tenantId        - Get security recommendations
GET    /graph/alerts/:tenantId                 - Get security alerts
GET    /graph/devices/:tenantId/compliance     - Get device compliance
```

**Security Controls:**
- Managed Identity for Graph authentication
- Per-tenant rate limiting (configurable)
- Request/response audit logging
- Tenant-scoped access validation

---

### 2.3 Core Backend Service
**Purpose:** Security scoring, normalization, and business logic

**Responsibilities:**
- Consume data from graph-proxy only
- Normalize Microsoft Secure Score
- CIS v8 control mapping
- Calculate security metrics:
  - Security percentage
  - Risk level (Low | Medium | High)
  - Opportunity score
  - Lead rank (Hot | Warm | Cold)
- Persist assessment snapshots
- Compute historical trends
- Publish events for automation

**Technology Stack:**
- Node.js + TypeScript
- Express.js
- PostgreSQL client
- Event emitter for automation triggers

**API Endpoints:**
```
GET    /assessments/:tenantId/current          - Get current assessment
GET    /assessments/:tenantId/history          - Get historical assessments
GET    /assessments/:tenantId/trends           - Get trend analysis
POST   /assessments/:tenantId/refresh          - Trigger new assessment
GET    /compliance/:tenantId/frameworks        - Get compliance framework status
GET    /leads/:tenantId/rank                   - Get lead ranking
```

**Scoring Algorithm:**
```typescript
interface SecurityAssessment {
    tenantId: string;
    secureScore: number;
    maxScore: number;
    securityPercentage: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    opportunityScore: number;
    leadRank: 'Hot' | 'Warm' | 'Cold';
    cisControls: CISControlMapping[];
    timestamp: Date;
}

// Risk Level Calculation
// High: < 40% security score
// Medium: 40-70% security score
// Low: > 70% security score

// Lead Rank Calculation
// Hot: High risk + high opportunity (enterprise potential)
// Warm: Medium risk or medium opportunity
// Cold: Low risk + low opportunity
```

**Database Schema:**
```sql
-- Assessments table
CREATE TABLE assessments (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    secure_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    security_percentage DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    opportunity_score DECIMAL(5,2) NOT NULL,
    lead_rank VARCHAR(50) NOT NULL,
    assessment_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CIS Controls Mapping
CREATE TABLE cis_controls (
    id UUID PRIMARY KEY,
    assessment_id UUID REFERENCES assessments(id),
    control_id VARCHAR(50) NOT NULL,
    control_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- compliant, partial, non-compliant
    score DECIMAL(5,2),
    recommendations TEXT[]
);

-- Compliance Frameworks
CREATE TABLE compliance_frameworks (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    region VARCHAR(100),
    industry VARCHAR(100),
    description TEXT,
    controls JSONB NOT NULL
);
```

---

### 2.4 Automation Service
**Purpose:** Workflow automation and event-driven actions

**Responsibilities:**
- Receive events from core-backend
- Evaluate automation rules
- Trigger notifications (Teams, Email)
- Create tasks (Planner)
- Power Automate / Logic Apps integration
- Internal workflow automation

**Technology Stack:**
- Node.js + TypeScript
- Express.js
- Event queue (Redis or Azure Service Bus)
- Microsoft Graph for Teams/Planner

**API Endpoints:**
```
POST   /automation/rules                - Create automation rule
GET    /automation/rules                - List automation rules
PUT    /automation/rules/:id            - Update automation rule
DELETE /automation/rules/:id            - Delete automation rule
POST   /automation/trigger              - Manual trigger
GET    /automation/history              - Get automation history
```

**Automation Rules:**
```typescript
interface AutomationRule {
    id: string;
    name: string;
    trigger: {
        event: 'assessment_complete' | 'risk_level_change' | 'lead_rank_change';
        conditions: {
            riskLevel?: 'High' | 'Medium' | 'Low';
            leadRank?: 'Hot' | 'Warm' | 'Cold';
            threshold?: number;
        };
    };
    actions: {
        type: 'teams_notification' | 'email' | 'planner_task' | 'webhook';
        config: Record<string, any>;
    }[];
    enabled: boolean;
}
```

---

### 2.5 AI Service
**Purpose:** AI-powered insights and executive summaries

**Responsibilities:**
- Generate executive security summaries
- Tenant-scoped analysis
- Sanitized input processing
- Azure OpenAI integration
- Usage logging and audit
- Recommendation prioritization

**Technology Stack:**
- Node.js + TypeScript
- Express.js
- Azure OpenAI SDK
- Token usage tracking

**API Endpoints:**
```
POST   /ai/summary/:tenantId            - Generate executive summary
POST   /ai/recommendations/:tenantId    - Prioritize recommendations
POST   /ai/risk-analysis/:tenantId      - Generate risk analysis
GET    /ai/usage                        - Get AI usage metrics
```

**AI Prompts:**
```typescript
// Executive Summary Prompt Template
const EXECUTIVE_SUMMARY_PROMPT = `
You are a cybersecurity analyst for an MSSP. Generate an executive summary 
for a client's security posture based on the following data:

Tenant: {tenantName}
Security Score: {secureScore}/{maxScore} ({percentage}%)
Risk Level: {riskLevel}
Top Vulnerabilities: {topVulnerabilities}
CIS Controls Status: {cisStatus}

Provide:
1. Overall security posture assessment
2. Top 3 critical risks
3. Recommended immediate actions
4. Business impact summary

Keep it concise, executive-friendly, and actionable.
`;
```

---

### 2.6 Frontend Application
**Purpose:** User interface for security dashboard and management

**Responsibilities:**
- Microsoft Entra ID authentication (MSAL)
- Role-based UI rendering
- Security dashboard visualization
- Trend charts and analytics
- AI summary display
- Admin consent onboarding UX
- Tenant management interface

**Technology Stack:**
- React 18
- TypeScript
- Tailwind CSS
- Vite
- MSAL React
- Recharts for visualization
- React Router for navigation

**Pages/Routes:**
```
/                           - Landing page
/login                      - Login page
/dashboard                  - Main security dashboard
/tenants                    - Tenant management (Admin)
/tenants/:id                - Tenant detail view
/assessments/:id            - Assessment detail view
/compliance                 - Compliance frameworks
/reports                    - Reports and exports
/settings                   - User settings
/admin                      - Admin panel
/onboarding                 - Admin consent flow
```

**Component Structure:**
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginButton.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleGuard.tsx
│   ├── dashboard/
│   │   ├── SecurityScoreCard.tsx
│   │   ├── RiskLevelIndicator.tsx
│   │   ├── TrendChart.tsx
│   │   └── LeadRankBadge.tsx
│   ├── compliance/
│   │   ├── FrameworkList.tsx
│   │   ├── ControlStatus.tsx
│   │   └── ComplianceMatrix.tsx
│   ├── ai/
│   │   ├── ExecutiveSummary.tsx
│   │   └── RecommendationList.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── pages/
├── services/
│   ├── authService.ts
│   ├── apiClient.ts
│   └── msalConfig.ts
├── hooks/
├── types/
└── utils/
```

---

## 3. Shared Packages

### 3.1 shared-types
**Purpose:** Common TypeScript types and interfaces

```typescript
// Core types
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type LeadRank = 'Hot' | 'Warm' | 'Cold';
export type TenantStatus = 'trial' | 'active' | 'suspended';
export type UserRole = 'Sales' | 'Analyst' | 'Admin';

// JWT Claims
export interface JWTClaims {
    sub: string;
    email: string;
    role: UserRole;
    tenant_id: string;
}

// Assessment types
export interface SecurityAssessment {
    id: string;
    tenantId: string;
    secureScore: number;
    maxScore: number;
    securityPercentage: number;
    riskLevel: RiskLevel;
    opportunityScore: number;
    leadRank: LeadRank;
    timestamp: Date;
}
```

### 3.2 auth-utils
**Purpose:** Authentication and authorization utilities

```typescript
// JWT validation
export function validateJWT(token: string): JWTClaims;

// Role checking
export function hasRole(user: JWTClaims, role: UserRole): boolean;

// Tenant context
export function extractTenantContext(req: Request): string;
```

### 3.3 logger
**Purpose:** Structured logging

```typescript
// Winston-based logger
export const logger = {
    info: (message: string, meta?: object) => void;
    error: (message: string, error?: Error, meta?: object) => void;
    warn: (message: string, meta?: object) => void;
    debug: (message: string, meta?: object) => void;
};
```

### 3.4 observability
**Purpose:** Monitoring and telemetry

```typescript
// Application Insights integration
export function trackEvent(name: string, properties?: object): void;
export function trackMetric(name: string, value: number): void;
export function trackException(error: Error, properties?: object): void;
```

---

## 4. Compliance Framework Implementation

### 4.1 Supported Frameworks

**Phase 1 Priority:**
1. **CIS Controls v8** - Baseline security controls
2. **PIPEDA** - Canadian privacy law
3. **Quebec Law 25** - Quebec privacy requirements
4. **Microsoft Zero Trust** - Security model
5. **FSI** (Financial Services Industry) - Microsoft framework
6. **MISA** (Microsoft Intelligent Security Association)

**Phase 2 Expansion:**
- GDPR (European Union)
- HIPAA (Healthcare - US)
- PHIPA (Healthcare - Canada)
- FINRA (Financial - US)
- SOC 2 Type II
- ISO 27001
- NIST Cybersecurity Framework
- PCI DSS

### 4.2 Framework Mapping System

```typescript
interface ComplianceFramework {
    id: string;
    name: string;
    version: string;
    region: 'Canada' | 'US' | 'EU' | 'International';
    industry?: 'Healthcare' | 'Financial' | 'General';
    controls: ComplianceControl[];
}

interface ComplianceControl {
    controlId: string;
    title: string;
    description: string;
    category: string;
    mappings: {
        cisControl?: string;
        microsoftSecureScore?: string[];
        azurePolicy?: string[];
    };
    assessmentCriteria: string[];
}
```

### 4.3 Compliance Dashboard

```mermaid
graph LR
    A[Secure Score Data] --> B[CIS Mapping Engine]
    B --> C[Framework Mapper]
    C --> D[PIPEDA Status]
    C --> E[Law 25 Status]
    C --> F[Zero Trust Score]
    C --> G[FSI Compliance]
    D --> H[Compliance Dashboard]
    E --> H
    F --> H
    G --> H
```

---

## 5. Security Architecture

### 5.1 Zero Trust Implementation

**Principles:**
1. **Verify explicitly** - Always authenticate and authorize
2. **Use least privilege access** - Just-in-time and just-enough-access
3. **Assume breach** - Minimize blast radius and segment access

**Implementation:**
- Microsoft Entra ID for identity
- Conditional Access policies
- Multi-factor authentication required
- Role-based access control
- Tenant isolation at data layer
- Row Level Security in PostgreSQL
- API gateway authentication
- Service-to-service authentication with managed identities

### 5.2 Data Security

**Encryption:**
- TLS 1.3 for data in transit
- AES-256 for data at rest
- Azure Key Vault for secrets management
- Managed identities (no secrets in code)

**Tenant Isolation:**
```sql
-- Row Level Security Policy
CREATE POLICY tenant_isolation ON assessments
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
```

**Audit Logging:**
- All API requests logged
- Authentication events tracked
- Data access audited
- Compliance with audit requirements

### 5.3 Network Security

```mermaid
graph TB
    subgraph "Public Internet"
        USER[Users]
    end
    
    subgraph "Azure Front Door"
        WAF[Web Application Firewall]
        CDN[CDN]
    end
    
    subgraph "Virtual Network"
        APIM[API Management]
        SERVICES[Microservices]
    end
    
    subgraph "Private Endpoints"
        DB[(Database)]
        KV[Key Vault]
    end
    
    USER --> WAF
    WAF --> CDN
    CDN --> APIM
    APIM --> SERVICES
    SERVICES --> DB
    SERVICES --> KV
```

---

## 6. Database Schema

### 6.1 Complete Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('trial', 'active', 'suspended')),
    domain VARCHAR(255),
    contact_email VARCHAR(255),
    onboarded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entra_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Sales', 'Analyst', 'Admin')),
    tenant_id UUID REFERENCES tenants(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    secure_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    security_percentage DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High')),
    opportunity_score DECIMAL(5,2) NOT NULL,
    lead_rank VARCHAR(50) NOT NULL CHECK (lead_rank IN ('Hot', 'Warm', 'Cold')),
    assessment_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CIS Controls
CREATE TABLE cis_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) NOT NULL,
    control_id VARCHAR(50) NOT NULL,
    control_name VARCHAR(255) NOT NULL,
    control_category VARCHAR(100),
    status VARCHAR(50) NOT NULL CHECK (status IN ('compliant', 'partial', 'non-compliant')),
    score DECIMAL(5,2),
    recommendations TEXT[],
    evidence JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Compliance Frameworks
CREATE TABLE compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    region VARCHAR(100),
    industry VARCHAR(100),
    description TEXT,
    controls JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Compliance Assessments
CREATE TABLE compliance_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    framework_id UUID REFERENCES compliance_frameworks(id) NOT NULL,
    assessment_id UUID REFERENCES assessments(id) NOT NULL,
    compliance_percentage DECIMAL(5,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    gaps JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Automation Rules
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(100) NOT NULL,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Automation History
CREATE TABLE automation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES automation_rules(id) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    trigger_data JSONB NOT NULL,
    actions_executed JSONB NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    executed_at TIMESTAMP DEFAULT NOW()
);

-- AI Usage Logs
CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    user_id UUID REFERENCES users(id),
    operation VARCHAR(100) NOT NULL,
    tokens_used INTEGER,
    cost DECIMAL(10,4),
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX idx_cis_controls_assessment_id ON cis_controls(assessment_id);
CREATE INDEX idx_compliance_assessments_tenant_id ON compliance_assessments(tenant_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Row Level Security
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cis_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example for assessments)
CREATE POLICY tenant_isolation_assessments ON assessments
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

## 7. Environment Configuration

### 7.1 Environment Variables

**Identity Service:**
```env
NODE_ENV=production
PORT=3001
TENANT_ISSUER=https://login.microsoftonline.com/{tenant-id}/v2.0
API_AUDIENCE=api://cloudmatrix-identity
ENTRA_CLIENT_ID={client-id}
ENTRA_TENANT_ID={tenant-id}
POSTGRES_URL=postgresql://user:pass@host:5432/cloudmatrix
JWT_SECRET={secret}
LOG_LEVEL=info
```

**Graph Proxy:**
```env
NODE_ENV=production
PORT=3002
GRAPH_CLIENT_ID={client-id}
GRAPH_CLIENT_SECRET={client-secret}
GRAPH_TENANT_ID={tenant-id}
GRAPH_SCOPE=https://graph.microsoft.com/.default
RATE_LIMIT_PER_TENANT=100
RATE_LIMIT_WINDOW_MS=60000
LOG_LEVEL=info
```

**Core Backend:**
```env
NODE_ENV=production
PORT=3003
GRAPH_PROXY_URL=http://graph-proxy:3002
POSTGRES_URL=postgresql://user:pass@host:5432/cloudmatrix
AUTOMATION_SERVICE_URL=http://automation-service:3004
AI_SERVICE_URL=http://ai-service:3005
LOG_LEVEL=info
```

**Automation Service:**
```env
NODE_ENV=production
PORT=3004
POSTGRES_URL=postgresql://user:pass@host:5432/cloudmatrix
TEAMS_WEBHOOK_URL={webhook-url}
SMTP_HOST={smtp-host}
SMTP_PORT=587
SMTP_USER={smtp-user}
SMTP_PASS={smtp-pass}
LOG_LEVEL=info
```

**AI Service:**
```env
NODE_ENV=production
PORT=3005
AZURE_OPENAI_ENDPOINT=https://{resource}.openai.azure.com/
AZURE_OPENAI_API_KEY={api-key}
AZURE_OPENAI_DEPLOYMENT=gpt-4
POSTGRES_URL=postgresql://user:pass@host:5432/cloudmatrix
MAX_TOKENS=2000
TEMPERATURE=0.7
LOG_LEVEL=info
```

**Frontend:**
```env
VITE_ENTRA_CLIENT_ID={client-id}
VITE_ENTRA_TENANT_ID={tenant-id}
VITE_ENTRA_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_IDENTITY_API=http://localhost:3001
VITE_CORE_API=http://localhost:3003
VITE_AI_API=http://localhost:3005
```

---

## 8. Infrastructure as Code

### 8.1 Azure Resources

**Required Azure Services:**
- Azure App Service (6 instances for services)
- Azure Static Web Apps (frontend)
- Azure Database for PostgreSQL (Neon alternative)
- Azure Key Vault
- Azure Application Insights
- Azure Front Door
- Azure API Management
- Azure Container Registry
- Azure Service Bus (for automation)
- Azure OpenAI Service

### 8.2 Bicep Template Structure

```
infra/
├── bicep/
│   ├── main.bicep                  # Main orchestration
│   ├── modules/
│   │   ├── app-services.bicep      # App Service plans and apps
│   │   ├── database.bicep          # PostgreSQL
│   │   ├── key-vault.bicep         # Key Vault
│   │   ├── monitoring.bicep        # App Insights
│   │   ├── networking.bicep        # VNet, NSGs
│   │   ├── api-management.bicep    # APIM
│   │   ├── front-door.bicep        # Front Door + WAF
│   │   └── openai.bicep            # Azure OpenAI
│   └── parameters/
│       ├── dev.parameters.json
│       ├── staging.parameters.json
│       └── prod.parameters.json
└── pipelines/
    ├── azure-pipelines.yml
    └── github-actions.yml
```

---

## 9. Development Workflow

### 9.1 Build Order (Strict)

1. **Shared Packages** - Foundation types and utilities
2. **Identity Service** - Authentication and authorization
3. **Graph Proxy** - Microsoft Graph boundary
4. **Core Backend** - Business logic and scoring
5. **Automation Service** - Workflow automation
6. **AI Service** - AI-powered insights
7. **Frontend** - User interface
8. **Infrastructure** - Deployment templates
9. **Documentation** - API docs and guides

### 9.2 Technology Choices

**Backend Services:**
- Runtime: Node.js 20 LTS
- Language: TypeScript 5.x
- Framework: Express.js
- Database Client: pg (PostgreSQL)
- Testing: Jest + Supertest
- Linting: ESLint + Prettier

**Frontend:**
- Framework: React 18
- Build Tool: Vite
- Language: TypeScript 5.x
- Styling: Tailwind CSS 3.x
- Auth: @azure/msal-react
- HTTP Client: Axios
- Charts: Recharts
- Testing: Vitest + React Testing Library

**DevOps:**
- CI/CD: Azure DevOps or GitHub Actions
- Containers: Docker
- Orchestration: Azure App Service or AKS
- Monitoring: Azure Application Insights
- Logging: Winston + Azure Log Analytics

---

## 10. API Contracts

### 10.1 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant EntraID
    participant IdentityService
    participant CoreBackend
    
    User->>Frontend: Access application
    Frontend->>EntraID: Redirect to login
    EntraID->>User: Authenticate
    User->>EntraID: Provide credentials + MFA
    EntraID->>Frontend: Return JWT token
    Frontend->>IdentityService: Validate token
    IdentityService->>Frontend: Return user context
    Frontend->>CoreBackend: API call with JWT
    CoreBackend->>IdentityService: Validate token
    IdentityService->>CoreBackend: Token valid + claims
    CoreBackend->>Frontend: Return data
```

### 10.2 Assessment Flow

```mermaid
sequenceDiagram
    participant Analyst
    participant Frontend
    participant CoreBackend
    participant GraphProxy
    participant MSGraph
    participant AutomationService
    
    Analyst->>Frontend: Request assessment
    Frontend->>CoreBackend: POST /assessments/:tenantId/refresh
    CoreBackend->>GraphProxy: GET /graph/secure-score/:tenantId
    GraphProxy->>MSGraph: Fetch Secure Score
    MSGraph->>GraphProxy: Return score data
    GraphProxy->>CoreBackend: Return normalized data
    CoreBackend->>CoreBackend: Calculate metrics
    CoreBackend->>CoreBackend: Map to CIS controls
    CoreBackend->>CoreBackend: Persist assessment
    CoreBackend->>AutomationService: Emit assessment_complete event
    AutomationService->>AutomationService: Evaluate rules
    AutomationService->>AutomationService: Trigger notifications
    CoreBackend->>Frontend: Return assessment
    Frontend->>Analyst: Display dashboard
```

---

## 11. Phase 1 Definition of Done

### 11.1 Functional Requirements

- [ ] Microsoft Entra ID authentication working
- [ ] Tenant admin consent onboarding flow complete
- [ ] Role-based access control enforced (Sales, Analyst, Admin)
- [ ] Microsoft Graph integration via graph-proxy
- [ ] Secure Score ingestion and normalization
- [ ] CIS v8 control mapping implemented
- [ ] Security percentage calculation
- [ ] Risk level determination (Low/Medium/High)
- [ ] Lead rank calculation (Hot/Warm/Cold)
- [ ] Historical trend analysis
- [ ] Compliance framework tracking (CIS, PIPEDA, Law 25)
- [ ] AI executive summary generation
- [ ] Automation rules and triggers
- [ ] Security dashboard UI
- [ ] Tenant management interface
- [ ] Audit logging throughout

### 11.2 Non-Functional Requirements

- [ ] Zero Trust architecture implemented
- [ ] Tenant isolation enforced at all layers
- [ ] Row Level Security enabled in database
- [ ] No secrets in code (Key Vault integration)
- [ ] All services independently deployable
- [ ] API documentation complete
- [ ] Monitoring and observability configured
- [ ] Error handling and logging standardized
- [ ] Performance benchmarks met
- [ ] Security testing passed
- [ ] Compliance requirements validated

### 11.3 Documentation Requirements

- [ ] Architecture documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Deployment guide
- [ ] Developer setup guide
- [ ] Security documentation
- [ ] Compliance mapping documentation
- [ ] User guide for each role
- [ ] Admin onboarding guide

---

## 12. Risk Mitigation

### 12.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Microsoft Graph API rate limits | High | Implement per-tenant rate limiting, caching, and retry logic |
| Tenant data isolation breach | Critical | Row Level Security, strict validation, security testing |
| Azure OpenAI cost overrun | Medium | Token limits, usage monitoring, cost alerts |
| Service dependency failures | High | Circuit breakers, fallback mechanisms, health checks |
| Database performance | Medium | Proper indexing, query optimization, connection pooling |

### 12.2 Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Competitor copycat | Medium | First-mover advantage, rapid iteration, unique AI features |
| Compliance requirement changes | Medium | Modular framework system, regular compliance reviews |
| Customer data breach | Critical | Zero Trust, encryption, audit logging, incident response plan |
| Scaling challenges | Medium | Cloud-native architecture, horizontal scaling, monitoring |

---

## 13. Success Metrics

### 13.1 Technical Metrics

- **Uptime:** 99.9% availability
- **Response Time:** < 500ms for API calls
- **Assessment Time:** < 30 seconds per tenant
- **Error Rate:** < 0.1% of requests
- **Security Score:** 100% on Microsoft Secure Score

### 13.2 Business Metrics

- **Time to Onboard:** < 5 minutes per tenant
- **Assessment Accuracy:** > 95% alignment with manual audits
- **User Adoption:** 80% of sales team using platform within 30 days
- **Lead Conversion:** Track Hot/Warm/Cold lead conversion rates
- **Customer Satisfaction:** > 4.5/5 rating

---

## 14. Next Steps

### 14.1 Immediate Actions

1. Set up development environment
2. Create Azure resources (dev environment)
3. Initialize monorepo structure
4. Set up CI/CD pipelines
5. Begin identity-service development

### 14.2 Phase 2 Planning

- Customer portal (external access)
- Advanced compliance frameworks
- Automated remediation workflows
- Custom reporting and exports
- Mobile application
- Partner integrations
- Advanced AI features (predictive analytics)

---

## 15. Appendices

### 15.1 Glossary

- **MSSP:** Managed Security Service Provider
- **CSP:** Cloud Solution Provider
- **MSP:** Managed Service Provider
- **ISV:** Independent Software Vendor
- **CIS:** Center for Internet Security
- **PIPEDA:** Personal Information Protection and Electronic Documents Act
- **FSI:** Financial Services Industry
- **MISA:** Microsoft Intelligent Security Association
- **RLS:** Row Level Security
- **RBAC:** Role-Based Access Control

### 15.2 References

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/)
- [CIS Controls v8](https://www.cisecurity.org/controls/v8)
- [Microsoft Zero Trust](https://www.microsoft.com/en-us/security/business/zero-trust)
- [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/)
- [PIPEDA Compliance](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/)

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-12  
**Status:** Ready for Implementation

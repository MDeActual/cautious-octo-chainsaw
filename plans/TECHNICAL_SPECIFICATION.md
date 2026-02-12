# CloudMatrix MSSP Platform - Technical Specification

**Version:** 1.0  
**Date:** 2026-02-12  
**Status:** Implementation Ready

---

## 1. Project Structure

### 1.1 Monorepo Layout

```
cloudmatrix-mssp/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-dev.yml
│       ├── deploy-staging.yml
│       └── deploy-prod.yml
├── apps/
│   ├── identity-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── graph-proxy/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── core-backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   │   ├── scoring.service.ts
│   │   │   │   ├── cis-mapping.service.ts
│   │   │   │   ├── trend-analysis.service.ts
│   │   │   │   └── compliance.service.ts
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── automation-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   │   ├── rule-engine.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   └── workflow.service.ts
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ai-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   │   ├── openai.service.ts
│   │   │   │   ├── prompt.service.ts
│   │   │   │   └── sanitization.service.ts
│   │   │   ├── prompts/
│   │   │   │   ├── executive-summary.ts
│   │   │   │   ├── risk-analysis.ts
│   │   │   │   └── recommendations.ts
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/
│       ├── public/
│       ├── src/
│       │   ├── assets/
│       │   ├── components/
│       │   │   ├── auth/
│       │   │   ├── dashboard/
│       │   │   ├── compliance/
│       │   │   ├── ai/
│       │   │   └── layout/
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── TenantList.tsx
│       │   │   ├── TenantDetail.tsx
│       │   │   ├── Compliance.tsx
│       │   │   ├── Reports.tsx
│       │   │   └── Admin.tsx
│       │   ├── services/
│       │   │   ├── authService.ts
│       │   │   ├── apiClient.ts
│       │   │   └── msalConfig.ts
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useAssessments.ts
│       │   │   └── useCompliance.ts
│       │   ├── types/
│       │   ├── utils/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── tailwind.config.js
├── packages/
│   ├── shared-types/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── auth.types.ts
│   │   │   ├── assessment.types.ts
│   │   │   ├── compliance.types.ts
│   │   │   └── automation.types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── auth-utils/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── jwt.ts
│   │   │   ├── rbac.ts
│   │   │   └── tenant-context.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── logger/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── winston-config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── observability/
│       ├── src/
│       │   ├── index.ts
│       │   ├── app-insights.ts
│       │   └── metrics.ts
│       ├── package.json
│       └── tsconfig.json
├── infra/
│   ├── bicep/
│   │   ├── main.bicep
│   │   ├── modules/
│   │   │   ├── app-services.bicep
│   │   │   ├── database.bicep
│   │   │   ├── key-vault.bicep
│   │   │   ├── monitoring.bicep
│   │   │   ├── networking.bicep
│   │   │   ├── api-management.bicep
│   │   │   ├── front-door.bicep
│   │   │   └── openai.bicep
│   │   └── parameters/
│   │       ├── dev.parameters.json
│   │       ├── staging.parameters.json
│   │       └── prod.parameters.json
│   └── scripts/
│       ├── deploy.sh
│       └── setup-env.sh
├── docs/
│   ├── PHASE1_SPEC.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── SECURITY.md
│   └── COMPLIANCE.md
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## 2. Technology Stack Details

### 2.1 Backend Services

**Runtime & Language:**
- Node.js 20.x LTS
- TypeScript 5.3+
- ES2022 target

**Core Dependencies:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@azure/identity": "^4.0.0",
    "@azure/msal-node": "^2.6.0",
    "@microsoft/microsoft-graph-client": "^3.0.7",
    "pg": "^8.11.3",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1",
    "joi": "^17.11.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/express": "^4.17.21",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "supertest": "^6.3.3",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

### 2.2 Frontend

**Framework & Build:**
- React 18.2+
- Vite 5.0+
- TypeScript 5.3+

**Core Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "@azure/msal-react": "^2.0.10",
    "@azure/msal-browser": "^3.7.0",
    "axios": "^1.6.5",
    "recharts": "^2.10.3",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.303.0",
    "date-fns": "^3.0.6",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.10",
    "typescript": "^5.3.3",
    "vitest": "^1.1.1",
    "@testing-library/react": "^14.1.2",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### 2.3 Database

**PostgreSQL 15+**
- Hosted on Neon (serverless PostgreSQL)
- Connection pooling with pg-pool
- Row Level Security enabled
- Automated backups

---

## 3. Service Implementation Details

### 3.1 Identity Service

**Port:** 3001

**Key Files:**

[`apps/identity-service/src/middleware/auth.middleware.ts`](apps/identity-service/src/middleware/auth.middleware.ts):
```typescript
import { Request, Response, NextFunction } from 'express';
import { JWTClaims } from '@cloudmatrix/shared-types';
import { validateJWT } from '@cloudmatrix/auth-utils';

export interface AuthRequest extends Request {
    user?: JWTClaims;
}

export const authenticateJWT = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const claims = await validateJWT(token);
        
        req.user = claims;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
```

[`apps/identity-service/src/services/tenant.service.ts`](apps/identity-service/src/services/tenant.service.ts):
```typescript
import { Pool } from 'pg';
import { Tenant, TenantStatus } from '@cloudmatrix/shared-types';
import { logger } from '@cloudmatrix/logger';

export class TenantService {
    constructor(private db: Pool) {}

    async createTenant(data: {
        tenantId: string;
        name: string;
        domain: string;
        contactEmail: string;
    }): Promise<Tenant> {
        const query = `
            INSERT INTO tenants (tenant_id, name, domain, contact_email, status)
            VALUES ($1, $2, $3, $4, 'trial')
            RETURNING *
        `;
        
        const result = await this.db.query(query, [
            data.tenantId,
            data.name,
            data.domain,
            data.contactEmail
        ]);
        
        logger.info('Tenant created', { tenantId: data.tenantId });
        return result.rows[0];
    }

    async updateTenantStatus(
        tenantId: string,
        status: TenantStatus
    ): Promise<Tenant> {
        const query = `
            UPDATE tenants
            SET status = $1, updated_at = NOW()
            WHERE tenant_id = $2
            RETURNING *
        `;
        
        const result = await this.db.query(query, [status, tenantId]);
        
        if (result.rows.length === 0) {
            throw new Error('Tenant not found');
        }
        
        logger.info('Tenant status updated', { tenantId, status });
        return result.rows[0];
    }

    async getTenant(tenantId: string): Promise<Tenant | null> {
        const query = 'SELECT * FROM tenants WHERE tenant_id = $1';
        const result = await this.db.query(query, [tenantId]);
        return result.rows[0] || null;
    }

    async listTenants(filters?: {
        status?: TenantStatus;
    }): Promise<Tenant[]> {
        let query = 'SELECT * FROM tenants';
        const params: any[] = [];
        
        if (filters?.status) {
            query += ' WHERE status = $1';
            params.push(filters.status);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await this.db.query(query, params);
        return result.rows;
    }
}
```

---

### 3.2 Graph Proxy Service

**Port:** 3002

**Key Files:**

[`apps/graph-proxy/src/services/graph.service.ts`](apps/graph-proxy/src/services/graph.service.ts):
```typescript
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { logger } from '@cloudmatrix/logger';

export class GraphService {
    private client: Client;

    constructor() {
        const credential = new ClientSecretCredential(
            process.env.GRAPH_TENANT_ID!,
            process.env.GRAPH_CLIENT_ID!,
            process.env.GRAPH_CLIENT_SECRET!
        );

        this.client = Client.initWithMiddleware({
            authProvider: {
                getAccessToken: async () => {
                    const token = await credential.getToken(
                        'https://graph.microsoft.com/.default'
                    );
                    return token.token;
                }
            }
        });
    }

    async getSecureScore(tenantId: string) {
        try {
            logger.info('Fetching Secure Score', { tenantId });
            
            const response = await this.client
                .api('/security/secureScores')
                .header('Prefer', 'return=representation')
                .top(1)
                .get();

            return response.value[0];
        } catch (error) {
            logger.error('Error fetching Secure Score', error as Error, { tenantId });
            throw error;
        }
    }

    async getSecureScoreHistory(tenantId: string, days: number = 30) {
        try {
            const response = await this.client
                .api('/security/secureScores')
                .top(days)
                .orderby('createdDateTime desc')
                .get();

            return response.value;
        } catch (error) {
            logger.error('Error fetching Secure Score history', error as Error, { tenantId });
            throw error;
        }
    }

    async getSecurityRecommendations(tenantId: string) {
        try {
            const response = await this.client
                .api('/security/secureScoreControlProfiles')
                .get();

            return response.value;
        } catch (error) {
            logger.error('Error fetching recommendations', error as Error, { tenantId });
            throw error;
        }
    }

    async getSecurityAlerts(tenantId: string) {
        try {
            const response = await this.client
                .api('/security/alerts_v2')
                .top(50)
                .orderby('createdDateTime desc')
                .get();

            return response.value;
        } catch (error) {
            logger.error('Error fetching alerts', error as Error, { tenantId });
            throw error;
        }
    }

    async getDeviceCompliance(tenantId: string) {
        try {
            const response = await this.client
                .api('/deviceManagement/managedDevices')
                .select('id,deviceName,complianceState,operatingSystem')
                .get();

            return response.value;
        } catch (error) {
            logger.error('Error fetching device compliance', error as Error, { tenantId });
            throw error;
        }
    }
}
```

[`apps/graph-proxy/src/middleware/rate-limit.middleware.ts`](apps/graph-proxy/src/middleware/rate-limit.middleware.ts):
```typescript
import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Per-tenant rate limiting
export const createTenantRateLimiter = () => {
    return rateLimit({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
        max: parseInt(process.env.RATE_LIMIT_PER_TENANT || '100'),
        keyGenerator: (req: Request) => {
            // Extract tenant ID from request
            return req.params.tenantId || req.ip;
        },
        message: 'Too many requests from this tenant, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });
};
```

---

### 3.3 Core Backend Service

**Port:** 3003

**Key Files:**

[`apps/core-backend/src/services/scoring.service.ts`](apps/core-backend/src/services/scoring.service.ts):
```typescript
import { SecurityAssessment, RiskLevel, LeadRank } from '@cloudmatrix/shared-types';
import { logger } from '@cloudmatrix/logger';

export class ScoringService {
    calculateSecurityPercentage(secureScore: number, maxScore: number): number {
        if (maxScore === 0) return 0;
        return Math.round((secureScore / maxScore) * 100 * 100) / 100;
    }

    determineRiskLevel(securityPercentage: number): RiskLevel {
        if (securityPercentage < 40) return 'High';
        if (securityPercentage < 70) return 'Medium';
        return 'Low';
    }

    calculateOpportunityScore(
        securityPercentage: number,
        userCount: number,
        deviceCount: number
    ): number {
        // Opportunity score based on:
        // - Security gap (100 - securityPercentage)
        // - Organization size (users + devices)
        // - Weighted formula
        
        const securityGap = 100 - securityPercentage;
        const sizeScore = Math.min((userCount + deviceCount) / 100, 10);
        
        return Math.round((securityGap * 0.7 + sizeScore * 0.3) * 100) / 100;
    }

    determineLeadRank(
        riskLevel: RiskLevel,
        opportunityScore: number
    ): LeadRank {
        // Hot: High risk + high opportunity (> 60)
        // Warm: Medium risk or medium opportunity (30-60)
        // Cold: Low risk + low opportunity (< 30)
        
        if (riskLevel === 'High' && opportunityScore > 60) return 'Hot';
        if (riskLevel === 'Low' && opportunityScore < 30) return 'Cold';
        return 'Warm';
    }

    async createAssessment(data: {
        tenantId: string;
        secureScore: number;
        maxScore: number;
        userCount: number;
        deviceCount: number;
        rawData: any;
    }): Promise<SecurityAssessment> {
        const securityPercentage = this.calculateSecurityPercentage(
            data.secureScore,
            data.maxScore
        );
        
        const riskLevel = this.determineRiskLevel(securityPercentage);
        
        const opportunityScore = this.calculateOpportunityScore(
            securityPercentage,
            data.userCount,
            data.deviceCount
        );
        
        const leadRank = this.determineLeadRank(riskLevel, opportunityScore);
        
        logger.info('Assessment calculated', {
            tenantId: data.tenantId,
            securityPercentage,
            riskLevel,
            leadRank
        });
        
        return {
            id: '', // Will be set by database
            tenantId: data.tenantId,
            secureScore: data.secureScore,
            maxScore: data.maxScore,
            securityPercentage,
            riskLevel,
            opportunityScore,
            leadRank,
            timestamp: new Date()
        };
    }
}
```

[`apps/core-backend/src/services/cis-mapping.service.ts`](apps/core-backend/src/services/cis-mapping.service.ts):
```typescript
import { CISControl, CISControlStatus } from '@cloudmatrix/shared-types';
import { logger } from '@cloudmatrix/logger';

export class CISMappingService {
    // CIS Controls v8 mapping to Microsoft Secure Score controls
    private readonly CIS_MAPPINGS = {
        '1.1': ['EnableMFA', 'BlockLegacyAuth'],
        '1.2': ['PasswordPolicy', 'AccountLockout'],
        '2.1': ['DeviceInventory', 'AssetManagement'],
        '3.1': ['DataProtection', 'DLP'],
        '4.1': ['SecureConfiguration', 'BaselineCompliance'],
        '5.1': ['AccountManagement', 'PrivilegedAccess'],
        '6.1': ['AuditLogging', 'LogRetention'],
        '7.1': ['EmailSecurity', 'AntiPhishing'],
        '8.1': ['MalwareDefense', 'EndpointProtection'],
        '9.1': ['NetworkSecurity', 'Firewall'],
        '10.1': ['DataRecovery', 'BackupStrategy'],
        // ... more mappings
    };

    async mapSecureScoreToCI S(
        secureScoreControls: any[]
    ): Promise<CISControl[]> {
        const cisControls: CISControl[] = [];
        
        for (const [cisId, msControls] of Object.entries(this.CIS_MAPPINGS)) {
            const matchingControls = secureScoreControls.filter(sc =>
                msControls.includes(sc.controlName)
            );
            
            const status = this.determineControlStatus(matchingControls);
            const score = this.calculateControlScore(matchingControls);
            
            cisControls.push({
                controlId: cisId,
                controlName: this.getCISControlName(cisId),
                controlCategory: this.getCISCategory(cisId),
                status,
                score,
                recommendations: matchingControls.map(c => c.actionUrl),
                evidence: matchingControls
            });
        }
        
        logger.info('CIS mapping completed', { controlCount: cisControls.length });
        return cisControls;
    }

    private determineControlStatus(controls: any[]): CISControlStatus {
        if (controls.length === 0) return 'non-compliant';
        
        const implementedCount = controls.filter(c => c.implementationStatus === 'Implemented').length;
        const percentage = (implementedCount / controls.length) * 100;
        
        if (percentage === 100) return 'compliant';
        if (percentage > 0) return 'partial';
        return 'non-compliant';
    }

    private calculateControlScore(controls: any[]): number {
        if (controls.length === 0) return 0;
        
        const totalScore = controls.reduce((sum, c) => sum + (c.score || 0), 0);
        return Math.round((totalScore / controls.length) * 100) / 100;
    }

    private getCISControlName(cisId: string): string {
        // Map CIS IDs to control names
        const names: Record<string, string> = {
            '1.1': 'Inventory and Control of Enterprise Assets',
            '1.2': 'Inventory and Control of Software Assets',
            '2.1': 'Data Protection',
            // ... more names
        };
        return names[cisId] || `CIS Control ${cisId}`;
    }

    private getCISCategory(cisId: string): string {
        const major = cisId.split('.')[0];
        const categories: Record<string, string> = {
            '1': 'Asset Management',
            '2': 'Data Protection',
            '3': 'Secure Configuration',
            '4': 'Account Management',
            '5': 'Access Control',
            '6': 'Audit Logging',
            '7': 'Email and Web Security',
            '8': 'Malware Defense',
            '9': 'Network Security',
            '10': 'Data Recovery',
            // ... more categories
        };
        return categories[major] || 'General';
    }
}
```

---

### 3.4 AI Service

**Port:** 3005

**Key Files:**

[`apps/ai-service/src/services/openai.service.ts`](apps/ai-service/src/services/openai.service.ts):
```typescript
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { logger } from '@cloudmatrix/logger';
import { trackMetric } from '@cloudmatrix/observability';

export class OpenAIService {
    private client: OpenAIClient;
    private deployment: string;

    constructor() {
        this.client = new OpenAIClient(
            process.env.AZURE_OPENAI_ENDPOINT!,
            new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY!)
        );
        this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
    }

    async generateCompletion(
        prompt: string,
        maxTokens: number = 2000,
        temperature: number = 0.7
    ): Promise<string> {
        const startTime = Date.now();
        
        try {
            const response = await this.client.getChatCompletions(
                this.deployment,
                [{ role: 'user', content: prompt }],
                {
                    maxTokens,
                    temperature,
                }
            );

            const completion = response.choices[0]?.message?.content || '';
            const tokensUsed = response.usage?.totalTokens || 0;
            
            const duration = Date.now() - startTime;
            
            trackMetric('ai.tokens.used', tokensUsed);
            trackMetric('ai.response.time', duration);
            
            logger.info('AI completion generated', {
                tokensUsed,
                duration,
                promptLength: prompt.length
            });
            
            return completion;
        } catch (error) {
            logger.error('Error generating AI completion', error as Error);
            throw error;
        }
    }

    async generateExecutiveSummary(assessmentData: {
        tenantName: string;
        secureScore: number;
        maxScore: number;
        securityPercentage: number;
        riskLevel: string;
        topVulnerabilities: string[];
        cisStatus: any;
    }): Promise<string> {
        const prompt = `
You are a cybersecurity analyst for an MSSP. Generate an executive summary 
for a client's security posture based on the following data:

Tenant: ${assessmentData.tenantName}
Security Score: ${assessmentData.secureScore}/${assessmentData.maxScore} (${assessmentData.securityPercentage}%)
Risk Level: ${assessmentData.riskLevel}
Top Vulnerabilities: ${assessmentData.topVulnerabilities.join(', ')}

Provide:
1. Overall security posture assessment (2-3 sentences)
2. Top 3 critical risks with brief explanations
3. Recommended immediate actions (3-5 items)
4. Business impact summary (1-2 sentences)

Keep it concise, executive-friendly, and actionable. Use professional language 
suitable for C-level executives.
        `.trim();

        return this.generateCompletion(prompt, 1500, 0.7);
    }

    async prioritizeRecommendations(recommendations: any[]): Promise<any[]> {
        const prompt = `
You are a cybersecurity expert. Prioritize the following security recommendations 
based on risk impact and implementation difficulty:

${JSON.stringify(recommendations, null, 2)}

Return a JSON array of the recommendations in priority order with a brief 
justification for each priority ranking.
        `.trim();

        const response = await this.generateCompletion(prompt, 2000, 0.5);
        
        try {
            return JSON.parse(response);
        } catch {
            logger.warn('Failed to parse AI response as JSON');
            return recommendations;
        }
    }
}
```

---

### 3.5 Frontend Application

**Port:** 5173 (dev), 80/443 (prod)

**Key Files:**

[`apps/frontend/src/services/msalConfig.ts`](apps/frontend/src/services/msalConfig.ts):
```typescript
import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
        redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI,
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
};

export const loginRequest: PopupRequest = {
    scopes: ['User.Read', 'openid', 'profile', 'email'],
};

export const apiRequest = {
    scopes: [`api://${import.meta.env.VITE_ENTRA_CLIENT_ID}/access_as_user`],
};
```

[`apps/frontend/src/components/dashboard/SecurityScoreCard.tsx`](apps/frontend/src/components/dashboard/SecurityScoreCard.tsx):
```typescript
import React from 'react';
import { Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { SecurityAssessment } from '@cloudmatrix/shared-types';

interface SecurityScoreCardProps {
    assessment: SecurityAssessment;
    previousScore?: number;
}

export const SecurityScoreCard: React.FC<SecurityScoreCardProps> = ({
    assessment,
    previousScore
}) => {
    const trend = previousScore
        ? assessment.securityPercentage - previousScore
        : 0;

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'Low': return 'text-green-600 bg-green-50';
            case 'Medium': return 'text-yellow-600 bg-yellow-50';
            case 'High': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Shield className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold">Security Score</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(assessment.riskLevel)}`}>
                    {assessment.riskLevel} Risk
                </span>
            </div>

            <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold text-gray-900">
                    {assessment.securityPercentage}%
                </span>
                <span className="ml-2 text-gray-500">
                    ({assessment.secureScore}/{assessment.maxScore})
                </span>
            </div>

            {trend !== 0 && (
                <div className="flex items-center text-sm">
                    {trend > 0 ? (
                        <>
                            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                            <span className="text-green-600">+{trend.toFixed(1)}%</span>
                        </>
                    ) : (
                        <>
                            <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                            <span className="text-red-600">{trend.toFixed(1)}%</span>
                        </>
                    )}
                    <span className="text-gray-500 ml-1">from last assessment</span>
                </div>
            )}
        </div>
    );
};
```

---

## 4. Database Implementation

### 4.1 Migration Strategy

Use a migration tool like `node-pg-migrate` or `db-migrate`:

```bash
# Create migration
npm run migrate:create create_initial_schema

# Run migrations
npm run migrate:up

# Rollback
npm run migrate:down
```

### 4.2 Connection Pool Configuration

```typescript
import { Pool } from 'pg';

export const createDatabasePool = () => {
    return new Pool({
        connectionString: process.env.POSTGRES_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false
        } : false
    });
};
```

### 4.3 Row Level Security Setup

```sql
-- Set tenant context before queries
SET app.current_tenant = 'tenant-uuid-here';

-- Or use a function
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant', tenant_uuid::text, false);
END;
$$ LANGUAGE plpgsql;
```

---

## 5. API Documentation

### 5.1 OpenAPI Specification

Use Swagger/OpenAPI for API documentation:

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CloudMatrix MSSP API',
            version: '1.0.0',
            description: 'API documentation for CloudMatrix MSSP Platform',
        },
        servers: [
            {
                url: 'http://localhost:3003',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
    },
    apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

// In app.ts
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

```typescript
// Example: scoring.service.test.ts
import { ScoringService } from '../services/scoring.service';

describe('ScoringService', () => {
    let service: ScoringService;

    beforeEach(() => {
        service = new ScoringService();
    });

    describe('calculateSecurityPercentage', () => {
        it('should calculate correct percentage', () => {
            const result = service.calculateSecurityPercentage(75, 100);
            expect(result).toBe(75);
        });

        it('should handle zero max score', () => {
            const result = service.calculateSecurityPercentage(50, 0);
            expect(result).toBe(0);
        });
    });

    describe('determineRiskLevel', () => {
        it('should return High for score < 40', () => {
            expect(service.determineRiskLevel(35)).toBe('High');
        });

        it('should return Medium for score 40-70', () => {
            expect(service.determineRiskLevel(55)).toBe('Medium');
        });

        it('should return Low for score > 70', () => {
            expect(service.determineRiskLevel(85)).toBe('Low');
        });
    });
});
```

### 6.2 Integration Tests

```typescript
// Example: assessment.integration.test.ts
import request from 'supertest';
import { app } from '../app';

describe('Assessment API', () => {
    let authToken: string;

    beforeAll(async () => {
        // Get auth token
        authToken = await getTestAuthToken();
    });

    describe('POST /assessments/:tenantId/refresh', () => {
        it('should create new assessment', async () => {
            const response = await request(app)
                .post('/assessments/test-tenant-id/refresh')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('securityPercentage');
            expect(response.body).toHaveProperty('riskLevel');
        });

        it('should require authentication', async () => {
            await request(app)
                .post('/assessments/test-tenant-id/refresh')
                .expect(401);
        });
    });
});
```

---

## 7. Deployment

### 7.1 Docker Configuration

**Example Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

### 7.2 CI/CD Pipeline

**GitHub Actions Example:**
```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
      
      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: cloudmatrix-identity-service
          package: ./apps/identity-service
```

---

## 8. Monitoring & Observability

### 8.1 Application Insights Integration

```typescript
import { TelemetryClient } from 'applicationinsights';

const client = new TelemetryClient(process.env.APPINSIGHTS_CONNECTION_STRING);

export const trackEvent = (name: string, properties?: Record<string, any>) => {
    client.trackEvent({ name, properties });
};

export const trackMetric = (name: string, value: number) => {
    client.trackMetric({ name, value });
};

export const trackException = (error: Error, properties?: Record<string, any>) => {
    client.trackException({ exception: error, properties });
};
```

### 8.2 Health Check Endpoints

```typescript
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'identity-service',
        version: process.env.npm_package_version
    });
});

app.get('/health/ready', async (req, res) => {
    try {
        // Check database connection
        await db.query('SELECT 1');
        
        res.json({
            status: 'ready',
            checks: {
                database: 'ok'
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            checks: {
                database: 'failed'
            }
        });
    }
});
```

---

## 9. Security Implementation

### 9.1 Helmet Configuration

```typescript
import helmet from 'helmet';

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
}));
```

### 9.2 CORS Configuration

```typescript
import cors from 'cors';

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 9.3 Input Validation

```typescript
import Joi from 'joi';

export const validateAssessmentRequest = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        tenantId: Joi.string().uuid().required(),
    });

    const { error } = schema.validate(req.params);
    
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    
    next();
};
```

---

## 10. Performance Optimization

### 10.1 Caching Strategy

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cacheMiddleware = (ttl: number = 300) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const key = `cache:${req.originalUrl}`;
        
        try {
            const cached = await redis.get(key);
            
            if (cached) {
                return res.json(JSON.parse(cached));
            }
            
            // Store original send
            const originalSend = res.json.bind(res);
            
            // Override send
            res.json = (data: any) => {
                redis.setex(key, ttl, JSON.stringify(data));
                return originalSend(data);
            };
            
            next();
        } catch (error) {
            next();
        }
    };
};
```

### 10.2 Database Query Optimization

```typescript
// Use prepared statements
const query = {
    text: 'SELECT * FROM assessments WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2',
    values: [tenantId, limit]
};

// Use connection pooling
const pool = new Pool({ max: 20 });

// Use indexes
CREATE INDEX CONCURRENTLY idx_assessments_tenant_created 
ON assessments(tenant_id, created_at DESC);
```

---

## 11. Compliance Framework Data

### 11.1 CIS Controls v8 Seed Data

```sql
INSERT INTO compliance_frameworks (name, version, region, industry, description, controls) VALUES
('CIS Controls', 'v8', 'International', 'General', 'Center for Internet Security Controls v8', 
'{
    "controls": [
        {
            "id": "1",
            "title": "Inventory and Control of Enterprise Assets",
            "safeguards": [
                {"id": "1.1", "title": "Establish and Maintain Detailed Enterprise Asset Inventory"},
                {"id": "1.2", "title": "Address Unauthorized Assets"}
            ]
        },
        {
            "id": "2",
            "title": "Inventory and Control of Software Assets",
            "safeguards": [
                {"id": "2.1", "title": "Establish and Maintain a Software Inventory"},
                {"id": "2.2", "title": "Ensure Authorized Software is Currently Supported"}
            ]
        }
    ]
}'::jsonb);
```

### 11.2 PIPEDA Compliance Mapping

```sql
INSERT INTO compliance_frameworks (name, version, region, industry, description, controls) VALUES
('PIPEDA', '2023', 'Canada', 'General', 'Personal Information Protection and Electronic Documents Act',
'{
    "principles": [
        {
            "id": "1",
            "title": "Accountability",
            "requirements": ["Designate privacy officer", "Implement privacy policies"]
        },
        {
            "id": "2",
            "title": "Identifying Purposes",
            "requirements": ["Document purposes for collection", "Communicate to individuals"]
        },
        {
            "id": "3",
            "title": "Consent",
            "requirements": ["Obtain meaningful consent", "Allow withdrawal of consent"]
        }
    ]
}'::jsonb);
```

---

## 12. Development Commands

### 12.1 Package Scripts

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "migrate:up": "node-pg-migrate up",
    "migrate:down": "node-pg-migrate down",
    "seed": "ts-node scripts/seed.ts",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  }
}
```

### 12.2 Turbo Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

**Document Status:** Implementation Ready  
**Next Action:** Begin development with identity-service

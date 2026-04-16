# AI Service

**Port:** 3005

AI-powered insights and executive summaries for security assessments.

## Overview

The AI Service provides natural language summaries and insights based on security assessment data. It operates as a read-only service with no Microsoft Graph API access and no execution of privileged actions.

## Architecture

- **No Graph Access:** Does not call Microsoft Graph APIs (adheres to MASTER_SPEC.md)
- **No Execution Logic:** Generates summaries only; does not execute security actions
- **Tenant-Scoped:** All operations are tenant-isolated
- **Mock AI:** Currently uses mock AI responses; Azure OpenAI integration available for production

## Routes

### POST /summary

Generate a human-readable security summary based on score and risk metrics.

**Request:**
```json
{
  "score": 75,
  "riskLevel": "Medium",
  "recommendations": [
    "Enable MFA for all users",
    "Configure Conditional Access policies"
  ]
}
```

**Response:**
```json
{
  "data": {
    "summary": "Your security score of 75% shows moderate risk. There are important areas that need improvement to strengthen your security posture. Your organization has basic security measures, but there are gaps that could be exploited. Top priorities for improvement: 1. Enable MFA for all users; 2. Configure Conditional Access policies."
  },
  "error": null
}
```

**Validation:**
- `score`: number (0-100)
- `riskLevel`: enum ("Low", "Medium", "High")
- `recommendations`: array of strings (optional)

### POST /summaries

Generate an executive security summary with full assessment context.

**Request:**
```json
{
  "tenant_id": "uuid",
  "assessment": {
    "security_percentage": 75,
    "risk_level": "Medium",
    "lead_rank": "Warm",
    "opportunity_score": 60
  },
  "recommendations": [
    { "title": "Enable MFA for all users" }
  ]
}
```

**Response:**
```json
{
  "data": {
    "tenant_id": "uuid",
    "summary": "Security posture for tenant...",
    "generated_at": "2026-04-16T08:00:00.000Z"
  },
  "error": null
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "data": {
    "status": "ok",
    "service": "ai-service",
    "version": "0.1.0",
    "timestamp": "2026-04-16T08:00:00.000Z"
  },
  "error": null
}
```

## Configuration

Environment variables:

```bash
AI_SERVICE_PORT=3005
AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4
APP_INSIGHTS_CONNECTION_STRING=your-connection-string
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Type check
pnpm typecheck

# Run tests
pnpm test
```

## Security Constraints

Per PERMISSION_MODEL.md:

1. **No Graph Access:** This service does not call Microsoft Graph APIs
2. **No AI Execution:** AI generates summaries only; does not execute actions
3. **Read-Only:** No write operations to tenant environments
4. **Audit Logging:** All summary generation requests are logged

## Implementation Notes

- Currently uses mock AI responses for development
- When `AZURE_OPENAI_ENDPOINT` and `AZURE_OPENAI_API_KEY` are configured, the `/summaries` route uses Azure OpenAI GPT-4
- The `/summary` route uses mock AI logic for deterministic, human-readable output
- All prompts are sanitized to prevent tenant data leakage
- No raw tenant data is sent to external AI services

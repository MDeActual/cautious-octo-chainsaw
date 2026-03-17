import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import type { ApiResponse, ExecutiveSummaryResponse } from '@cloudmatrix/shared-types';
import { createLogger } from '@cloudmatrix/logger';
import { loadConfig } from '../config.js';

export const summariesRouter: ExpressRouter = Router();
const logger = createLogger({ service: 'ai-service' });

const SummaryRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  assessment: z.object({
    security_percentage: z.number(),
    risk_level: z.enum(['Low', 'Medium', 'High']),
    lead_rank: z.enum(['Hot', 'Warm', 'Cold']),
    opportunity_score: z.number(),
  }),
  recommendations: z.array(z.object({ title: z.string() })).optional(),
});

/**
 * POST /summaries — generate an AI executive security summary
 * Uses Azure OpenAI (GPT-4) with sanitized, tenant-scoped input only.
 * No Microsoft Graph calls. No user authentication here.
 */
summariesRouter.post('/', async (req, res) => {
  const parse = SummaryRequestSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ data: null, error: parse.error.message });
    return;
  }

  const config = loadConfig();
  const { tenant_id, assessment, recommendations = [] } = parse.data;

  logger.info('Generating executive summary', { tenant_id });

  // TODO: When AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY are configured,
  // call the Azure OpenAI Chat Completions API with a sanitized prompt.
  // Never include raw tenant data — only normalized scores and recommendation titles.

  if (!config.azureOpenAiEndpoint || !config.azureOpenAiApiKey) {
    // Development fallback: return a placeholder summary
    const summaryText =
      `Security posture for tenant ${tenant_id}: ` +
      `${assessment.security_percentage}% secure, risk level ${assessment.risk_level}. ` +
      `Lead rank: ${assessment.lead_rank}. ` +
      `Top recommendations: ${recommendations.slice(0, 3).map((r) => r.title).join(', ') || 'None available'}.`;

    const response: ApiResponse<ExecutiveSummaryResponse> = {
      data: {
        tenant_id,
        summary: summaryText,
        generated_at: new Date().toISOString(),
      },
      error: null,
    };
    res.json(response);
    return;
  }

  // Production: call Azure OpenAI
  try {
    const prompt = `You are a security analyst. Write a concise executive summary (3-4 sentences) based on these metrics:
- Security score: ${assessment.security_percentage}%
- Risk level: ${assessment.risk_level}
- Opportunity score: ${assessment.opportunity_score}/100
- Lead rank: ${assessment.lead_rank}
- Top improvement areas: ${recommendations.slice(0, 5).map((r) => r.title).join(', ')}

Focus on business impact and recommended actions. Do not include tenant IDs or internal data.`;

    const aoaiResponse = await fetch(
      `${config.azureOpenAiEndpoint}openai/deployments/${config.azureOpenAiDeployment}/chat/completions?api-version=2024-02-01`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.azureOpenAiApiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.3,
        }),
      },
    );

    if (!aoaiResponse.ok) {
      throw new Error(`Azure OpenAI error: ${aoaiResponse.status}`);
    }

    const aoaiData = (await aoaiResponse.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const summary = aoaiData.choices[0]?.message.content ?? 'Summary unavailable';

    const response: ApiResponse<ExecutiveSummaryResponse> = {
      data: { tenant_id, summary, generated_at: new Date().toISOString() },
      error: null,
    };
    res.json(response);
  } catch (err) {
    logger.error('Azure OpenAI error', { message: (err as Error).message });
    res.status(502).json({ data: null, error: 'AI service temporarily unavailable' });
  }
});

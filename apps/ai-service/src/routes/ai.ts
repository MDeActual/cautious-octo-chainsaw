import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import { createLogger } from '@cloudmatrix/logger';
import type {
  AiRecommendation,
  ApiResponse,
  ExecutiveSummaryResponse,
  RiskAnalysisResponse,
  UsageStats,
} from '@cloudmatrix/shared-types';
import { loadConfig } from '../config.js';
import { OpenAiService } from '../services/openai.service.js';
import { MockOpenAiService } from '../services/mock-openai.service.js';
import { usageService } from '../services/usage.service.js';

export const aiRouter: ExpressRouter = Router();
const logger = createLogger({ service: 'ai-service' });

function getAiService(): OpenAiService | MockOpenAiService {
  const config = loadConfig();
  if (config.azureOpenAiEndpoint && config.azureOpenAiApiKey) {
    return new OpenAiService(
      config.azureOpenAiEndpoint,
      config.azureOpenAiApiKey,
      config.azureOpenAiDeployment,
    );
  }
  return new MockOpenAiService();
}

const AssessmentSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  secure_score_raw: z.number(),
  secure_score_max: z.number(),
  security_percentage: z.number(),
  risk_level: z.enum(['Low', 'Medium', 'High']),
  opportunity_score: z.number(),
  lead_rank: z.enum(['Hot', 'Warm', 'Cold']),
  assessed_at: z.string(),
  cis_controls: z
    .array(
      z.object({
        control_id: z.string(),
        title: z.string(),
        category: z.string(),
        status: z.enum(['compliant', 'partial', 'non-compliant']),
        score: z.number(),
        recommendations: z.array(z.string()),
      }),
    )
    .optional(),
  user_count: z.number().optional(),
  device_count: z.number().optional(),
});

const SummaryRequestSchema = z.object({
  assessment: AssessmentSchema,
  recommendations: z
    .array(
      z.object({
        id: z.string(),
        category: z.string(),
        title: z.string(),
        implementation_cost: z.string(),
        user_impact: z.string(),
        threats: z.array(z.string()),
        score_in_percentage: z.number(),
        remediation_impact: z.number(),
      }),
    )
    .optional()
    .default([]),
});

const RecommendationsRequestSchema = z.object({
  recommendations: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      title: z.string(),
      implementation_cost: z.string(),
      user_impact: z.string(),
      threats: z.array(z.string()),
      score_in_percentage: z.number(),
      remediation_impact: z.number(),
    }),
  ),
});

const RiskAnalysisRequestSchema = z.object({
  assessment: AssessmentSchema,
});

/**
 * POST /ai/summary/:tenantId
 * Generates an executive security summary using AI.
 */
aiRouter.post('/summary/:tenantId', async (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';
  const parse = SummaryRequestSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ data: null, error: parse.error.message });
    return;
  }

  logger.info('Generating executive summary', { tenant_id: tenantId });

  try {
    const ai = getAiService();
    const start = Date.now();
    const result = await ai.generateExecutiveSummary(
      tenantId,
      parse.data.assessment,
      parse.data.recommendations,
    );

    usageService.record({
      tenant_id: tenantId,
      operation: 'executive_summary',
      tokens_used: result.usage.total_tokens,
      cost_usd: ai.estimateCost(result.usage.total_tokens),
      response_time_ms: Date.now() - start,
    });

    const response: ApiResponse<ExecutiveSummaryResponse> = { data: result.data, error: null };
    res.json(response);
  } catch (err) {
    logger.error('Summary generation failed', { message: (err as Error).message });
    res.status(502).json({ data: null, error: 'AI service temporarily unavailable' });
  }
});

/**
 * POST /ai/recommendations/:tenantId
 * Returns AI-prioritized security recommendations.
 */
aiRouter.post('/recommendations/:tenantId', async (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';
  const parse = RecommendationsRequestSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ data: null, error: parse.error.message });
    return;
  }

  logger.info('Prioritizing recommendations', {
    tenant_id: tenantId,
    count: parse.data.recommendations.length,
  });

  try {
    const ai = getAiService();
    const start = Date.now();
    const result = await ai.prioritizeRecommendations(tenantId, parse.data.recommendations);

    usageService.record({
      tenant_id: tenantId,
      operation: 'recommendations',
      tokens_used: result.usage.total_tokens,
      cost_usd: ai.estimateCost(result.usage.total_tokens),
      response_time_ms: Date.now() - start,
    });

    const response: ApiResponse<AiRecommendation[]> = { data: result.data, error: null };
    res.json(response);
  } catch (err) {
    logger.error('Recommendations prioritization failed', { message: (err as Error).message });
    res.status(502).json({ data: null, error: 'AI service temporarily unavailable' });
  }
});

/**
 * POST /ai/risk-analysis/:tenantId
 * Generates a risk analysis report using AI.
 */
aiRouter.post('/risk-analysis/:tenantId', async (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';
  const parse = RiskAnalysisRequestSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ data: null, error: parse.error.message });
    return;
  }

  logger.info('Generating risk analysis', { tenant_id: tenantId });

  try {
    const ai = getAiService();
    const start = Date.now();
    const result = await ai.generateRiskAnalysis(tenantId, parse.data.assessment);

    usageService.record({
      tenant_id: tenantId,
      operation: 'risk_analysis',
      tokens_used: result.usage.total_tokens,
      cost_usd: ai.estimateCost(result.usage.total_tokens),
      response_time_ms: Date.now() - start,
    });

    const response: ApiResponse<RiskAnalysisResponse> = { data: result.data, error: null };
    res.json(response);
  } catch (err) {
    logger.error('Risk analysis failed', { message: (err as Error).message });
    res.status(502).json({ data: null, error: 'AI service temporarily unavailable' });
  }
});

/**
 * GET /ai/usage
 * Returns aggregated AI token usage statistics.
 */
aiRouter.get('/usage', (_req, res) => {
  const stats = usageService.getStats();
  const response: ApiResponse<UsageStats> = { data: stats, error: null };
  res.json(response);
});

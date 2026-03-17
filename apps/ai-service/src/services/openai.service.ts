import { createLogger } from '@cloudmatrix/logger';
import type {
  AiRecommendation,
  ExecutiveSummaryResponse,
  RiskAnalysisResponse,
  SecureScoreRecommendation,
  SecurityAssessment,
} from '@cloudmatrix/shared-types';

const logger = createLogger({ service: 'ai-service' });

const COST_PER_1K_TOKENS = 0.03; // GPT-4 approximate cost per 1k tokens

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface AiServiceResponse<T> {
  data: T;
  usage: TokenUsage;
  response_time_ms: number;
}

/**
 * Azure OpenAI service for production AI-powered insights.
 * Requires AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY environment variables.
 */
export class OpenAiService {
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly deployment: string;

  constructor(endpoint: string, apiKey: string, deployment: string) {
    this.endpoint = endpoint.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.deployment = deployment;
  }

  private async chat(
    prompt: string,
    maxTokens = 500,
    temperature = 0.7,
  ): Promise<AiServiceResponse<string>> {
    const start = Date.now();
    const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-01`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const msg = `Azure OpenAI returned ${response.status}`;
      logger.error(msg);
      throw new Error(msg);
    }

    const body = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    const content = body.choices[0]?.message.content ?? '';
    const usage: TokenUsage = {
      prompt_tokens: body.usage.prompt_tokens,
      completion_tokens: body.usage.completion_tokens,
      total_tokens: body.usage.total_tokens,
    };

    return { data: content, usage, response_time_ms: Date.now() - start };
  }

  async generateExecutiveSummary(
    tenantId: string,
    assessment: SecurityAssessment,
    recommendations: SecureScoreRecommendation[],
  ): Promise<AiServiceResponse<ExecutiveSummaryResponse>> {
    const prompt = `You are a cybersecurity executive advisor for an MSSP. Write a concise executive summary (3-4 sentences) for a client based on:
- Security score: ${assessment.security_percentage}%
- Risk level: ${assessment.risk_level}
- Opportunity score: ${assessment.opportunity_score}/100
- Lead rank: ${assessment.lead_rank}
- Top improvement areas: ${recommendations
      .slice(0, 5)
      .map((r) => r.title)
      .join(', ')}

Focus on business impact and recommended actions. Do not include internal IDs.`;

    const result = await this.chat(prompt, 300, 0.3);
    const cost = (result.usage.total_tokens / 1000) * COST_PER_1K_TOKENS;

    logger.info('Generated executive summary', {
      tenant_id: tenantId,
      tokens: result.usage.total_tokens,
      cost_usd: cost,
    });

    return {
      data: {
        tenant_id: tenantId,
        summary: result.data,
        generated_at: new Date().toISOString(),
      },
      usage: result.usage,
      response_time_ms: result.response_time_ms,
    };
  }

  async prioritizeRecommendations(
    tenantId: string,
    recommendations: SecureScoreRecommendation[],
  ): Promise<AiServiceResponse<AiRecommendation[]>> {
    const recsText = recommendations
      .map(
        (r, i) =>
          `${i + 1}. ${r.title} (category: ${r.category}, score impact: ${r.score_in_percentage}%)`,
      )
      .join('\n');

    const prompt = `You are a cybersecurity expert. Prioritize these security recommendations for a small business and return a JSON array. Each item must have: id (string), title (string), priority (1=highest), justification (string), estimated_impact (string), implementation_effort (low|medium|high).

Recommendations:
${recsText}

Return only valid JSON array, no other text.`;

    const result = await this.chat(prompt, 800, 0.5);
    const cost = (result.usage.total_tokens / 1000) * COST_PER_1K_TOKENS;

    let prioritized: AiRecommendation[];
    try {
      prioritized = JSON.parse(result.data) as AiRecommendation[];
    } catch {
      logger.warn('Failed to parse AI recommendations, using fallback ordering', {
        tenant_id: tenantId,
      });
      prioritized = recommendations.map((r, i) => ({
        id: r.id,
        title: r.title,
        priority: i + 1,
        justification: `Addresses ${r.category} security gap with ${r.score_in_percentage}% score impact.`,
        estimated_impact: `${r.remediation_impact} point score improvement`,
        implementation_effort: (r.implementation_cost?.toLowerCase() as AiRecommendation['implementation_effort']) ?? 'medium',
      }));
    }

    logger.info('Prioritized recommendations', {
      tenant_id: tenantId,
      count: prioritized.length,
      tokens: result.usage.total_tokens,
      cost_usd: cost,
    });

    return { data: prioritized, usage: result.usage, response_time_ms: result.response_time_ms };
  }

  async generateRiskAnalysis(
    tenantId: string,
    assessment: SecurityAssessment,
  ): Promise<AiServiceResponse<RiskAnalysisResponse>> {
    const cisGaps =
      assessment.cis_controls
        ?.filter((c) => c.status !== 'compliant')
        .map((c) => c.title)
        .join(', ') ?? 'Not assessed';

    const prompt = `You are a cybersecurity risk analyst. Based on the following security assessment, provide a JSON risk analysis with fields: risk_summary (string), key_risks (string array, max 5), recommended_actions (string array, max 5).

Assessment:
- Security score: ${assessment.security_percentage}%
- Risk level: ${assessment.risk_level}
- CIS control gaps: ${cisGaps}

Return only valid JSON, no other text.`;

    const result = await this.chat(prompt, 600, 0.4);
    const cost = (result.usage.total_tokens / 1000) * COST_PER_1K_TOKENS;

    let parsed: { risk_summary: string; key_risks: string[]; recommended_actions: string[] };
    try {
      parsed = JSON.parse(result.data) as typeof parsed;
    } catch {
      parsed = {
        risk_summary: result.data,
        key_risks: [],
        recommended_actions: [],
      };
    }

    logger.info('Generated risk analysis', {
      tenant_id: tenantId,
      tokens: result.usage.total_tokens,
      cost_usd: cost,
    });

    return {
      data: {
        tenant_id: tenantId,
        risk_level: assessment.risk_level,
        risk_summary: parsed.risk_summary,
        key_risks: parsed.key_risks,
        recommended_actions: parsed.recommended_actions,
        generated_at: new Date().toISOString(),
      },
      usage: result.usage,
      response_time_ms: result.response_time_ms,
    };
  }

  estimateCost(tokens: number): number {
    return (tokens / 1000) * COST_PER_1K_TOKENS;
  }
}

import type {
  AiRecommendation,
  ExecutiveSummaryResponse,
  RiskAnalysisResponse,
  SecureScoreRecommendation,
  SecurityAssessment,
} from '@cloudmatrix/shared-types';
import type { AiServiceResponse, TokenUsage } from './openai.service.js';

/**
 * Mock AI service for development mode.
 * Returns realistic responses without requiring Azure OpenAI credentials.
 * Used automatically when AZURE_OPENAI_ENDPOINT is not configured.
 */
export class MockOpenAiService {
  private mockUsage(promptLen: number): TokenUsage {
    const prompt_tokens = Math.floor(promptLen / 4);
    const completion_tokens = Math.floor(Math.random() * 200 + 100);
    return {
      prompt_tokens,
      completion_tokens,
      total_tokens: prompt_tokens + completion_tokens,
    };
  }

  async generateExecutiveSummary(
    tenantId: string,
    assessment: SecurityAssessment,
    recommendations: SecureScoreRecommendation[],
  ): Promise<AiServiceResponse<ExecutiveSummaryResponse>> {
    const start = Date.now();
    const topRecs = recommendations
      .slice(0, 3)
      .map((r) => r.title)
      .join(', ');

    const riskDesc =
      assessment.risk_level === 'High'
        ? 'presents significant cybersecurity exposure'
        : assessment.risk_level === 'Medium'
          ? 'demonstrates moderate security maturity with notable gaps'
          : 'maintains a solid security baseline';

    const summary =
      `The organization's current security posture ${riskDesc}, with a Microsoft Secure Score of ` +
      `${assessment.security_percentage}% against a maximum achievable score. ` +
      `Immediate remediation priorities include: ${topRecs || 'reviewing identity and access controls'}. ` +
      `Addressing these gaps is projected to significantly improve the organization's resilience against ` +
      `modern cyber threats and reduce the risk of a costly security incident.`;

    return {
      data: {
        tenant_id: tenantId,
        summary,
        generated_at: new Date().toISOString(),
        model_version: 'MockAI/1.0 (development)',
        guardrails_applied: [
          'No execution of privileged actions',
          'Sanitised inputs only — no raw tenant data',
          'Tenant-scoped context only',
          'Output reviewed before display',
        ],
        data_sources: [
          'Microsoft Secure Score (normalised percentage)',
          'CIS Controls v8 mapping (status + score)',
          'Aggregate risk level (Low/Medium/High)',
          'Opportunity score (aggregate)',
        ],
      },
      usage: this.mockUsage(summary.length),
      response_time_ms: Date.now() - start,
    };
  }

  async prioritizeRecommendations(
    tenantId: string,
    recommendations: SecureScoreRecommendation[],
  ): Promise<AiServiceResponse<AiRecommendation[]>> {
    const start = Date.now();

    // Sort by score impact (descending) as a simple mock prioritization
    const sorted = [...recommendations].sort(
      (a, b) => b.score_in_percentage - a.score_in_percentage,
    );

    const effortMap: Record<string, AiRecommendation['implementation_effort']> = {
      Low: 'low',
      Moderate: 'medium',
      High: 'high',
    };

    const prioritized: AiRecommendation[] = sorted.map((r, i) => ({
      id: r.id,
      title: r.title,
      priority: i + 1,
      justification: `This control addresses ${r.category} risks and contributes ${r.score_in_percentage}% to the overall Secure Score. Threats mitigated: ${r.threats.join(', ')}.`,
      estimated_impact: `+${r.remediation_impact} point score improvement`,
      implementation_effort: effortMap[r.implementation_cost] ?? 'medium',
    }));

    return {
      data: prioritized,
      usage: this.mockUsage(JSON.stringify(recommendations).length),
      response_time_ms: Date.now() - start,
    };
  }

  async generateRiskAnalysis(
    tenantId: string,
    assessment: SecurityAssessment,
  ): Promise<AiServiceResponse<RiskAnalysisResponse>> {
    const start = Date.now();

    const cisGaps =
      assessment.cis_controls
        ?.filter((c) => c.status !== 'compliant')
        .slice(0, 3)
        .map((c) => c.title) ?? [];

    const keyRisks =
      cisGaps.length > 0
        ? cisGaps
        : [
            'Inadequate multi-factor authentication coverage',
            'Legacy authentication protocols remain active',
            'Insufficient endpoint protection policies',
          ];

    const riskSummary =
      `Current risk assessment indicates a ${assessment.risk_level.toLowerCase()} risk profile with a ` +
      `security score of ${assessment.security_percentage}%. ` +
      `The organization should prioritize closing the identified CIS Controls v8 gaps to reduce exposure.`;

    return {
      data: {
        tenant_id: tenantId,
        risk_level: assessment.risk_level,
        risk_summary: riskSummary,
        key_risks: keyRisks,
        recommended_actions: [
          'Enable MFA for all user accounts immediately',
          'Block legacy authentication protocols at the identity provider',
          'Enroll all devices in an MDM compliance policy',
          'Deploy endpoint protection on all managed devices',
          'Review and restrict privileged account access',
        ],
        generated_at: new Date().toISOString(),
      },
      usage: this.mockUsage(riskSummary.length),
      response_time_ms: Date.now() - start,
    };
  }

  estimateCost(_tokens: number): number {
    return 0;
  }
}

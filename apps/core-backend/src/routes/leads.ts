import { Router, type Router as ExpressRouter } from 'express';
import type { ApiResponse, LeadRankResult } from '@cloudmatrix/shared-types';
import { assessmentStore } from '../store.js';

export const leadsRouter: ExpressRouter = Router();

function buildJustification(
  riskLevel: string,
  opportunityScore: number,
  leadRank: string,
): string {
  const rankDescriptions: Record<string, string> = {
    Hot: 'High-priority prospect with significant security gaps and strong revenue potential.',
    Warm: 'Moderate security gaps present opportunity for managed security services.',
    Cold: 'Low security risk — prospect may not require immediate MSSP intervention.',
  };

  return (
    `${rankDescriptions[leadRank] ?? 'Assessment complete.'} ` +
    `Risk level: ${riskLevel}. Opportunity score: ${opportunityScore}/100.`
  );
}

/**
 * GET /leads/:tenantId/rank
 * Returns the lead ranking with business justification based on the most recent assessment.
 */
leadsRouter.get('/:tenantId/rank', (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';
  const assessment = assessmentStore.getLatest(tenantId);

  if (!assessment) {
    res.status(404).json({
      data: null,
      error: 'No assessment found for this tenant. Run POST /assessments/:tenantId/refresh first.',
    });
    return;
  }

  const result: LeadRankResult = {
    tenant_id: tenantId,
    lead_rank: assessment.lead_rank,
    risk_level: assessment.risk_level,
    opportunity_score: assessment.opportunity_score,
    justification: buildJustification(
      assessment.risk_level,
      assessment.opportunity_score,
      assessment.lead_rank,
    ),
    assessed_at: assessment.assessed_at,
  };

  const response: ApiResponse<LeadRankResult> = { data: result, error: null };
  res.json(response);
});

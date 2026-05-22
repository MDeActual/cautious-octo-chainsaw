import { Router, type Router as ExpressRouter } from 'express';
import { createLogger } from '@cloudmatrix/logger';
import type { ApiResponse, SecurityAssessment, TrendResult } from '@cloudmatrix/shared-types';
import { buildAssessment } from '../scoring.js';
import { GraphProxyClient } from '../clients/graph-proxy.client.js';
import { CisMappingService } from '../services/cis-mapping.service.js';
import { TrendAnalysisService } from '../services/trend-analysis.service.js';
import { loadConfig } from '../config.js';
import { assessmentStore } from '../store.js';

export const assessmentsRouter: ExpressRouter = Router();

const logger = createLogger({ service: 'core-backend' });
const config = loadConfig();
const graphProxy = new GraphProxyClient(config.graphProxyUrl);
const cisMappingService = new CisMappingService();
const trendAnalysisService = new TrendAnalysisService();

/**
 * GET /assessments/:tenantId/current
 * Returns the most recent assessment for a tenant.
 */
assessmentsRouter.get('/:tenantId/current', (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';
  const latest = assessmentStore.getLatest(tenantId);

  const response: ApiResponse<SecurityAssessment | null> = {
    data: latest ?? null,
    error: latest ? null : 'No assessment found for this tenant',
  };
  res.status(latest ? 200 : 404).json(response);
});

/**
 * GET /assessments/:tenantId/history
 * Returns the last 30 assessments for a tenant.
 */
assessmentsRouter.get('/:tenantId/history', (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';
  const history = assessmentStore.getHistory(tenantId).slice(-30);

  const response: ApiResponse<SecurityAssessment[]> = {
    data: history,
    error: null,
    meta: { tenant_id: tenantId, count: history.length },
  };
  res.json(response);
});

/**
 * GET /assessments/:tenantId/trends
 * Returns trend analysis across all historical assessments.
 */
assessmentsRouter.get('/:tenantId/trends', (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';
  const history = assessmentStore.getHistory(tenantId);
  const trend = trendAnalysisService.analyzeTrend(history);

  const response: ApiResponse<TrendResult> = {
    data: trend,
    error: null,
    meta: { tenant_id: tenantId, data_points: history.length },
  };
  res.json(response);
});

/**
 * POST /assessments/:tenantId/refresh
 * Full assessment pipeline:
 *   1. Fetch Secure Score from Graph Proxy
 *   2. Fetch recommendations from Graph Proxy
 *   3. Fetch Defender signals (incidents + risky users) from Graph Proxy
 *   4. Map to CIS Controls v8
 *   5. Calculate scoring (security %, risk level, opportunity, lead rank)
 *   6. Persist in-memory
 *   7. Publish automation event (fire-and-forget, failure-safe)
 *   8. Return full assessment
 *
 * Defender signal weighting:
 *   - Active high-severity incidents add up to +15 pts to opportunity score (capped)
 *   - High-risk users add up to +10 pts to opportunity score (capped)
 *   These reflect additional managed-service upsell indicators beyond Secure Score alone.
 */
assessmentsRouter.post('/:tenantId/refresh', async (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';

  logger.info('Starting assessment refresh', { tenant_id: tenantId });

  try {
    // Step 1: Fetch Secure Score
    const secureScore = await graphProxy.getSecureScore(tenantId);
    logger.info('Fetched secure score', {
      tenant_id: tenantId,
      score: secureScore.current_score,
      max: secureScore.max_score,
    });

    // Step 2: Fetch recommendations
    const recommendations = await graphProxy.getRecommendations(tenantId);
    logger.info('Fetched recommendations', {
      tenant_id: tenantId,
      count: recommendations.length,
    });

    // Step 3: Fetch Defender signals (best-effort — does not fail the assessment)
    let activeIncidentCount = 0;
    let riskyUserCount = 0;
    try {
      const defenderSignals = await graphProxy.getDefenderSignals(tenantId);
      activeIncidentCount = defenderSignals.active_incident_count;
      riskyUserCount = defenderSignals.risky_user_count;
      logger.info('Fetched Defender signals', {
        tenant_id: tenantId,
        incidents: activeIncidentCount,
        risky_users: riskyUserCount,
      });
    } catch (defenderErr) {
      logger.warn('Defender signal fetch failed — continuing without signals', {
        message: (defenderErr as Error).message,
      });
    }

    // Step 4: Map to CIS Controls v8
    const cisControls = cisMappingService.mapRecommendationsToCisControls(recommendations);

    // Step 5: Build assessment (scoring calculated inside buildAssessment)
    const assessment = buildAssessment(secureScore, 0, 0, cisControls, {
      activeIncidentCount,
      riskyUserCount,
    });

    // Step 6: Persist in-memory
    assessmentStore.add(assessment);

    // Step 7: Publish automation event (fire-and-forget)
    publishAutomationEvent(tenantId, assessment, config.automationServiceUrl).catch((err) => {
      logger.warn('Failed to publish automation event', { message: (err as Error).message });
    });

    logger.info('Assessment complete', {
      tenant_id: tenantId,
      risk_level: assessment.risk_level,
      lead_rank: assessment.lead_rank,
      active_incident_count: assessment.active_incident_count,
      risky_user_count: assessment.risky_user_count,
    });

    const response: ApiResponse<SecurityAssessment> = { data: assessment, error: null };
    res.status(201).json(response);
  } catch (err) {
    logger.error('Assessment refresh failed', { message: (err as Error).message });
    res.status(502).json({
      data: null,
      error: `Assessment pipeline failed: ${(err as Error).message}`,
    });
  }
});

async function publishAutomationEvent(
  tenantId: string,
  assessment: SecurityAssessment,
  automationServiceUrl: string,
): Promise<void> {
  await fetch(`${automationServiceUrl}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: 'assessment_complete',
      tenant_id: tenantId,
      payload: {
        assessment_id: assessment.id,
        risk_level: assessment.risk_level,
        lead_rank: assessment.lead_rank,
        security_percentage: assessment.security_percentage,
        active_incident_count: assessment.active_incident_count,
        risky_user_count: assessment.risky_user_count,
      },
    }),
  });
}


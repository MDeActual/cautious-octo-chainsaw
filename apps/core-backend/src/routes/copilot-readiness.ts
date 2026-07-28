import { Router, type Router as ExpressRouter } from 'express';
import { createLogger } from '@cloudmatrix/logger';
import type { ApiResponse, CopilotReadinessAssessment } from '@cloudmatrix/shared-types';
import { GraphProxyClient } from '../clients/graph-proxy.client.js';
import { CopilotReadinessService } from '../services/copilot-readiness.service.js';
import { loadConfig } from '../config.js';

export const copilotReadinessRouter: ExpressRouter = Router();

const logger = createLogger({ service: 'core-backend' });
const config = loadConfig();
const graphProxy = new GraphProxyClient(config.graphProxyUrl);
const copilotReadinessService = new CopilotReadinessService();

/**
 * POST /copilot-readiness/:tenantId/assess
 *
 * Evaluates M365 Copilot readiness for a tenant.
 * Checks MFA coverage, Conditional Access posture, DLP/sensitivity labels,
 * legacy auth blocking, audit logging, and privileged access hygiene.
 *
 * Returns a readiness score (0–100), per-check breakdown, and a Copilot
 * upsell lead rank.
 */
copilotReadinessRouter.post('/:tenantId/assess', async (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';

  logger.info('Starting Copilot readiness assessment', { tenant_id: tenantId });

  try {
    const recommendations = await graphProxy.getRecommendations(tenantId);
    const readiness = copilotReadinessService.assess(tenantId, recommendations);

    logger.info('Copilot readiness assessed', {
      tenant_id: tenantId,
      readiness_percentage: readiness.readiness_percentage,
      status: readiness.status,
    });

    const response: ApiResponse<CopilotReadinessAssessment> = { data: readiness, error: null };
    res.status(201).json(response);
  } catch (err) {
    logger.error('Copilot readiness assessment failed', { message: (err as Error).message });
    res.status(502).json({
      data: null,
      error: `Copilot readiness assessment failed: ${(err as Error).message}`,
    });
  }
});

/**
 * GET /copilot-readiness/:tenantId/latest
 *
 * Returns the latest cached Copilot readiness assessment.
 * Re-run POST /:tenantId/assess to refresh.
 */
copilotReadinessRouter.get('/:tenantId/latest', async (req, res) => {
  const tenantId = req.params['tenantId'] ?? '';

  logger.info('Fetching latest Copilot readiness', { tenant_id: tenantId });

  // For Phase 1, we re-compute on every request (no persistence layer yet)
  try {
    const recommendations = await graphProxy.getRecommendations(tenantId);
    const readiness = copilotReadinessService.assess(tenantId, recommendations);

    const response: ApiResponse<CopilotReadinessAssessment> = { data: readiness, error: null };
    res.json(response);
  } catch (err) {
    logger.error('Copilot readiness fetch failed', { message: (err as Error).message });
    res.status(502).json({
      data: null,
      error: `Copilot readiness fetch failed: ${(err as Error).message}`,
    });
  }
});

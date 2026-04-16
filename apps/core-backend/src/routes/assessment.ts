import { Router, type Router as ExpressRouter, type Request, type Response, type NextFunction } from 'express';
import type { ApiResponse, SecurityAssessment, SecureScoreRecommendation } from '@cloudmatrix/shared-types';
import { createLogger } from '@cloudmatrix/logger';
import { GraphProxyClient } from '../services/graphProxyClient.js';
import { buildAssessment } from '../services/scoring.js';
import { loadConfig } from '../config.js';

const logger = createLogger({ service: 'core-backend' });
const config = loadConfig();
const graphProxyClient = new GraphProxyClient(config.graphProxyUrl);

export const assessmentRouter: ExpressRouter = Router();

/**
 * GET /assessment/:tenantId
 *
 * Retrieves a complete security assessment for a tenant by:
 * 1. Fetching Secure Score from graph-proxy
 * 2. Computing risk level and improvement score using scoring logic
 * 3. Fetching recommendations from graph-proxy
 * 4. Returning combined assessment data
 *
 * Response format:
 * {
 *   data: {
 *     score: number,
 *     riskLevel: 'Low' | 'Medium' | 'High',
 *     recommendations: SecureScoreRecommendation[]
 *   }
 * }
 */
assessmentRouter.get('/:tenantId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    logger.info('Generating security assessment', { tenantId });

    // Step 1: Fetch Secure Score from graph-proxy
    const scoreData = await graphProxyClient.getSecureScore(tenantId);

    // Step 2: Build assessment using scoring logic
    const assessment = buildAssessment(scoreData);

    // Step 3: Fetch recommendations from graph-proxy
    const recommendations = await graphProxyClient.getRecommendations(tenantId);

    // Step 4: Return combined response
    const response: ApiResponse<{
      score: number;
      riskLevel: SecurityAssessment['risk_level'];
      recommendations: SecureScoreRecommendation[];
      assessment: SecurityAssessment;
    }> = {
      data: {
        score: assessment.security_percentage,
        riskLevel: assessment.risk_level,
        recommendations,
        assessment,
      },
      error: null,
      meta: {
        tenant_id: tenantId,
        assessed_at: assessment.assessed_at,
        recommendation_count: recommendations.length,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error generating assessment', {
      tenantId: req.params.tenantId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
});

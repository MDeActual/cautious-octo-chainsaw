import { Router, type Router as ExpressRouter, type Request, type Response, type NextFunction } from 'express';
import type { ApiResponse, SecureScoreData, SecureScoreRecommendation } from '@cloudmatrix/shared-types';
import { createLogger } from '@cloudmatrix/logger';
import { graphClient } from '../services/graphClient.js';

const logger = createLogger({ service: 'graph-proxy' });

export const secureScoreRouter: ExpressRouter = Router();

/**
 * GET /tenants/:tenantId/secure-score
 * Returns the Microsoft Secure Score for a given tenant.
 * In production, this calls the Microsoft Graph Security API using app-only auth.
 */
secureScoreRouter.get('/:tenantId/secure-score', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      const response: ApiResponse<null> = { data: null, error: 'tenantId is required' };
      res.status(400).json(response);
      return;
    }

    logger.info('Fetching secure score', { tenantId });

    const scoreData = await graphClient.getSecureScore(tenantId);
    const response: ApiResponse<SecureScoreData> = { data: scoreData, error: null };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching secure score', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId: req.params.tenantId,
    });
    next(error);
  }
});

/**
 * GET /tenants/:tenantId/recommendations
 * Returns Secure Score improvement actions for a given tenant.
 */
secureScoreRouter.get('/:tenantId/recommendations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      const response: ApiResponse<null> = { data: null, error: 'tenantId is required' };
      res.status(400).json(response);
      return;
    }

    logger.info('Fetching recommendations', { tenantId });

    const recommendations = await graphClient.getRecommendations(tenantId);
    const response: ApiResponse<SecureScoreRecommendation[]> = {
      data: recommendations,
      error: null,
      meta: { tenant_id: tenantId, count: recommendations.length },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching recommendations', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId: req.params.tenantId,
    });
    next(error);
  }
});

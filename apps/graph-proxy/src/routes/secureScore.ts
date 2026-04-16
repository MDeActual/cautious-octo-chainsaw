import { Router, type Router as ExpressRouter, type Request, type Response, type NextFunction } from 'express';
import type { ApiResponse, SecureScoreData, SecureScoreRecommendation } from '@cloudmatrix/shared-types';
import { createLogger } from '@cloudmatrix/logger';
import { graphClient } from '../services/graphClient.js';

const logger = createLogger({ service: 'graph-proxy' });

export const secureScoreRouter: ExpressRouter = Router();

/**
 * GET /tenants/:tenantId/secure-score
 * Returns the Microsoft Secure Score for a given tenant.
 */
secureScoreRouter.get('/:tenantId/secure-score', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

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
 * GET /tenants/:tenantId/secure-score/history
 * Returns historical Secure Score data (last 30 entries).
 */
secureScoreRouter.get('/:tenantId/secure-score/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    logger.info('Fetching secure score history', { tenantId });

    const history = await graphClient.getSecureScoreHistory(tenantId);
    const response: ApiResponse<SecureScoreData[]> = {
      data: history,
      error: null,
      meta: { tenant_id: tenantId, count: history.length },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching secure score history', {
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

/**
 * GET /tenants/:tenantId/alerts
 * Returns active security alerts for a given tenant.
 */
secureScoreRouter.get('/:tenantId/alerts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    logger.info('Fetching alerts', { tenantId });

    const alerts = await graphClient.getAlerts(tenantId);
    const response: ApiResponse<unknown[]> = {
      data: alerts,
      error: null,
      meta: { tenant_id: tenantId, count: alerts.length },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching alerts', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId: req.params.tenantId,
    });
    next(error);
  }
});

/**
 * GET /tenants/:tenantId/devices/compliance
 * Returns device compliance summary for a given tenant.
 */
secureScoreRouter.get('/:tenantId/devices/compliance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    logger.info('Fetching device compliance', { tenantId });

    const compliance = await graphClient.getDeviceCompliance(tenantId);
    const response: ApiResponse<typeof compliance> = { data: compliance, error: null };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching device compliance', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId: req.params.tenantId,
    });
    next(error);
  }
});

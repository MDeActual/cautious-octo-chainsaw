import { Router, type Router as ExpressRouter, type Request, type Response, type NextFunction } from 'express';
import type {
  ApiResponse,
  DefenderSignalSummary,
  SecureScoreControlProfile,
  SecureScoreData,
  SecureScoreRecommendation,
} from '@cloudmatrix/shared-types';
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
 * GET /tenants/:tenantId/secure-score-control-profiles
 * Returns Secure Score control profiles with structured metadata.
 */
secureScoreRouter.get('/:tenantId/secure-score-control-profiles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    logger.info('Fetching secure score control profiles', { tenantId });

    const profiles = await graphClient.getSecureScoreControlProfiles(tenantId);
    const response: ApiResponse<SecureScoreControlProfile[]> = {
      data: profiles,
      error: null,
      meta: { tenant_id: tenantId, count: profiles.length },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching secure score control profiles', {
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
 * GET /tenants/:tenantId/defender/signals
 * Returns consolidated Defender XDR incident and risky user summary.
 * Combines data from /security/incidents and /identityProtection/riskyUsers.
 */
secureScoreRouter.get('/:tenantId/defender/signals', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    logger.info('Fetching Defender signals', { tenantId });

    const signals = await graphClient.getDefenderSignals(tenantId);
    const response: ApiResponse<DefenderSignalSummary> = { data: signals, error: null };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching Defender signals', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId: req.params.tenantId,
    });
    next(error);
  }
});

/**
 * GET /tenants/:tenantId/defender/incidents
 * Returns active Defender XDR incidents.
 */
secureScoreRouter.get('/:tenantId/defender/incidents', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    logger.info('Fetching Defender incidents', { tenantId });

    const incidents = await graphClient.getIncidents(tenantId);
    const response: ApiResponse<typeof incidents> = {
      data: incidents,
      error: null,
      meta: { tenant_id: tenantId, count: incidents.length },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching Defender incidents', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId: req.params.tenantId,
    });
    next(error);
  }
});

/**
 * GET /tenants/:tenantId/identity/risky-users
 * Returns risky users from Entra ID Protection.
 */
secureScoreRouter.get('/:tenantId/identity/risky-users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    logger.info('Fetching risky users', { tenantId });

    const riskyUsers = await graphClient.getRiskyUsers(tenantId);
    const response: ApiResponse<typeof riskyUsers> = {
      data: riskyUsers,
      error: null,
      meta: { tenant_id: tenantId, count: riskyUsers.length },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching risky users', {
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


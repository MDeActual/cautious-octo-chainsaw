import { Router, type Router as ExpressRouter } from 'express';
import type { ApiResponse } from '@cloudmatrix/shared-types';
import { createLogger } from '@cloudmatrix/logger';
import type { GraphService } from '../services/graph.service.js';
import type { MockGraphService } from '../services/mock-graph.service.js';

const logger = createLogger({ service: 'graph-proxy' });

export function createGraphRouter(graphService: GraphService | MockGraphService): ExpressRouter {
  const router: ExpressRouter = Router();

  /**
   * GET /graph/secure-score/:tenantId
   * Returns the current Microsoft Secure Score for the given tenant.
   */
  router.get('/secure-score/:tenantId', async (req, res) => {
    const { tenantId } = req.params;
    logger.info('GET secure-score', { tenantId });
    try {
      const data = await graphService.getSecureScore(tenantId ?? '');
      const response: ApiResponse<Record<string, unknown>> = { data, error: null };
      res.json(response);
    } catch (err) {
      logger.error('Error fetching secure score', { error: String(err), tenantId });
      res.status(502).json({ data: null, error: 'Failed to fetch Secure Score' });
    }
  });

  /**
   * GET /graph/secure-score/:tenantId/history
   * Returns historical Secure Score data (up to 30 entries).
   */
  router.get('/secure-score/:tenantId/history', async (req, res) => {
    const { tenantId } = req.params;
    logger.info('GET secure-score history', { tenantId });
    try {
      const data = await graphService.getSecureScoreHistory(tenantId ?? '');
      const response: ApiResponse<Record<string, unknown>[]> = {
        data,
        error: null,
        meta: { count: data.length },
      };
      res.json(response);
    } catch (err) {
      logger.error('Error fetching secure score history', { error: String(err), tenantId });
      res.status(502).json({ data: null, error: 'Failed to fetch Secure Score history' });
    }
  });

  /**
   * GET /graph/recommendations/:tenantId
   * Returns security recommendations for the given tenant.
   */
  router.get('/recommendations/:tenantId', async (req, res) => {
    const { tenantId } = req.params;
    logger.info('GET recommendations', { tenantId });
    try {
      const data = await graphService.getSecurityRecommendations(tenantId ?? '');
      const response: ApiResponse<Record<string, unknown>[]> = {
        data,
        error: null,
        meta: { count: data.length },
      };
      res.json(response);
    } catch (err) {
      logger.error('Error fetching recommendations', { error: String(err), tenantId });
      res.status(502).json({ data: null, error: 'Failed to fetch security recommendations' });
    }
  });

  /**
   * GET /graph/alerts/:tenantId
   * Returns security alerts for the given tenant.
   */
  router.get('/alerts/:tenantId', async (req, res) => {
    const { tenantId } = req.params;
    logger.info('GET alerts', { tenantId });
    try {
      const data = await graphService.getSecurityAlerts(tenantId ?? '');
      const response: ApiResponse<Record<string, unknown>[]> = {
        data,
        error: null,
        meta: { count: data.length },
      };
      res.json(response);
    } catch (err) {
      logger.error('Error fetching alerts', { error: String(err), tenantId });
      res.status(502).json({ data: null, error: 'Failed to fetch security alerts' });
    }
  });

  /**
   * GET /graph/devices/:tenantId/compliance
   * Returns device compliance data for the given tenant.
   */
  router.get('/devices/:tenantId/compliance', async (req, res) => {
    const { tenantId } = req.params;
    logger.info('GET device compliance', { tenantId });
    try {
      const data = await graphService.getDeviceCompliance(tenantId ?? '');
      const response: ApiResponse<Record<string, unknown>[]> = {
        data,
        error: null,
        meta: { count: data.length },
      };
      res.json(response);
    } catch (err) {
      logger.error('Error fetching device compliance', { error: String(err), tenantId });
      res.status(502).json({ data: null, error: 'Failed to fetch device compliance' });
    }
  });

  return router;
}


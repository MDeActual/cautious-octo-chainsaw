import { Router, type Router as ExpressRouter } from 'express';
import type { HealthResponse } from '@cloudmatrix/shared-types';

export const healthRouter: ExpressRouter = Router();

healthRouter.get('/health', (_req, res) => {
  const body: HealthResponse = {
    status: 'ok',
    service: 'ai-service',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  };
  res.json({ data: body, error: null });
});

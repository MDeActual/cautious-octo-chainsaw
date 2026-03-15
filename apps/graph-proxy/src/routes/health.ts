import { Router } from 'express';

export const healthRouter: Router = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    data: { status: 'ok', service: 'graph-proxy', timestamp: new Date().toISOString() },
    error: null,
  });
});

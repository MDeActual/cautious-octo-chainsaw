import { Router } from 'express';

export const healthRouter: Router = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    data: { status: 'ok', service: 'core-backend', timestamp: new Date().toISOString() },
    error: null,
  });
});

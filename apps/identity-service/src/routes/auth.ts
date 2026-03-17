import { Router, type Router as ExpressRouter } from 'express';
import { requireAuth } from '../middleware/auth.js';

export const authRouter: ExpressRouter = Router();

/**
 * POST /auth/validate
 * Validates the bearer token and returns the decoded claims.
 */
authRouter.post('/validate', requireAuth, (req, res) => {
  res.json({ data: req.claims ?? null, error: null });
});

/**
 * GET /auth/me
 * Returns the current user info from the validated token.
 */
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ data: req.claims ?? null, error: null });
});

import type { Request, Response, NextFunction } from 'express';
import { ApiScopeError, createTokenValidator, extractBearerToken, loadAuthConfig } from '@cloudmatrix/auth-utils';
import '../types/auth.js';

// Shared validator/configuration; there is no development or production bypass.
const validate = createTokenValidator(loadAuthConfig());
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) throw new Error('Missing token');
    req.principal = await validate(token);
  } catch (error) {
    const status = error instanceof ApiScopeError ? 403 : 401;
    if (status === 401) res.setHeader('WWW-Authenticate', 'Bearer');
    res.status(status).json({ data: null, error: status === 401 ? 'Unauthorized' : 'Forbidden' });
    return;
  }
  next();
}

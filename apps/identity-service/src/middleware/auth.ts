import type { Request, Response, NextFunction } from 'express';
import { extractBearerToken, validateEntraToken } from '@cloudmatrix/auth-utils';
import { loadConfig } from '../config.js';
import '../types/auth.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const config = loadConfig();

  // Only allow bypass if explicitly configured
  if (config.allowAuthBypass) {
    // Skip validation but still extract token if present for consistency
    const token = extractBearerToken(req.headers['authorization']);
    if (token) {
      // In bypass mode, don't validate but still allow the request
      req.claims = undefined;
    }
    next();
    return;
  }

  const token = extractBearerToken(req.headers['authorization']);
  if (!token) {
    res.status(401).json({ data: null, error: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    const claims = await validateEntraToken(token, {
      tenantIssuer: config.tenantIssuer,
      audience: config.apiAudience,
    });
    req.claims = claims;
    next();
  } catch {
    res.status(401).json({ data: null, error: 'Invalid or expired token' });
  }
}

export function requireRole(role: 'Customer' | 'Sales' | 'Analyst' | 'Admin') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const claims = req.claims;
    if (!claims) {
      res.status(401).json({ data: null, error: 'Unauthorized' });
      return;
    }
    // Customer is the lowest privilege; then Sales, Analyst, Admin
    const hierarchy: Record<string, number> = { Customer: 1, Sales: 2, Analyst: 3, Admin: 4 };
    if ((hierarchy[claims.role] ?? 0) < (hierarchy[role] ?? 0)) {
      res.status(403).json({ data: null, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

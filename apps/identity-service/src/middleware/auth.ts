import type { Request, Response, NextFunction } from 'express';
import { extractBearerToken, validateEntraToken } from '@cloudmatrix/auth-utils';
import type { CloudMatrixJwtClaims } from '@cloudmatrix/shared-types';
import { loadConfig } from '../config.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      claims?: CloudMatrixJwtClaims;
    }
  }
}

const DEV_MOCK_USER: CloudMatrixJwtClaims = {
  sub: 'dev-user',
  email: 'dev@localhost',
  role: 'Admin',
  tenant_id: 'dev-tenant',
};

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const config = loadConfig();

  if (!config.tenantIssuer || !config.apiAudience) {
    // Dev mode: inject mock admin user and skip token validation
    req.claims = DEV_MOCK_USER;
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

export function requireRole(role: 'Sales' | 'Analyst' | 'Admin') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const claims = req.claims;
    if (!claims) {
      res.status(401).json({ data: null, error: 'Unauthorized' });
      return;
    }
    const hierarchy: Record<string, number> = { Sales: 1, Analyst: 2, Admin: 3 };
    if ((hierarchy[claims.role] ?? 0) < (hierarchy[role] ?? 0)) {
      res.status(403).json({ data: null, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}


import { createLogger } from '@cloudmatrix/logger';
import { UserRole } from '@cloudmatrix/shared-types';
import { NextFunction, Request, Response } from 'express';

import { validateJwt } from './jwt';

const logger = createLogger('auth-utils');

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const context = req.tenantContext;

    if (!context) {
      res.status(401).json({
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    if (!allowedRoles.includes(context.userRole)) {
      logger.warn('Access denied: insufficient role', {
        userId: context.userId,
        tenantId: context.tenantId,
        requiredRoles: allowedRoles,
        actualRole: context.userRole,
      });

      res.status(403).json({
        data: null,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
      return;
    }

    next();
  };
}

export function requireTenantAccess(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Bearer token required' },
    });
    return;
  }

  const token = authHeader.substring(7);
  const tenantId = process.env['ENTRA_TENANT_ID'];

  if (!tenantId) {
    logger.error('ENTRA_TENANT_ID not configured');
    res.status(500).json({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Server configuration error' },
    });
    return;
  }

  validateJwt(token, tenantId)
    .then((payload) => {
      req.tenantContext = {
        tenantId: payload.tid,
        userId: payload.oid,
        userEmail: payload.email,
        userRole: (payload.roles?.[0] ?? UserRole.ReadOnly),
      };
      next();
    })
    .catch((err: unknown) => {
      logger.warn('JWT validation failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      res.status(401).json({
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
      });
    });
}

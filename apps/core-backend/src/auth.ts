import type { RequestHandler, Response } from 'express';
import type { VerifiedPrincipal } from '@cloudmatrix/shared-types';
import { ApiScopeError, extractBearerToken, type TokenValidator } from '@cloudmatrix/auth-utils';

const principalKey = Symbol('verified-principal');
type AuthLocals = { [principalKey]?: VerifiedPrincipal };

export function requirePrincipal(validate: TokenValidator): RequestHandler {
  return async (req, res, next) => {
    const token = extractBearerToken(req.headers.authorization);
    try {
      if (!token) throw new Error('Missing token');
      (res.locals as AuthLocals)[principalKey] = await validate(token);
    } catch (error) {
      const status = error instanceof ApiScopeError ? 403 : 401;
      if (status === 401) res.setHeader('WWW-Authenticate', 'Bearer');
      res.status(status).json({ data: null, error: status === 401 ? 'Unauthorized' : 'Forbidden' });
      return;
    }
    next();
  };
}

export function authorizedTenant(res: Response): string {
  const principal = (res.locals as AuthLocals)[principalKey];
  if (!principal) throw new Error('Verified principal required');
  return principal.tid;
}

/** Selectors are consistency checks only, including nested/duplicate values. */
function selectorsMatch(value: unknown, tenant: string): boolean {
  if (!value || typeof value !== 'object') return true;
  return Object.entries(value).every(([key, item]) => {
    if (['tenantid', 'tenant', 'tid', 'entratenantid'].includes(key.replace(/[-_]/g, '').toLowerCase())) {
      return typeof item === 'string' && item === tenant;
    }
    return selectorsMatch(item, tenant);
  });
}

export const requireTenantConsistency: RequestHandler = (req, res, next) => {
  const tenant = authorizedTenant(res);
  const headersMatch = ['x-tenant-id', 'x-tenant', 'tenant-id', 'tenantid', 'tid', 'x-ms-tenant-id', 'x-entra-tenant-id']
    .every((header) => req.headers[header] === undefined || req.headers[header] === tenant);
  if (!headersMatch || !selectorsMatch(req.params, tenant)
      || !selectorsMatch(req.query, tenant) || !selectorsMatch(req.body, tenant)) {
    res.status(403).json({ data: null, error: 'Tenant access denied' });
    return;
  }
  next();
};

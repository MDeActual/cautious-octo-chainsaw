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

export function verifiedPrincipal(res: Response): VerifiedPrincipal {
  const principal = (res.locals as AuthLocals)[principalKey];
  if (!principal) throw new Error('Verified principal required');
  return principal;
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

/** Explicit pilot membership is independent of possessing an API delegated scope. */
export function requireMembership(members: ReadonlySet<string>): RequestHandler {
  return (_req, res, next) => {
    const p = verifiedPrincipal(res);
    if (!members.has(`${p.tid}:${p.oid}`)) {
      res.status(403).json({ data: null, error: 'Assessment access has not been granted to this account', code: 'MEMBERSHIP_REQUIRED' });
      return;
    }
    next();
  };
}
export function loadMembers(value = process.env['ASSESSMENT_MEMBERS']): ReadonlySet<string> {
  if (!value) return new Set();
  const entries: unknown = JSON.parse(value);
  const guid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  const pattern = new RegExp(`^${guid}:${guid}$`);
  if (!Array.isArray(entries) || entries.some(entry => typeof entry !== 'string' || !pattern.test(entry))) {
    throw new Error('ASSESSMENT_MEMBERS must be a JSON array of tenant-guid:object-guid pairs');
  }
  return new Set(entries as string[]);
}

import { UserRole } from '@cloudmatrix/shared-types';
import { Request } from 'express';


export interface TenantContext {
  tenantId: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
}

export function getTenantContext(req: Request): TenantContext {
  if (!req.tenantContext) {
    throw new Error('Tenant context not set. Ensure authentication middleware is applied.');
  }
  return req.tenantContext;
}

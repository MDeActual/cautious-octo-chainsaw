import type { Request } from 'express';
import { createLogger } from '@cloudmatrix/logger';

const logger = createLogger({ service: 'identity-service' });

export interface AuditEntry {
  tenant_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  occurred_at: string;
}

/**
 * Logs an audit entry. In production this would persist to the audit_logs table.
 * Falls back to structured console logging when no database is available.
 */
export function logAudit(
  tenantId: string,
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  req?: Request,
): void {
  const entry: AuditEntry = {
    tenant_id: tenantId,
    user_id: userId,
    action,
    resource_type: resourceType,
    ...(resourceId !== undefined && { resource_id: resourceId }),
    ...(details !== undefined && { details }),
    ...(req !== undefined && {
      ip_address: req.ip ?? req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
    }),
    occurred_at: new Date().toISOString(),
  };

  logger.info('audit', entry as unknown as Record<string, unknown>);
}

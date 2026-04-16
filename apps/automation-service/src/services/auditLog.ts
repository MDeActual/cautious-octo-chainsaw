import { createLogger } from '@cloudmatrix/logger';
import type { AuditLogEntry } from '../types.js';

const logger = createLogger({ service: 'automation-service' });

/**
 * Stores an audit log entry for an executed action
 * Phase 1: Logs to console/structured logger
 * Phase 2: Will persist to database for compliance tracking
 *
 * @param entry - Audit log entry to record
 */
export function logAction(entry: AuditLogEntry): void {
  logger.info('Action audit log', {
    actionId: entry.actionId,
    tenantId: entry.tenantId,
    actionType: entry.actionType,
    riskLevel: entry.riskLevel,
    requestedBy: entry.requestedBy,
    status: entry.status,
    reason: entry.reason,
    timestamp: entry.timestamp,
  });

  // Phase 1: All audit logs are written to structured logger
  // Phase 2: Will also persist to database for:
  // - Compliance reporting
  // - Forensic analysis
  // - Approval workflow tracking
  // - Rollback support
}

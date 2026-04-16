import { createLogger } from '@cloudmatrix/logger';
import type { ActionType, ExecutionStatus } from '../types.js';

const logger = createLogger({ service: 'automation-service' });

/**
 * Simulates execution of a remediation action
 * Phase 1: All actions are simulated (no actual Microsoft Graph calls)
 * Phase 2: Will connect to Microsoft Graph for real tenant modifications
 *
 * @param actionType - Type of action to execute
 * @param tenantId - Tenant identifier
 * @param requestedBy - User who requested the action
 * @returns Execution status
 */
export function executeAction(
  actionType: ActionType,
  tenantId: string,
  requestedBy: string
): ExecutionStatus {
  logger.info('Simulating action execution', {
    actionType,
    tenantId,
    requestedBy,
  });

  // Phase 1: All execution is simulated
  // Log the action that would be taken
  switch (actionType) {
    case 'enable_mfa':
      logger.info('SIMULATED: Would enable MFA for all users', { tenantId });
      break;
    case 'tighten_conditional_access':
      logger.info('SIMULATED: Would tighten conditional access policies', { tenantId });
      break;
    case 'disable_legacy_auth':
      logger.info('SIMULATED: Would disable legacy authentication protocols', { tenantId });
      break;
    case 'rotate_admin_review':
      logger.info('SIMULATED: Would trigger admin privilege review', { tenantId });
      break;
    case 'isolate_device':
      logger.info('SIMULATED: Would isolate compromised device', { tenantId });
      break;
    default:
      logger.warn('Unknown action type', { actionType });
  }

  // Phase 1: Always return 'executed' for allowed actions
  // Phase 2: Will return actual execution results from Microsoft Graph
  return 'executed';
}

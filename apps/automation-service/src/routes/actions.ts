import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@cloudmatrix/logger';
import type { ApiResponse } from '@cloudmatrix/shared-types';
import type {
  ExecuteActionRequest,
  ExecuteActionResponse,
  AuditLogEntry,
  ActionType,
  RiskLevel,
} from '../types.js';
import { evaluatePolicy } from '../services/policyEngine.js';
import { executeAction } from '../services/executor.js';
import { logAction } from '../services/auditLog.js';

export const actionsRouter: ExpressRouter = Router();
const logger = createLogger({ service: 'automation-service' });

// Validation schema for execute-action endpoint
const ExecuteActionSchema = z.object({
  tenantId: z.string().uuid(),
  actionType: z.enum([
    'enable_mfa',
    'tighten_conditional_access',
    'disable_legacy_auth',
    'rotate_admin_review',
    'isolate_device',
  ]),
  riskLevel: z.enum(['low', 'medium', 'high']),
  requestedBy: z.string().min(1),
});

/**
 * POST /execute-action
 *
 * Receives a requested remediation action and decides whether to:
 * 1. Auto-execute
 * 2. Require approval
 * 3. Deny due to permissions/plan
 *
 * Phase 1: No real Microsoft tenant changes; execution is simulated only
 */
actionsRouter.post('/execute-action', (req, res) => {
  // A) Validate required fields
  const parse = ExecuteActionSchema.safeParse(req.body);
  if (!parse.success) {
    const response: ApiResponse<null> = {
      data: null,
      error: `Invalid request: ${parse.error.message}`,
    };
    res.status(400).json(response);
    return;
  }

  const request: ExecuteActionRequest = parse.data;
  const actionId = uuidv4();

  try {
    logger.info('Action execution request received', {
      actionId,
      tenantId: request.tenantId,
      actionType: request.actionType,
      riskLevel: request.riskLevel,
      requestedBy: request.requestedBy,
    });

    // B) Check entitlement tier and permissions
    const policyDecision = evaluatePolicy(request.tenantId, request.riskLevel);

    let status: ExecuteActionResponse['status'];
    let reason: string | undefined;

    if (!policyDecision.allowed) {
      // Action denied due to entitlement tier
      status = 'denied';
      reason = policyDecision.reason;
    } else if (policyDecision.requiresApproval) {
      // C) High-risk actions require approval (Elite tier)
      status = 'pending_approval';
      reason = policyDecision.reason;
    } else {
      // Action allowed - simulate execution
      status = executeAction(request.actionType, request.tenantId, request.requestedBy);
    }

    // D) Always create audit log entry
    const auditEntry: AuditLogEntry = {
      actionId,
      tenantId: request.tenantId,
      actionType: request.actionType,
      riskLevel: request.riskLevel,
      requestedBy: request.requestedBy,
      status,
      reason,
      timestamp: new Date().toISOString(),
    };
    logAction(auditEntry);

    // Return response
    const responseData: ExecuteActionResponse = {
      status,
      actionId,
      ...(reason && { reason }),
    };

    const response: ApiResponse<ExecuteActionResponse> = {
      data: responseData,
      error: null,
    };

    res.json(response);
  } catch (err) {
    logger.error('Error processing action execution request', {
      actionId,
      tenantId: request.tenantId,
      actionType: request.actionType,
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
    });

    const response: ApiResponse<null> = {
      data: null,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

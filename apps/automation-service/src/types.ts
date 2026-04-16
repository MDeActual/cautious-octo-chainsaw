// ─── Risk Levels ─────────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';

// ─── Entitlement Tiers ───────────────────────────────────────────────────────

export type EntitlementTier = 'free' | 'core' | 'pro' | 'elite';

// ─── Action Types ────────────────────────────────────────────────────────────

export type ActionType =
  | 'enable_mfa'
  | 'tighten_conditional_access'
  | 'disable_legacy_auth'
  | 'rotate_admin_review'
  | 'isolate_device';

// ─── Execution Status ────────────────────────────────────────────────────────

export type ExecutionStatus = 'executed' | 'pending_approval' | 'denied';

// ─── Execute Action Request ──────────────────────────────────────────────────

export interface ExecuteActionRequest {
  tenantId: string;
  actionType: ActionType;
  riskLevel: RiskLevel;
  requestedBy: string;
}

// ─── Execute Action Response ─────────────────────────────────────────────────

export interface ExecuteActionResponse {
  status: ExecutionStatus;
  reason?: string;
  actionId: string;
}

// ─── Policy Decision ─────────────────────────────────────────────────────────

export interface PolicyDecision {
  allowed: boolean;
  requiresApproval: boolean;
  reason?: string;
}

// ─── Audit Log Entry ─────────────────────────────────────────────────────────

export interface AuditLogEntry {
  actionId: string;
  tenantId: string;
  actionType: ActionType;
  riskLevel: RiskLevel;
  requestedBy: string;
  status: ExecutionStatus;
  reason?: string;
  timestamp: string;
}

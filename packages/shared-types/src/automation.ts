export enum AutomationTriggerEvent {
  AssessmentCompleted = 'assessment.completed',
  RiskLevelChanged = 'risk_level.changed',
  LeadRankChanged = 'lead_rank.changed',
  ComplianceViolation = 'compliance.violation',
  TenantOnboarded = 'tenant.onboarded',
}

export enum AutomationActionType {
  SendEmail = 'send_email',
  SendTeamsNotification = 'send_teams_notification',
  CreateTask = 'create_task',
  UpdateLeadRank = 'update_lead_rank',
  GenerateReport = 'generate_report',
}

export enum AutomationStatus {
  Success = 'success',
  Failed = 'failed',
  Pending = 'pending',
}

export interface AutomationCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in';
  value: unknown;
}

export interface AutomationAction {
  type: AutomationActionType;
  config: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerEvent: AutomationTriggerEvent;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationHistory {
  id: string;
  ruleId: string;
  tenantId: string;
  triggerData: Record<string, unknown>;
  actionsExecuted: AutomationAction[];
  status: AutomationStatus;
  error?: string;
  executedAt: string;
}

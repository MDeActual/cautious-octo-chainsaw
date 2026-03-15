export enum RiskLevel {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export enum LeadRank {
  Hot = 'hot',
  Warm = 'warm',
  Cold = 'cold',
}

export enum ControlStatus {
  Implemented = 'implemented',
  PartiallyImplemented = 'partially_implemented',
  NotImplemented = 'not_implemented',
  NotApplicable = 'not_applicable',
}

export interface CisControl {
  id: string;
  assessmentId: string;
  controlId: string;
  controlName: string;
  status: ControlStatus;
  score: number;
  maxScore: number;
  recommendations: string[];
  evidence: Record<string, unknown>;
  createdAt: string;
}

export interface Assessment {
  id: string;
  tenantId: string;
  secureScore: number;
  maxSecureScore: number;
  securityPercentage: number;
  riskLevel: RiskLevel;
  leadRank: LeadRank;
  assessmentData: Record<string, unknown>;
  cisControls: CisControl[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentRequest {
  tenantId: string;
}

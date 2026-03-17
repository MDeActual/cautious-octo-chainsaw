// ─── Enums ───────────────────────────────────────────────────────────────────

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type LeadRank = 'Hot' | 'Warm' | 'Cold';

export type TenantStatus = 'trial' | 'active' | 'suspended';

export type UserRole = 'Sales' | 'Analyst' | 'Admin';

// ─── JWT Claims ───────────────────────────────────────────────────────────────

export interface CloudMatrixJwtClaims {
  sub: string;
  email: string;
  role: UserRole;
  tenant_id: string;
  iat?: number;
  exp?: number;
}

// ─── API Response Envelope ───────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  meta?: Record<string, unknown>;
}

// ─── Health ──────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  timestamp: string;
}

// ─── Tenant ──────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  entra_tenant_id: string;
  status: TenantStatus;
  created_at: string;
  updated_at: string;
}

// ─── Assessment / Scoring ────────────────────────────────────────────────────

export interface SecurityAssessment {
  id: string;
  tenant_id: string;
  secure_score_raw: number;
  secure_score_max: number;
  security_percentage: number;
  risk_level: RiskLevel;
  opportunity_score: number;
  lead_rank: LeadRank;
  assessed_at: string;
}

export interface CisControl {
  control_id: string;
  title: string;
  implemented: boolean;
  score_contribution: number;
}

// ─── Graph Proxy Contracts ───────────────────────────────────────────────────

export interface SecureScoreData {
  tenant_id: string;
  current_score: number;
  max_score: number;
  average_comparative_score: number;
  created_at: string;
}

export interface SecureScoreRecommendation {
  id: string;
  category: string;
  title: string;
  implementation_cost: string;
  user_impact: string;
  threats: string[];
  score_in_percentage: number;
  remediation_impact: number;
}

// ─── Automation ──────────────────────────────────────────────────────────────

export interface AutomationEvent {
  event_type: string;
  tenant_id: string;
  payload: Record<string, unknown>;
  occurred_at: string;
}

// ─── AI ──────────────────────────────────────────────────────────────────────

export interface ExecutiveSummaryRequest {
  tenant_id: string;
  assessment: SecurityAssessment;
  recommendations: SecureScoreRecommendation[];
}

export interface ExecutiveSummaryResponse {
  tenant_id: string;
  summary: string;
  generated_at: string;
}

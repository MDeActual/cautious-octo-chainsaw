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
  cis_controls?: CisControl[];
  user_count?: number;
  device_count?: number;
}

// ─── Trend Analysis ──────────────────────────────────────────────────────────

export interface TrendResult {
  direction: 'improving' | 'stable' | 'declining';
  percentage_change: number;
  period_days: number;
}

// ─── Compliance ──────────────────────────────────────────────────────────────

export interface ComplianceFrameworkStatus {
  framework_id: string;
  name: string;
  version: string;
  region: string;
  industry: string;
  compliance_percentage: number;
  status: CisControlStatus;
  gaps: string[];
}

// ─── Lead Ranking ────────────────────────────────────────────────────────────

export interface LeadRankResult {
  tenant_id: string;
  lead_rank: LeadRank;
  risk_level: RiskLevel;
  opportunity_score: number;
  justification: string;
  assessed_at: string;
}

// ─── AI Recommendation ───────────────────────────────────────────────────────

export interface AiRecommendation {
  id: string;
  title: string;
  priority: number;
  justification: string;
  estimated_impact: string;
  implementation_effort: 'low' | 'medium' | 'high';
}

export interface RiskAnalysisResponse {
  tenant_id: string;
  risk_level: RiskLevel;
  risk_summary: string;
  key_risks: string[];
  recommended_actions: string[];
  generated_at: string;
}

// ─── AI Usage ────────────────────────────────────────────────────────────────

export interface UsageRecord {
  id: string;
  tenant_id: string;
  operation: string;
  tokens_used: number;
  cost_usd: number;
  response_time_ms: number;
  created_at: string;
}

export interface UsageStats {
  total_requests: number;
  total_tokens: number;
  total_cost_usd: number;
  by_operation: Record<string, { requests: number; tokens: number; cost_usd: number }>;
}

export type CisControlStatus = 'compliant' | 'partial' | 'non-compliant';

export interface CisControl {
  control_id: string;
  title: string;
  category: string;
  status: CisControlStatus;
  score: number;
  recommendations: string[];
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

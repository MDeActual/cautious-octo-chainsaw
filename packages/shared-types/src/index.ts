// ─── Enums ───────────────────────────────────────────────────────────────────

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type LeadRank = 'Hot' | 'Warm' | 'Cold';

export type TenantStatus = 'trial' | 'active' | 'suspended';

export type UserRole = 'Sales' | 'Analyst' | 'Admin' | 'Customer';

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
  /** Whether this tenant is managed through the CSP channel */
  csp_managed?: boolean;
  /** The CloudMatrix CSP partner tenant ID used for incentive attribution */
  csp_partner_tenant_id?: string;
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
  /** Defender XDR active incident count surfaced during assessment */
  active_incident_count?: number;
  /** Count of risky users flagged by Entra ID Protection */
  risky_user_count?: number;
  /** Copilot Readiness score (0–100) if computed */
  copilot_readiness_score?: number;
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
  /** AI transparency: which model and version generated this summary */
  model_version?: string;
  /** AI transparency: guardrails applied during generation */
  guardrails_applied?: string[];
  /** AI transparency: data sources used (normalised fields only — no raw tenant data) */
  data_sources?: string[];
}

// ─── Defender / Sentinel Signal Types ────────────────────────────────────────

export type DefenderIncidentSeverity = 'unknown' | 'informational' | 'low' | 'medium' | 'high';
export type DefenderIncidentStatus = 'active' | 'resolved' | 'inProgress' | 'redirected';

export interface DefenderIncident {
  id: string;
  display_name: string;
  severity: DefenderIncidentSeverity;
  status: DefenderIncidentStatus;
  created_at: string;
  last_updated_at: string;
  alert_count: number;
  assigned_to?: string;
}

export type RiskyUserRiskLevel = 'none' | 'low' | 'medium' | 'high' | 'hidden' | 'unknownFutureValue';
export type RiskyUserRiskState = 'none' | 'confirmedSafe' | 'remediated' | 'dismissed' | 'atRisk' | 'confirmedCompromised';

export interface RiskyUser {
  id: string;
  user_principal_name: string;
  risk_level: RiskyUserRiskLevel;
  risk_state: RiskyUserRiskState;
  risk_detail: string;
  risk_last_updated_at: string;
}

export interface DefenderSignalSummary {
  tenant_id: string;
  active_incidents: DefenderIncident[];
  active_incident_count: number;
  high_severity_incident_count: number;
  risky_users: RiskyUser[];
  risky_user_count: number;
  high_risk_user_count: number;
  fetched_at: string;
}

// ─── Secure Score Control Profiles ───────────────────────────────────────────

export interface SecureScoreControlProfile {
  id: string;
  title: string;
  tier: string;
  user_impact: string;
  implementation_cost: string;
  threats: string[];
  service: string;
  max_score: number;
}

// ─── Copilot Readiness Assessment ────────────────────────────────────────────

export type CopilotReadinessStatus = 'ready' | 'partial' | 'not-ready';

export interface CopilotReadinessCheck {
  check_id: string;
  name: string;
  description: string;
  status: CopilotReadinessStatus;
  score: number;
  max_score: number;
  remediation_hint?: string;
}

export interface CopilotReadinessAssessment {
  tenant_id: string;
  overall_score: number;
  max_score: number;
  readiness_percentage: number;
  status: CopilotReadinessStatus;
  checks: CopilotReadinessCheck[];
  assessed_at: string;
  /** Lead rank specific to Copilot upsell opportunity */
  copilot_lead_rank: LeadRank;
}

// ─── CSP Attribution & Usage ─────────────────────────────────────────────────

export interface CspUsageRecord {
  tenant_id: string;
  tenant_name: string;
  csp_partner_tenant_id: string;
  month: string;
  active_user_count: number;
  assessment_count: number;
  ai_summary_count: number;
  tier: string;
}

export interface CspMonthlyReport {
  partner_tenant_id: string;
  report_month: string;
  generated_at: string;
  total_tenants: number;
  total_active_users: number;
  total_assessments: number;
  tenants: CspUsageRecord[];
}

// ─── Admin Consent ────────────────────────────────────────────────────────────

export interface AdminConsentUrlResponse {
  consent_url: string;
  state: string;
  tenant_id: string;
}

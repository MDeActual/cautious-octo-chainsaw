import { v4 as uuidv4 } from 'uuid';
import type {
  LeadRank,
  RiskLevel,
  SecureScoreData,
  SecurityAssessment,
} from '@cloudmatrix/shared-types';

/**
 * Normalizes a raw Secure Score to a 0–100 percentage.
 */
export function normalizeScore(current: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((current / max) * 100);
}

/**
 * Maps a security percentage to a RiskLevel per CIS Controls v8 thresholds.
 * ≥ 80% → Low, 50–79% → Medium, < 50% → High
 */
export function calculateRiskLevel(securityPercentage: number): RiskLevel {
  if (securityPercentage >= 80) return 'Low';
  if (securityPercentage >= 50) return 'Medium';
  return 'High';
}

/**
 * Calculates an opportunity score (0–100).
 * Higher risk = higher opportunity for an MSSP to add value.
 */
export function calculateOpportunityScore(securityPercentage: number): number {
  return Math.round(100 - securityPercentage);
}

/**
 * Maps a risk level + opportunity score to a LeadRank.
 * High risk + high opportunity → Hot
 * Medium risk → Warm
 * Low risk → Cold
 */
export function calculateLeadRank(riskLevel: RiskLevel, opportunityScore: number): LeadRank {
  if (riskLevel === 'High' && opportunityScore >= 50) return 'Hot';
  if (riskLevel === 'Medium') return 'Warm';
  return 'Cold';
}

/**
 * Creates a full SecurityAssessment from raw Secure Score data.
 */
export function buildAssessment(scoreData: SecureScoreData): SecurityAssessment {
  const securityPercentage = normalizeScore(scoreData.current_score, scoreData.max_score);
  const riskLevel = calculateRiskLevel(securityPercentage);
  const opportunityScore = calculateOpportunityScore(securityPercentage);
  const leadRank = calculateLeadRank(riskLevel, opportunityScore);

  return {
    id: uuidv4(),
    tenant_id: scoreData.tenant_id,
    secure_score_raw: scoreData.current_score,
    secure_score_max: scoreData.max_score,
    security_percentage: securityPercentage,
    risk_level: riskLevel,
    opportunity_score: opportunityScore,
    lead_rank: leadRank,
    assessed_at: new Date().toISOString(),
  };
}

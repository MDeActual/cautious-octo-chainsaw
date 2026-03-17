import { v4 as uuidv4 } from 'uuid';
import type {
  CisControl,
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
 * > 70% → Low, >= 40% and <= 70% → Medium, < 40% → High
 */
export function calculateRiskLevel(securityPercentage: number): RiskLevel {
  if (securityPercentage > 70) return 'Low';
  if (securityPercentage >= 40) return 'Medium';
  return 'High';
}

/**
 * Calculates an opportunity score (0–100).
 * Combines security gap (70% weight) with tenant size score (30% weight).
 */
export function calculateOpportunityScore(
  securityPercentage: number,
  userCount = 0,
  deviceCount = 0,
): number {
  const securityGap = 100 - securityPercentage;
  const sizeScore = Math.min(100, (userCount * 0.5 + deviceCount * 0.3) / 10);
  return Math.round(securityGap * 0.7 + sizeScore * 0.3);
}

/**
 * Maps a risk level + opportunity score to a LeadRank.
 * High risk + opportunity > 60 → Hot
 * Low risk + opportunity < 30 → Cold
 * All others → Warm
 */
export function calculateLeadRank(riskLevel: RiskLevel, opportunityScore: number): LeadRank {
  if (riskLevel === 'High' && opportunityScore > 60) return 'Hot';
  if (riskLevel === 'Low' && opportunityScore < 30) return 'Cold';
  return 'Warm';
}

/**
 * Creates a full SecurityAssessment from raw Secure Score data.
 */
export function buildAssessment(
  scoreData: SecureScoreData,
  userCount = 0,
  deviceCount = 0,
  cisControls?: CisControl[],
): SecurityAssessment {
  const securityPercentage = normalizeScore(scoreData.current_score, scoreData.max_score);
  const riskLevel = calculateRiskLevel(securityPercentage);
  const opportunityScore = calculateOpportunityScore(securityPercentage, userCount, deviceCount);
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
    ...(cisControls !== undefined ? { cis_controls: cisControls } : {}),
    ...(userCount > 0 ? { user_count: userCount } : {}),
    ...(deviceCount > 0 ? { device_count: deviceCount } : {}),
  };
}

/**
 * Class-based ScoringService for dependency-injection friendly usage.
 */
export class ScoringService {
  calculateSecurityPercentage(secureScore: number, maxScore: number): number {
    return normalizeScore(secureScore, maxScore);
  }

  determineRiskLevel(securityPercentage: number): RiskLevel {
    return calculateRiskLevel(securityPercentage);
  }

  calculateOpportunityScore(
    securityPercentage: number,
    userCount: number,
    deviceCount: number,
  ): number {
    return calculateOpportunityScore(securityPercentage, userCount, deviceCount);
  }

  determineLeadRank(riskLevel: RiskLevel, opportunityScore: number): LeadRank {
    return calculateLeadRank(riskLevel, opportunityScore);
  }

  async createAssessment(data: {
    tenantId: string;
    secureScore: number;
    maxScore: number;
    userCount: number;
    deviceCount: number;
    rawData?: Record<string, unknown>;
    cisControls?: CisControl[];
  }): Promise<SecurityAssessment> {
    const scoreData: SecureScoreData = {
      tenant_id: data.tenantId,
      current_score: data.secureScore,
      max_score: data.maxScore,
      average_comparative_score: 50,
      created_at: new Date().toISOString(),
    };
    return buildAssessment(scoreData, data.userCount, data.deviceCount, data.cisControls);
  }
}


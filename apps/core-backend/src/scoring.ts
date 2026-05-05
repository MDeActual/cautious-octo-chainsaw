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
 *
 * @see docs/SCORING_RULES.md § "Risk Level Thresholds"
 */
export function calculateRiskLevel(securityPercentage: number): RiskLevel {
  if (securityPercentage > 70) return 'Low';
  if (securityPercentage >= 40) return 'Medium';
  return 'High';
}

/**
 * Calculates an opportunity score (0–100).
 * Combines security gap (60% weight), tenant size (20% weight), and
 * Defender signal severity (20% weight).
 *
 * Weights are initial estimates — review after first sales cycle data.
 * @see docs/SCORING_RULES.md § "Opportunity Score"
 */
export function calculateOpportunityScore(
  securityPercentage: number,
  userCount = 0,
  deviceCount = 0,
  defenderSignals?: { activeIncidentCount?: number; riskyUserCount?: number },
): number {
  const securityGap = 100 - securityPercentage;
  const sizeScore = Math.min(100, (userCount * 0.5 + deviceCount * 0.3) / 10);

  // Each high-severity-equivalent incident adds up to 3 pts; capped at 15
  const incidentBoost = Math.min(15, (defenderSignals?.activeIncidentCount ?? 0) * 3);
  // Each risky user adds 2 pts; capped at 10
  const riskyUserBoost = Math.min(10, (defenderSignals?.riskyUserCount ?? 0) * 2);
  const defenderBoost = Math.min(20, incidentBoost + riskyUserBoost);

  return Math.min(100, Math.round(securityGap * 0.6 + sizeScore * 0.2 + defenderBoost));
}

/**
 * Maps a risk level + opportunity score to a LeadRank.
 * High risk + opportunity > 60 → Hot
 * Low risk + opportunity < 30 → Cold
 * All others → Warm
 *
 * @see docs/SCORING_RULES.md § "Lead Rank Rules"
 */
export function calculateLeadRank(riskLevel: RiskLevel, opportunityScore: number): LeadRank {
  if (riskLevel === 'High' && opportunityScore > 60) return 'Hot';
  if (riskLevel === 'Low' && opportunityScore < 30) return 'Cold';
  return 'Warm';
}

/**
 * Creates a full SecurityAssessment from raw Secure Score data,
 * optionally enriched with Defender signal counts.
 */
export function buildAssessment(
  scoreData: SecureScoreData,
  userCount = 0,
  deviceCount = 0,
  cisControls?: CisControl[],
  defenderSignals?: { activeIncidentCount?: number; riskyUserCount?: number },
): SecurityAssessment {
  const securityPercentage = normalizeScore(scoreData.current_score, scoreData.max_score);
  const riskLevel = calculateRiskLevel(securityPercentage);
  const opportunityScore = calculateOpportunityScore(
    securityPercentage,
    userCount,
    deviceCount,
    defenderSignals,
  );
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
    ...(defenderSignals?.activeIncidentCount !== undefined
      ? { active_incident_count: defenderSignals.activeIncidentCount }
      : {}),
    ...(defenderSignals?.riskyUserCount !== undefined
      ? { risky_user_count: defenderSignals.riskyUserCount }
      : {}),
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
    defenderSignals?: { activeIncidentCount?: number; riskyUserCount?: number };
  }): Promise<SecurityAssessment> {
    const scoreData: SecureScoreData = {
      tenant_id: data.tenantId,
      current_score: data.secureScore,
      max_score: data.maxScore,
      average_comparative_score: 50,
      created_at: new Date().toISOString(),
    };
    return buildAssessment(scoreData, data.userCount, data.deviceCount, data.cisControls, data.defenderSignals);
  }
}


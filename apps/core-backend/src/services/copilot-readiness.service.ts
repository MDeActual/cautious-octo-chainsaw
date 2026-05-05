import type {
  CopilotReadinessAssessment,
  CopilotReadinessCheck,
  CopilotReadinessStatus,
  LeadRank,
  SecureScoreRecommendation,
} from '@cloudmatrix/shared-types';

/**
 * M365 Copilot prerequisite checks and their maximum contribution to the readiness score.
 * Based on Microsoft's official Copilot for M365 prerequisites:
 * https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-requirements
 */
const COPILOT_CHECKS: Array<{
  check_id: string;
  name: string;
  description: string;
  max_score: number;
  remediation_hint: string;
  /** Recommendation IDs that indicate this check is NOT satisfied */
  failing_recommendation_ids: string[];
}> = [
  {
    check_id: 'mfa-coverage',
    name: 'MFA Coverage',
    description: 'All users require multi-factor authentication — a mandatory Copilot prerequisite.',
    max_score: 25,
    remediation_hint:
      'Enable MFA for all users via Entra ID Security Defaults or Conditional Access policies.',
    failing_recommendation_ids: ['EnableMFA', 'mfa-required-for-admins', 'enable-security-defaults'],
  },
  {
    check_id: 'conditional-access',
    name: 'Conditional Access Posture',
    description: 'Conditional Access policies enforce zero-trust access to M365 services.',
    max_score: 20,
    remediation_hint:
      'Create Conditional Access policies targeting all cloud apps. Start with the Microsoft-recommended baseline policies.',
    failing_recommendation_ids: ['block-legacy-auth', 'ConditionalAccess', 'tighten-conditional-access'],
  },
  {
    check_id: 'dlp-sensitivity-labels',
    name: 'DLP & Sensitivity Labels',
    description:
      'Data Loss Prevention policies and sensitivity labels protect data that Copilot can access.',
    max_score: 20,
    remediation_hint:
      'Configure Microsoft Purview sensitivity labels and DLP policies before deploying Copilot to prevent data oversharing.',
    failing_recommendation_ids: ['DataProtection', 'DLP', 'SensitivityLabels'],
  },
  {
    check_id: 'legacy-auth-blocked',
    name: 'Legacy Auth Blocked',
    description: 'Legacy authentication protocols are disabled — required to secure Copilot sessions.',
    max_score: 15,
    remediation_hint:
      'Block all legacy authentication in Conditional Access. Test with sign-in logs before enforcing.',
    failing_recommendation_ids: ['block-legacy-auth', 'BlockLegacyAuth'],
  },
  {
    check_id: 'audit-logging',
    name: 'Audit Logging Enabled',
    description:
      'Unified audit logging captures all Copilot interactions for compliance and forensics.',
    max_score: 10,
    remediation_hint: 'Enable Microsoft 365 Unified Audit Log in the Compliance portal.',
    failing_recommendation_ids: ['AuditLogging', 'LogRetention'],
  },
  {
    check_id: 'privileged-access',
    name: 'Privileged Account Hygiene',
    description:
      'Admin accounts use dedicated privileged identities, reducing Copilot blast radius.',
    max_score: 10,
    remediation_hint:
      'Implement Privileged Identity Management (PIM) for all admin roles. Ensure admins use separate accounts for privileged tasks.',
    failing_recommendation_ids: ['PrivilegedAccess', 'AccountManagement'],
  },
];

/**
 * Maps a ratio (0–1) to a readiness status.
 */
function ratioToStatus(ratio: number): CopilotReadinessStatus {
  if (ratio >= 0.8) return 'ready';
  if (ratio >= 0.4) return 'partial';
  return 'not-ready';
}

/**
 * Maps a readiness percentage to a lead rank for the Copilot upsell motion.
 * High readiness → tenant likely already planning Copilot adoption → Warm/Hot.
 * Low readiness → large remediation opportunity → Hot.
 */
function readinessToLeadRank(readinessPercentage: number): LeadRank {
  if (readinessPercentage >= 70) return 'Warm';
  if (readinessPercentage <= 30) return 'Hot';
  return 'Hot';
}

/**
 * Evaluates M365 Copilot readiness for a tenant based on open Secure Score
 * recommendations. A check is considered "not satisfied" when a corresponding
 * recommendation ID appears in the open recommendations list (meaning the
 * control has not yet been implemented).
 */
export class CopilotReadinessService {
  assess(
    tenantId: string,
    recommendations: SecureScoreRecommendation[],
  ): CopilotReadinessAssessment {
    const openIds = new Set(recommendations.map((r) => r.id));

    const checks: CopilotReadinessCheck[] = COPILOT_CHECKS.map((def) => {
      const isFailing = def.failing_recommendation_ids.some((id) => openIds.has(id));
      const score = isFailing ? 0 : def.max_score;
      const status: CopilotReadinessStatus = isFailing ? 'not-ready' : 'ready';

      return {
        check_id: def.check_id,
        name: def.name,
        description: def.description,
        status,
        score,
        max_score: def.max_score,
        ...(isFailing ? { remediation_hint: def.remediation_hint } : {}),
      };
    });

    const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
    const maxScore = checks.reduce((sum, c) => sum + c.max_score, 0);
    const readinessPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      tenant_id: tenantId,
      overall_score: totalScore,
      max_score: maxScore,
      readiness_percentage: readinessPercentage,
      status: ratioToStatus(maxScore > 0 ? totalScore / maxScore : 0),
      checks,
      assessed_at: new Date().toISOString(),
      copilot_lead_rank: readinessToLeadRank(readinessPercentage),
    };
  }
}

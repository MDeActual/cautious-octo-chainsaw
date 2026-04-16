import type { CisControl, CisControlStatus, SecureScoreRecommendation } from '@cloudmatrix/shared-types';

interface CisControlDefinition {
  control_id: string;
  title: string;
  category: string;
  profile_ids: string[];
}

/**
 * CIS Controls v8 definitions mapped to Microsoft Secure Score control profiles.
 * Maps 11 critical controls from the specification.
 */
const CIS_CONTROL_DEFINITIONS: CisControlDefinition[] = [
  {
    control_id: '1.1',
    title: 'Establish and Maintain Detailed Enterprise Asset Inventory — Identity & MFA',
    category: 'Identity',
    profile_ids: ['EnableMFA', 'BlockLegacyAuth'],
  },
  {
    control_id: '1.2',
    title: 'Address Unauthorized Assets — Password Policies',
    category: 'Identity',
    profile_ids: ['PasswordPolicy', 'AccountLockout'],
  },
  {
    control_id: '2.1',
    title: 'Establish and Maintain a Software Inventory — Device Management',
    category: 'Device',
    profile_ids: ['DeviceInventory', 'AssetManagement', 'DeviceCompliance'],
  },
  {
    control_id: '3.1',
    title: 'Establish and Maintain a Data Management Process — Data Protection',
    category: 'Data',
    profile_ids: ['DataProtection', 'DLP'],
  },
  {
    control_id: '4.1',
    title: 'Establish and Maintain a Secure Configuration Process',
    category: 'Configuration',
    profile_ids: ['SecureConfiguration', 'BaselineCompliance'],
  },
  {
    control_id: '5.1',
    title: 'Establish and Maintain an Inventory of Accounts — Privileged Access',
    category: 'Identity',
    profile_ids: ['AccountManagement', 'PrivilegedAccess'],
  },
  {
    control_id: '6.1',
    title: 'Establish an Access Granting Process — Audit Logging',
    category: 'Compliance',
    profile_ids: ['AuditLogging', 'LogRetention'],
  },
  {
    control_id: '7.1',
    title: 'Establish and Maintain a Vulnerability Management Process — Email Security',
    category: 'Email',
    profile_ids: ['EmailSecurity', 'AntiPhishing'],
  },
  {
    control_id: '8.1',
    title: 'Establish and Maintain a Malware Defense Process — Endpoint Protection',
    category: 'Endpoint',
    profile_ids: ['MalwareDefense', 'EndpointProtection'],
  },
  {
    control_id: '9.1',
    title: 'Associate Active Ports, Protocols, and Services to Asset Inventory — Network Security',
    category: 'Network',
    profile_ids: ['NetworkSecurity', 'Firewall'],
  },
  {
    control_id: '10.1',
    title: 'Establish and Maintain a Data Recovery Process — Backup & Recovery',
    category: 'Recovery',
    profile_ids: ['DataRecovery', 'BackupStrategy'],
  },
];

/**
 * Maps Microsoft Secure Score control profiles to CIS Controls v8.
 * Returns a scored, status-enriched CisControl[] for the assessment.
 */
export class CisMappingService {
  /**
   * Maps a set of Secure Score recommendations to the 11 CIS Controls v8.
   * Determines control status based on which profile IDs are represented
   * in the active recommendations.
   */
  mapRecommendationsToCisControls(recommendations: SecureScoreRecommendation[]): CisControl[] {
    const recommendationIds = new Set(recommendations.map((r) => r.id));
    const totalRecommendationScore = recommendations.reduce(
      (sum, r) => sum + r.score_in_percentage,
      0,
    );

    return CIS_CONTROL_DEFINITIONS.map((def) => {
      const matchingProfiles = def.profile_ids.filter((id) => {
        // A profile is "implemented" if it does NOT appear in open recommendations
        // (i.e., it's already done). If it appears, it still needs work.
        return !recommendationIds.has(id);
      });

      const implementedCount = matchingProfiles.length;
      const totalCount = def.profile_ids.length;
      const implementationRatio = totalCount > 0 ? implementedCount / totalCount : 1;

      let status: CisControlStatus;
      if (implementationRatio === 1) {
        status = 'compliant';
      } else if (implementationRatio > 0) {
        status = 'partial';
      } else {
        status = 'non-compliant';
      }

      // Score contribution: controls with recommendations pending reduce the score
      const pendingProfiles = def.profile_ids.filter((id) => recommendationIds.has(id));
      const pendingScore = recommendations
        .filter((r) => pendingProfiles.includes(r.id))
        .reduce((sum, r) => sum + r.score_in_percentage, 0);
      const score =
        totalRecommendationScore > 0
          ? Math.round((1 - pendingScore / totalRecommendationScore) * 100)
          : Math.round(implementationRatio * 100);

      const controlRecommendations = recommendations
        .filter((r) => pendingProfiles.includes(r.id))
        .map((r) => r.title);

      return {
        control_id: def.control_id,
        title: def.title,
        category: def.category,
        status,
        score: Math.min(100, Math.max(0, score)),
        recommendations: controlRecommendations,
      } satisfies CisControl;
    });
  }
}

import { ConfidentialClientApplication, type Configuration } from '@azure/msal-node';
import type {
  DefenderIncident,
  DefenderSignalSummary,
  RiskyUser,
  SecureScoreControlProfile,
  SecureScoreData,
  SecureScoreRecommendation,
} from '@cloudmatrix/shared-types';
import { createLogger } from '@cloudmatrix/logger';
import { loadConfig } from '../config.js';

const logger = createLogger({ service: 'graph-proxy' });

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

export interface DeviceComplianceSummary {
  tenant_id: string;
  total_devices: number;
  compliant_devices: number;
  non_compliant_devices: number;
  compliance_percentage: number;
}

/**
 * Checks whether MSAL credentials are fully configured.
 * When credentials are absent (e.g. in local dev) the client falls back to
 * deterministic mock data so the rest of the stack can run without Azure creds.
 */
function hasCredentials(): boolean {
  const cfg = loadConfig();
  return !!(cfg.graphClientId && cfg.graphClientSecret && cfg.graphTenantId);
}

/**
 * Microsoft Graph API Client
 *
 * This service is the ONLY service allowed to call Microsoft Graph APIs.
 *
 * Authentication: MSAL ConfidentialClientApplication using the
 * client_credentials flow (app-only permissions).
 *
 * Required app registration permissions (application, not delegated):
 *   - SecurityEvents.Read.All          (Secure Score, alerts)
 *   - SecurityActions.Read.All         (Secure Score control profiles)
 *   - IdentityRiskyUser.Read.All       (Risky users)
 *   - DeviceManagementManagedDevices.Read.All (Device compliance)
 *   - SecurityIncident.Read.All        (Defender XDR incidents)
 */
export class GraphClient {
  private msalClient: ConfidentialClientApplication | null = null;

  private getMsalClient(): ConfidentialClientApplication {
    if (this.msalClient) return this.msalClient;

    const cfg = loadConfig();
    const msalConfig: Configuration = {
      auth: {
        clientId: cfg.graphClientId,
        clientSecret: cfg.graphClientSecret,
        authority: `https://login.microsoftonline.com/${cfg.graphTenantId}`,
      },
    };
    this.msalClient = new ConfidentialClientApplication(msalConfig);
    return this.msalClient;
  }

  /**
   * Acquires an access token using the client_credentials flow.
   * Token is cached by MSAL and refreshed automatically.
   */
  private async getAccessToken(): Promise<string> {
    const cfg = loadConfig();
    const client = this.getMsalClient();
    const result = await client.acquireTokenByClientCredential({
      scopes: [cfg.graphScope],
    });
    if (!result?.accessToken) {
      throw new Error('MSAL returned no access token');
    }
    return result.accessToken;
  }

  /**
   * Generic GET helper for Microsoft Graph.
   * Accepts an optional tenant-specific token (for delegated calls) or uses
   * the app-only token acquired via client_credentials.
   */
  private async graphGet<T>(path: string): Promise<T> {
    const token = await this.getAccessToken();
    const response = await fetch(`${GRAPH_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ConsistencyLevel: 'eventual',
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Graph API ${path} returned ${response.status}: ${body}`);
    }

    return response.json() as Promise<T>;
  }

  // ─── Secure Score ──────────────────────────────────────────────────────────

  /**
   * Fetches Microsoft Secure Score for a tenant.
   * GET /security/secureScores?$top=1
   */
  async getSecureScore(tenantId: string): Promise<SecureScoreData> {
    if (!hasCredentials()) {
      logger.warn('Graph credentials not configured — returning mock Secure Score', { tenantId });
      return {
        tenant_id: tenantId,
        current_score: 245,
        max_score: 400,
        average_comparative_score: 220,
        created_at: new Date().toISOString(),
      };
    }

    logger.info('Fetching Secure Score from Graph API', { tenantId });
    const data = await this.graphGet<{
      value: Array<{
        currentScore: number;
        maxScore: number;
        averageComparativeScores: Array<{ basis: string; averageScore: number }>;
        createdDateTime: string;
      }>;
    }>('/security/secureScores?$top=1');

    const entry = data.value[0];
    if (!entry) throw new Error('No Secure Score data returned from Graph API');

    const avgScore =
      entry.averageComparativeScores.find((s) => s.basis === 'AllTenants')?.averageScore ?? 0;

    return {
      tenant_id: tenantId,
      current_score: entry.currentScore,
      max_score: entry.maxScore,
      average_comparative_score: avgScore,
      created_at: entry.createdDateTime,
    };
  }

  /**
   * Fetches historical Secure Score data for a tenant (last 30 entries).
   * GET /security/secureScores?$top=30
   */
  async getSecureScoreHistory(tenantId: string): Promise<SecureScoreData[]> {
    if (!hasCredentials()) {
      logger.warn('Graph credentials not configured — returning mock Secure Score history', {
        tenantId,
      });
      const now = Date.now();
      return Array.from({ length: 5 }, (_, i) => ({
        tenant_id: tenantId,
        current_score: 210 + i * 10,
        max_score: 400,
        average_comparative_score: 220,
        created_at: new Date(now - (4 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));
    }

    logger.info('Fetching Secure Score history from Graph API', { tenantId });
    const data = await this.graphGet<{
      value: Array<{
        currentScore: number;
        maxScore: number;
        averageComparativeScores: Array<{ basis: string; averageScore: number }>;
        createdDateTime: string;
      }>;
    }>('/security/secureScores?$top=30');

    return data.value.map((entry) => ({
      tenant_id: tenantId,
      current_score: entry.currentScore,
      max_score: entry.maxScore,
      average_comparative_score:
        entry.averageComparativeScores.find((s) => s.basis === 'AllTenants')?.averageScore ?? 0,
      created_at: entry.createdDateTime,
    }));
  }

  /**
   * Fetches Secure Score improvement actions.
   * GET /security/secureScoreControlProfiles
   */
  async getRecommendations(tenantId: string): Promise<SecureScoreRecommendation[]> {
    if (!hasCredentials()) {
      logger.warn('Graph credentials not configured — returning mock recommendations', {
        tenantId,
      });
      return [
        {
          id: 'mfa-required-for-admins',
          category: 'Identity',
          title: 'Require MFA for administrative roles',
          implementation_cost: 'Low',
          user_impact: 'Medium',
          threats: ['Credential Theft', 'Account Takeover'],
          score_in_percentage: 8.5,
          remediation_impact: 34,
        },
        {
          id: 'block-legacy-auth',
          category: 'Identity',
          title: 'Block legacy authentication protocols',
          implementation_cost: 'Medium',
          user_impact: 'Low',
          threats: ['Credential Theft', 'Brute Force'],
          score_in_percentage: 6.2,
          remediation_impact: 25,
        },
        {
          id: 'enable-security-defaults',
          category: 'Identity',
          title: 'Enable security defaults',
          implementation_cost: 'Low',
          user_impact: 'High',
          threats: ['Credential Theft', 'Account Takeover', 'Phishing'],
          score_in_percentage: 12.5,
          remediation_impact: 50,
        },
        {
          id: 'EnableMFA',
          category: 'Identity',
          title: 'Enable MFA for all users',
          implementation_cost: 'Low',
          user_impact: 'Moderate',
          threats: ['Phishing', 'CredentialTheft'],
          score_in_percentage: 15,
          remediation_impact: 15,
        },
        {
          id: 'EndpointProtection',
          category: 'Device',
          title: 'Enable endpoint protection on all devices',
          implementation_cost: 'Low',
          user_impact: 'Low',
          threats: ['Malware', 'Ransomware'],
          score_in_percentage: 12,
          remediation_impact: 12,
        },
      ];
    }

    logger.info('Fetching recommendations from Graph API', { tenantId });
    const data = await this.graphGet<{
      value: Array<{
        id: string;
        controlCategory: string;
        title: string;
        implementationCost: string;
        userImpact: string;
        threats: string[];
        scoreInPercentage: number;
        remediationImpact?: number;
        actionType: string;
      }>;
    }>('/security/secureScoreControlProfiles');

    return data.value.map((item) => ({
      id: item.id,
      category: item.controlCategory,
      title: item.title,
      implementation_cost: item.implementationCost,
      user_impact: item.userImpact,
      threats: item.threats,
      score_in_percentage: item.scoreInPercentage,
      remediation_impact: item.remediationImpact ?? Math.round(item.scoreInPercentage * 4),
    }));
  }

  /**
   * Fetches Secure Score control profiles (structured detail).
   * GET /security/secureScoreControlProfiles
   */
  async getSecureScoreControlProfiles(tenantId: string): Promise<SecureScoreControlProfile[]> {
    if (!hasCredentials()) {
      logger.warn('Graph credentials not configured — returning empty control profiles', {
        tenantId,
      });
      return [];
    }

    logger.info('Fetching Secure Score control profiles', { tenantId });
    const data = await this.graphGet<{
      value: Array<{
        id: string;
        title: string;
        tier: string;
        userImpact: string;
        implementationCost: string;
        threats: string[];
        service: string;
        maxScore: number;
      }>;
    }>('/security/secureScoreControlProfiles');

    return data.value.map((item) => ({
      id: item.id,
      title: item.title,
      tier: item.tier,
      user_impact: item.userImpact,
      implementation_cost: item.implementationCost,
      threats: item.threats,
      service: item.service,
      max_score: item.maxScore,
    }));
  }

  // ─── Alerts ───────────────────────────────────────────────────────────────

  /**
   * Fetches active security alerts.
   * GET /security/alerts_v2?$top=50
   */
  async getAlerts(tenantId: string): Promise<unknown[]> {
    if (!hasCredentials()) {
      logger.warn('Graph credentials not configured — returning empty alerts', { tenantId });
      return [];
    }

    logger.info('Fetching alerts from Graph API', { tenantId });
    const data = await this.graphGet<{ value: unknown[] }>('/security/alerts_v2?$top=50');
    return data.value;
  }

  // ─── Defender XDR Incidents ───────────────────────────────────────────────

  /**
   * Fetches active Defender XDR incidents.
   * GET /security/incidents?$filter=status ne 'resolved'&$top=50
   *
   * Required permission: SecurityIncident.Read.All
   */
  async getIncidents(tenantId: string): Promise<DefenderIncident[]> {
    if (!hasCredentials()) {
      logger.warn('Graph credentials not configured — returning empty incidents', { tenantId });
      return [];
    }

    logger.info('Fetching Defender incidents from Graph API', { tenantId });
    const data = await this.graphGet<{
      value: Array<{
        id: string;
        displayName: string;
        severity: string;
        status: string;
        createdDateTime: string;
        lastUpdateDateTime: string;
        alerts: Array<unknown>;
        assignedTo?: string;
      }>;
    }>("/security/incidents?$filter=status+ne+'resolved'&$top=50");

    return data.value.map((item) => ({
      id: item.id,
      display_name: item.displayName,
      severity: item.severity as DefenderIncident['severity'],
      status: item.status as DefenderIncident['status'],
      created_at: item.createdDateTime,
      last_updated_at: item.lastUpdateDateTime,
      alert_count: Array.isArray(item.alerts) ? item.alerts.length : 0,
      assigned_to: item.assignedTo,
    }));
  }

  // ─── Identity Protection — Risky Users ────────────────────────────────────

  /**
   * Fetches risky users from Entra ID Protection.
   * GET /identityProtection/riskyUsers?$filter=riskLevel ne 'none'&$top=50
   *
   * Required permission: IdentityRiskyUser.Read.All
   */
  async getRiskyUsers(tenantId: string): Promise<RiskyUser[]> {
    if (!hasCredentials()) {
      logger.warn('Graph credentials not configured — returning empty risky users', { tenantId });
      return [];
    }

    logger.info('Fetching risky users from Graph API', { tenantId });
    const data = await this.graphGet<{
      value: Array<{
        id: string;
        userPrincipalName: string;
        riskLevel: string;
        riskState: string;
        riskDetail: string;
        riskLastUpdatedDateTime: string;
      }>;
    }>("/identityProtection/riskyUsers?$filter=riskLevel+ne+'none'&$top=50");

    return data.value.map((item) => ({
      id: item.id,
      user_principal_name: item.userPrincipalName,
      risk_level: item.riskLevel as RiskyUser['risk_level'],
      risk_state: item.riskState as RiskyUser['risk_state'],
      risk_detail: item.riskDetail,
      risk_last_updated_at: item.riskLastUpdatedDateTime,
    }));
  }

  /**
   * Returns a consolidated Defender signal summary (incidents + risky users).
   */
  async getDefenderSignals(tenantId: string): Promise<DefenderSignalSummary> {
    const [incidents, riskyUsers] = await Promise.all([
      this.getIncidents(tenantId),
      this.getRiskyUsers(tenantId),
    ]);

    const highSeverityCount = incidents.filter(
      (i) => i.severity === 'high',
    ).length;
    const highRiskUsers = riskyUsers.filter((u) => u.risk_level === 'high').length;

    return {
      tenant_id: tenantId,
      active_incidents: incidents,
      active_incident_count: incidents.length,
      high_severity_incident_count: highSeverityCount,
      risky_users: riskyUsers,
      risky_user_count: riskyUsers.length,
      high_risk_user_count: highRiskUsers,
      fetched_at: new Date().toISOString(),
    };
  }

  // ─── Device Compliance ────────────────────────────────────────────────────

  /**
   * Fetches device compliance summary.
   * GET /deviceManagement/managedDevices
   *
   * Required permission: DeviceManagementManagedDevices.Read.All
   */
  async getDeviceCompliance(tenantId: string): Promise<DeviceComplianceSummary> {
    if (!hasCredentials()) {
      logger.warn('Graph credentials not configured — returning empty device compliance', {
        tenantId,
      });
      return {
        tenant_id: tenantId,
        total_devices: 0,
        compliant_devices: 0,
        non_compliant_devices: 0,
        compliance_percentage: 0,
      };
    }

    logger.info('Fetching device compliance from Graph API', { tenantId });
    const data = await this.graphGet<{
      value: Array<{ complianceState: string }>;
    }>('/deviceManagement/managedDevices?$select=complianceState&$top=999');

    const total = data.value.length;
    const compliant = data.value.filter((d) => d.complianceState === 'compliant').length;
    const nonCompliant = total - compliant;

    return {
      tenant_id: tenantId,
      total_devices: total,
      compliant_devices: compliant,
      non_compliant_devices: nonCompliant,
      compliance_percentage: total > 0 ? Math.round((compliant / total) * 100) : 0,
    };
  }
}

/**
 * Singleton instance of the Graph client.
 */
export const graphClient = new GraphClient();


import { createLogger } from '@cloudmatrix/logger';
import type {
  DefenderSignalSummary,
  SecureScoreControlProfile,
  SecureScoreData,
  SecureScoreRecommendation,
} from '@cloudmatrix/shared-types';

const logger = createLogger({ service: 'core-backend' });

interface DeviceComplianceSummary {
  tenant_id: string;
  total_devices: number;
  compliant_devices: number;
  non_compliant_devices: number;
  compliance_percentage: number;
}

/**
 * HTTP client for the Graph Proxy service.
 * Wraps all Microsoft Graph API calls behind the internal graph-proxy boundary.
 */
export class GraphProxyClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const msg = `Graph Proxy returned ${response.status} for ${path}`;
      logger.error(msg);
      throw new Error(msg);
    }
    const body = (await response.json()) as { data: T; error: string | null };
    if (body.error) {
      throw new Error(`Graph Proxy error: ${body.error}`);
    }
    return body.data;
  }

  async getSecureScore(tenantId: string): Promise<SecureScoreData> {
    return this.get<SecureScoreData>(`/tenants/${tenantId}/secure-score`);
  }

  async getSecureScoreHistory(tenantId: string): Promise<SecureScoreData[]> {
    return this.get<SecureScoreData[]>(`/tenants/${tenantId}/secure-score/history`);
  }

  async getRecommendations(tenantId: string): Promise<SecureScoreRecommendation[]> {
    return this.get<SecureScoreRecommendation[]>(`/tenants/${tenantId}/recommendations`);
  }

  async getSecureScoreControlProfiles(tenantId: string): Promise<SecureScoreControlProfile[]> {
    return this.get<SecureScoreControlProfile[]>(
      `/tenants/${tenantId}/secure-score-control-profiles`,
    );
  }

  async getAlerts(tenantId: string): Promise<unknown[]> {
    return this.get<unknown[]>(`/tenants/${tenantId}/alerts`);
  }

  async getDefenderSignals(tenantId: string): Promise<DefenderSignalSummary> {
    return this.get<DefenderSignalSummary>(`/tenants/${tenantId}/defender/signals`);
  }

  async getDeviceCompliance(tenantId: string): Promise<DeviceComplianceSummary> {
    return this.get<DeviceComplianceSummary>(`/tenants/${tenantId}/devices/compliance`);
  }
}

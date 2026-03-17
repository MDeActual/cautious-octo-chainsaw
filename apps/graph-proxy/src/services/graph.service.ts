import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { createLogger } from '@cloudmatrix/logger';

const logger = createLogger({ service: 'graph-proxy' });

export class GraphService {
  private client: Client;

  constructor() {
    const credential = new ClientSecretCredential(
      process.env['GRAPH_TENANT_ID'] ?? '',
      process.env['GRAPH_CLIENT_ID'] ?? '',
      process.env['GRAPH_CLIENT_SECRET'] ?? '',
    );

    this.client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken('https://graph.microsoft.com/.default');
          if (!token) throw new Error('Failed to acquire Graph access token');
          return token.token;
        },
      },
    });
  }

  async getSecureScore(tenantId: string): Promise<Record<string, unknown>> {
    logger.info('Fetching Secure Score', { tenantId });
    const response = await this.client
      .api('/security/secureScores')
      .top(1)
      .get() as { value: Record<string, unknown>[] };
    return response.value[0] ?? {};
  }

  async getSecureScoreHistory(tenantId: string, limit = 30): Promise<Record<string, unknown>[]> {
    logger.info('Fetching Secure Score history', { tenantId, limit });
    const response = await this.client
      .api('/security/secureScores')
      .top(limit)
      .get() as { value: Record<string, unknown>[] };
    return response.value ?? [];
  }

  async getSecurityRecommendations(tenantId: string): Promise<Record<string, unknown>[]> {
    logger.info('Fetching security recommendations', { tenantId });
    const response = await this.client
      .api('/security/secureScoreControlProfiles')
      .get() as { value: Record<string, unknown>[] };
    return response.value ?? [];
  }

  async getSecurityAlerts(tenantId: string): Promise<Record<string, unknown>[]> {
    logger.info('Fetching security alerts', { tenantId });
    const response = await this.client
      .api('/security/alerts_v2')
      .top(50)
      .get() as { value: Record<string, unknown>[] };
    return response.value ?? [];
  }

  async getDeviceCompliance(tenantId: string): Promise<Record<string, unknown>[]> {
    logger.info('Fetching device compliance', { tenantId });
    const response = await this.client
      .api('/deviceManagement/managedDevices')
      .select('id,deviceName,complianceState,operatingSystem,osVersion,lastSyncDateTime')
      .get() as { value: Record<string, unknown>[] };
    return response.value ?? [];
  }
}

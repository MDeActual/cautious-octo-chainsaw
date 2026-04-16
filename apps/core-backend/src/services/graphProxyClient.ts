import type { SecureScoreData, SecureScoreRecommendation, ApiResponse } from '@cloudmatrix/shared-types';
import { createLogger } from '@cloudmatrix/logger';

const logger = createLogger({ service: 'core-backend' });

export class GraphProxyClient {
  constructor(private readonly baseUrl: string) {}

  /**
   * Fetches Secure Score data from graph-proxy for a given tenant.
   *
   * @param tenantId - The Entra ID tenant identifier
   * @returns Secure Score data including current and max scores
   */
  async getSecureScore(tenantId: string): Promise<SecureScoreData> {
    const url = `${this.baseUrl}/tenants/${tenantId}/secure-score`;

    logger.info('Fetching secure score from graph-proxy', { tenantId, url });

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Graph proxy returned ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json() as ApiResponse<SecureScoreData>;

      if (apiResponse.error || !apiResponse.data) {
        throw new Error(apiResponse.error ?? 'No data returned from graph-proxy');
      }

      return apiResponse.data;
    } catch (error) {
      logger.error('Failed to fetch secure score from graph-proxy', {
        tenantId,
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Fetches security recommendations from graph-proxy for a given tenant.
   *
   * @param tenantId - The Entra ID tenant identifier
   * @returns Array of security improvement recommendations
   */
  async getRecommendations(tenantId: string): Promise<SecureScoreRecommendation[]> {
    const url = `${this.baseUrl}/tenants/${tenantId}/recommendations`;

    logger.info('Fetching recommendations from graph-proxy', { tenantId, url });

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Graph proxy returned ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json() as ApiResponse<SecureScoreRecommendation[]>;

      if (apiResponse.error || !apiResponse.data) {
        throw new Error(apiResponse.error ?? 'No data returned from graph-proxy');
      }

      return apiResponse.data;
    } catch (error) {
      logger.error('Failed to fetch recommendations from graph-proxy', {
        tenantId,
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

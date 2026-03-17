import { Router, type Router as ExpressRouter } from 'express';
import type { ApiResponse, SecureScoreData, SecureScoreRecommendation } from '@cloudmatrix/shared-types';

export const secureScoreRouter: ExpressRouter = Router();

/**
 * GET /tenants/:tenantId/secure-score
 * Returns the Microsoft Secure Score for a given tenant.
 * In production, this calls the Microsoft Graph Security API using app-only auth.
 */
secureScoreRouter.get('/:tenantId/secure-score', (req, res) => {
  const { tenantId } = req.params;

  // TODO: Use MSAL app-only flow (client_credentials) with GRAPH_CLIENT_ID/SECRET
  // to call https://graph.microsoft.com/v1.0/security/secureScores?$top=1
  // and filter by tenantId context.

  const stub: SecureScoreData = {
    tenant_id: tenantId ?? '',
    current_score: 0,
    max_score: 100,
    average_comparative_score: 50,
    created_at: new Date().toISOString(),
  };

  const response: ApiResponse<SecureScoreData> = { data: stub, error: null };
  res.json(response);
});

/**
 * GET /tenants/:tenantId/recommendations
 * Returns Secure Score improvement actions for a given tenant.
 */
secureScoreRouter.get('/:tenantId/recommendations', (req, res) => {
  const { tenantId } = req.params;

  // TODO: Call https://graph.microsoft.com/v1.0/security/secureScoreControlProfiles

  const stub: SecureScoreRecommendation[] = [];
  const response: ApiResponse<SecureScoreRecommendation[]> = {
    data: stub,
    error: null,
    meta: { tenant_id: tenantId, count: 0 },
  };
  res.json(response);
});

import { Router, type Router as ExpressRouter } from 'express';
import type { ApiResponse, SecureScoreData, SecureScoreRecommendation } from '@cloudmatrix/shared-types';

export const secureScoreRouter: ExpressRouter = Router();

/**
 * GET /tenants/:tenantId/secure-score
 * Returns the Microsoft Secure Score for a given tenant.
 */
secureScoreRouter.get('/:tenantId/secure-score', (req, res) => {
  const { tenantId } = req.params;

  // TODO: Use MSAL app-only flow to call https://graph.microsoft.com/v1.0/security/secureScores
  const stub: SecureScoreData = {
    tenant_id: tenantId ?? '',
    current_score: 42,
    max_score: 100,
    average_comparative_score: 50,
    created_at: new Date().toISOString(),
  };

  const response: ApiResponse<SecureScoreData> = { data: stub, error: null };
  res.json(response);
});

/**
 * GET /tenants/:tenantId/secure-score/history
 * Returns historical Secure Score data (last 30 entries).
 */
secureScoreRouter.get('/:tenantId/secure-score/history', (req, res) => {
  const { tenantId } = req.params;

  // TODO: Call https://graph.microsoft.com/v1.0/security/secureScores?$top=30
  const now = Date.now();
  const history: SecureScoreData[] = Array.from({ length: 5 }, (_, i) => ({
    tenant_id: tenantId ?? '',
    current_score: 35 + i * 2,
    max_score: 100,
    average_comparative_score: 50,
    created_at: new Date(now - (4 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const response: ApiResponse<SecureScoreData[]> = {
    data: history,
    error: null,
    meta: { tenant_id: tenantId, count: history.length },
  };
  res.json(response);
});

/**
 * GET /tenants/:tenantId/recommendations
 * Returns Secure Score improvement actions for a given tenant.
 */
secureScoreRouter.get('/:tenantId/recommendations', (req, res) => {
  const { tenantId } = req.params;

  // TODO: Call https://graph.microsoft.com/v1.0/security/secureScoreControlProfiles
  const stub: SecureScoreRecommendation[] = [
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
      id: 'BlockLegacyAuth',
      category: 'Identity',
      title: 'Block legacy authentication protocols',
      implementation_cost: 'Low',
      user_impact: 'Low',
      threats: ['BruteForce', 'CredentialTheft'],
      score_in_percentage: 8,
      remediation_impact: 8,
    },
    {
      id: 'PasswordPolicy',
      category: 'Identity',
      title: 'Enforce strong password policy',
      implementation_cost: 'Low',
      user_impact: 'Low',
      threats: ['BruteForce'],
      score_in_percentage: 5,
      remediation_impact: 5,
    },
    {
      id: 'DeviceCompliance',
      category: 'Device',
      title: 'Enroll devices in MDM compliance policy',
      implementation_cost: 'Moderate',
      user_impact: 'Moderate',
      threats: ['UnmanagedDevice'],
      score_in_percentage: 10,
      remediation_impact: 10,
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

  const response: ApiResponse<SecureScoreRecommendation[]> = {
    data: stub,
    error: null,
    meta: { tenant_id: tenantId, count: stub.length },
  };
  res.json(response);
});

/**
 * GET /tenants/:tenantId/alerts
 * Returns active security alerts for a given tenant.
 */
secureScoreRouter.get('/:tenantId/alerts', (req, res) => {
  const { tenantId } = req.params;

  // TODO: Call https://graph.microsoft.com/v1.0/security/alerts_v2?$top=50
  const response: ApiResponse<unknown[]> = {
    data: [],
    error: null,
    meta: { tenant_id: tenantId, count: 0 },
  };
  res.json(response);
});

/**
 * GET /tenants/:tenantId/devices/compliance
 * Returns device compliance summary for a given tenant.
 */
secureScoreRouter.get('/:tenantId/devices/compliance', (req, res) => {
  const { tenantId } = req.params;

  // TODO: Call https://graph.microsoft.com/v1.0/deviceManagement/managedDevices
  const stub = {
    tenant_id: tenantId ?? '',
    total_devices: 0,
    compliant_devices: 0,
    non_compliant_devices: 0,
    compliance_percentage: 0,
  };

  const response: ApiResponse<typeof stub> = { data: stub, error: null };
  res.json(response);
});

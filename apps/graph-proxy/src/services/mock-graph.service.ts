/**
 * Mock Graph Service for development without Microsoft Graph credentials.
 * Returns realistic sample data for all supported endpoints.
 */
export class MockGraphService {
  async getSecureScore(_tenantId: string): Promise<Record<string, unknown>> {
    return {
      id: 'mock-secure-score-id',
      azureTenantId: _tenantId,
      activeUserCount: 45,
      currentScore: 62,
      maxScore: 100,
      enabledServices: ['AAD', 'EXO', 'ODB', 'MDE'],
      averageComparativeScores: [
        { basis: 'AllTenants', averageScore: 37.2 },
        { basis: 'TotalSeats', averageScore: 44.1 },
      ],
      controlScores: [
        { controlName: 'MFARegistrationV2', score: 7, description: 'Require MFA for all users' },
        { controlName: 'adminMFAV2', score: 9, description: 'Require MFA for admins' },
        { controlName: 'blockLegacyAuthentication', score: 4, description: 'Block legacy auth protocols' },
      ],
      createdDateTime: new Date().toISOString(),
    };
  }

  async getSecureScoreHistory(_tenantId: string, limit = 30): Promise<Record<string, unknown>[]> {
    const scores: Record<string, unknown>[] = [];
    const now = Date.now();
    for (let i = 0; i < Math.min(limit, 10); i++) {
      scores.push({
        id: `mock-score-${i}`,
        azureTenantId: _tenantId,
        currentScore: Math.max(40, 62 - i * 2),
        maxScore: 100,
        createdDateTime: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    return scores;
  }

  async getSecurityRecommendations(_tenantId: string): Promise<Record<string, unknown>[]> {
    return [
      {
        id: 'EnableMFA',
        actionUrl: 'https://portal.azure.com/#view/Microsoft_AAD_IAM/MfaWizardBlade',
        category: 'Identity',
        title: 'Require MFA for all users',
        implementationCost: 'Low',
        userImpact: 'Moderate',
        threats: ['AccountBreach', 'PhishingOrWhaling'],
        scoreInPercentage: 7,
        remediationImpact: 7,
        state: 'Default',
      },
      {
        id: 'BlockLegacyAuth',
        actionUrl: 'https://portal.azure.com/#view/Microsoft_AAD_ConditionalAccess',
        category: 'Identity',
        title: 'Block legacy authentication protocols',
        implementationCost: 'Low',
        userImpact: 'Low',
        threats: ['AccountBreach'],
        scoreInPercentage: 4,
        remediationImpact: 4,
        state: 'Default',
      },
      {
        id: 'SelfServicePasswordReset',
        actionUrl: 'https://portal.azure.com/#view/Microsoft_AAD_IAM/PasswordResetMenuBlade',
        category: 'Identity',
        title: 'Enable self-service password reset',
        implementationCost: 'Low',
        userImpact: 'Low',
        threats: ['AccountBreach'],
        scoreInPercentage: 1,
        remediationImpact: 1,
        state: 'Default',
      },
      {
        id: 'DefenderForEndpoint',
        actionUrl: 'https://security.microsoft.com',
        category: 'Device',
        title: 'Enroll devices in Microsoft Defender for Endpoint',
        implementationCost: 'Moderate',
        userImpact: 'Low',
        threats: ['Malware', 'Ransomware'],
        scoreInPercentage: 5,
        remediationImpact: 5,
        state: 'Default',
      },
      {
        id: 'EnableAuditMailboxActions',
        actionUrl: 'https://compliance.microsoft.com',
        category: 'Data',
        title: 'Enable mailbox audit logging',
        implementationCost: 'Low',
        userImpact: 'None',
        threats: ['DataExfiltration'],
        scoreInPercentage: 1,
        remediationImpact: 1,
        state: 'Default',
      },
    ];
  }

  async getSecurityAlerts(_tenantId: string): Promise<Record<string, unknown>[]> {
    return [
      {
        id: 'mock-alert-1',
        title: 'Suspicious sign-in activity detected',
        severity: 'high',
        status: 'active',
        category: 'InitialAccess',
        createdDateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: 'Multiple failed sign-in attempts followed by successful login from new location.',
      },
      {
        id: 'mock-alert-2',
        title: 'Legacy authentication sign-in attempt',
        severity: 'medium',
        status: 'active',
        category: 'DefenseEvasion',
        createdDateTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        description: 'A user signed in using a legacy authentication protocol.',
      },
      {
        id: 'mock-alert-3',
        title: 'Unusual file download from SharePoint',
        severity: 'low',
        status: 'resolved',
        category: 'Exfiltration',
        createdDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'User downloaded an unusually large number of files.',
      },
    ];
  }

  async getDeviceCompliance(_tenantId: string): Promise<Record<string, unknown>[]> {
    return [
      {
        id: 'device-001',
        deviceName: 'DESKTOP-ABC123',
        complianceState: 'compliant',
        operatingSystem: 'Windows',
        osVersion: '10.0.22621.3007',
        lastSyncDateTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'device-002',
        deviceName: 'LAPTOP-XYZ456',
        complianceState: 'noncompliant',
        operatingSystem: 'Windows',
        osVersion: '10.0.19045.3930',
        lastSyncDateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'device-003',
        deviceName: 'MacBook-Pro-789',
        complianceState: 'compliant',
        operatingSystem: 'macOS',
        osVersion: '14.2.1',
        lastSyncDateTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'device-004',
        deviceName: 'iPhone-Mobile-101',
        complianceState: 'compliant',
        operatingSystem: 'iOS',
        osVersion: '17.2.1',
        lastSyncDateTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
    ];
  }
}

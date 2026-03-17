export interface IdentityServiceConfig {
  port: number;
  tenantIssuer: string;
  apiAudience: string;
  entraClientId: string;
  entraTenantId: string;
  appInsightsConnectionString: string | undefined;
}

export function loadConfig(): IdentityServiceConfig {
  return {
    port: parseInt(process.env['IDENTITY_SERVICE_PORT'] ?? '3001', 10),
    tenantIssuer: process.env['TENANT_ISSUER'] ?? '',
    apiAudience: process.env['API_AUDIENCE'] ?? '',
    entraClientId: process.env['ENTRA_CLIENT_ID'] ?? '',
    entraTenantId: process.env['ENTRA_TENANT_ID'] ?? '',
    appInsightsConnectionString: process.env['APP_INSIGHTS_CONNECTION_STRING'],
  };
}

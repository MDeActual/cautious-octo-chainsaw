export interface IdentityServiceConfig {
  port: number;
  tenantIssuer: string;
  apiAudience: string;
  entraClientId: string;
  entraTenantId: string;
  appInsightsConnectionString: string | undefined;
  allowAuthBypass: boolean;
}

export function loadConfig(): IdentityServiceConfig {
  const tenantIssuer = process.env['TENANT_ISSUER'] ?? '';
  const apiAudience = process.env['API_AUDIENCE'] ?? '';
  const allowAuthBypass = process.env['ALLOW_AUTH_BYPASS'] === 'true';

  // Fail fast if required config is missing and bypass is not explicitly allowed
  if ((!tenantIssuer || !apiAudience) && !allowAuthBypass) {
    throw new Error(
      'Missing required authentication configuration: TENANT_ISSUER and API_AUDIENCE must be set, ' +
      'or ALLOW_AUTH_BYPASS=true must be explicitly enabled for development.'
    );
  }

  return {
    port: parseInt(process.env['IDENTITY_SERVICE_PORT'] ?? '3001', 10),
    tenantIssuer,
    apiAudience,
    entraClientId: process.env['ENTRA_CLIENT_ID'] ?? '',
    entraTenantId: process.env['ENTRA_TENANT_ID'] ?? '',
    appInsightsConnectionString: process.env['APP_INSIGHTS_CONNECTION_STRING'],
    allowAuthBypass,
  };
}

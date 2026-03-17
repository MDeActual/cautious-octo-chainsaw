export interface CoreBackendConfig {
  port: number;
  graphProxyUrl: string;
  identityServiceUrl: string;
  postgresUrl: string;
  automationServiceUrl: string;
  aiServiceUrl: string;
  appInsightsConnectionString: string | undefined;
}

export function loadConfig(): CoreBackendConfig {
  return {
    port: parseInt(process.env['CORE_BACKEND_PORT'] ?? '3003', 10),
    graphProxyUrl: process.env['GRAPH_PROXY_URL'] ?? 'http://localhost:3002',
    identityServiceUrl: process.env['IDENTITY_SERVICE_URL'] ?? 'http://localhost:3001',
    postgresUrl: process.env['POSTGRES_URL'] ?? '',
    automationServiceUrl: process.env['AUTOMATION_SERVICE_URL'] ?? 'http://localhost:3004',
    aiServiceUrl: process.env['AI_SERVICE_URL'] ?? 'http://localhost:3005',
    appInsightsConnectionString: process.env['APP_INSIGHTS_CONNECTION_STRING'],
  };
}

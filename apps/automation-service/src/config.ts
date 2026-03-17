export interface AutomationServiceConfig {
  port: number;
  appInsightsConnectionString: string | undefined;
}

export function loadConfig(): AutomationServiceConfig {
  return {
    port: parseInt(process.env['AUTOMATION_SERVICE_PORT'] ?? '3004', 10),
    appInsightsConnectionString: process.env['APP_INSIGHTS_CONNECTION_STRING'],
  };
}

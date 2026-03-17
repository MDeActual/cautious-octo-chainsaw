export interface GraphProxyConfig {
  port: number;
  graphClientId: string;
  graphClientSecret: string;
  graphScope: string;
  appInsightsConnectionString: string | undefined;
}

export function loadConfig(): GraphProxyConfig {
  return {
    port: parseInt(process.env['GRAPH_PROXY_PORT'] ?? '3002', 10),
    graphClientId: process.env['GRAPH_CLIENT_ID'] ?? '',
    graphClientSecret: process.env['GRAPH_CLIENT_SECRET'] ?? '',
    graphScope: process.env['GRAPH_SCOPE'] ?? 'https://graph.microsoft.com/.default',
    appInsightsConnectionString: process.env['APP_INSIGHTS_CONNECTION_STRING'],
  };
}

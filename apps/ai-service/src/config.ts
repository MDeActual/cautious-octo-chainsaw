export interface AiServiceConfig {
  port: number;
  azureOpenAiEndpoint: string;
  azureOpenAiApiKey: string;
  azureOpenAiDeployment: string;
  appInsightsConnectionString: string | undefined;
}

export function loadConfig(): AiServiceConfig {
  return {
    port: parseInt(process.env['AI_SERVICE_PORT'] ?? '3005', 10),
    azureOpenAiEndpoint: process.env['AZURE_OPENAI_ENDPOINT'] ?? '',
    azureOpenAiApiKey: process.env['AZURE_OPENAI_API_KEY'] ?? '',
    azureOpenAiDeployment: process.env['AZURE_OPENAI_DEPLOYMENT'] ?? 'gpt-4',
    appInsightsConnectionString: process.env['APP_INSIGHTS_CONNECTION_STRING'],
  };
}

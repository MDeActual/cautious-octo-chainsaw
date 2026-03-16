import { createLogger } from '@cloudmatrix/logger';
import appInsights from 'applicationinsights';


const logger = createLogger('observability');

let initialized = false;

export function initAppInsights(connectionString?: string): void {
  const cs = connectionString ?? process.env['APP_INSIGHTS_CONNECTION_STRING'];

  if (!cs) {
    logger.warn('APP_INSIGHTS_CONNECTION_STRING not set; Application Insights disabled');
    return;
  }

  if (initialized) {
    return;
  }

  appInsights
    .setup(cs)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();

  initialized = true;
  logger.info('Application Insights initialized');
}

export function getClient(): appInsights.TelemetryClient | null {
  if (!initialized) {
    return null;
  }
  return appInsights.defaultClient ?? null;
}

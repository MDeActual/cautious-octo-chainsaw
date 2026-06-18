export interface AutomationServiceConfig {
  port: number;
  appInsightsConnectionString: string | undefined;
  swarmStateSavingTarget: string;
  swarmDefaultLocation: 'canadacentral' | 'canadaeast';
}

export function loadConfig(): AutomationServiceConfig {
  const swarmDefaultLocation = process.env['SWARM_DEFAULT_LOCATION'];
  const normalizedLocation =
    swarmDefaultLocation === 'canadaeast' ? 'canadaeast' : 'canadacentral';

  return {
    port: parseInt(process.env['AUTOMATION_SERVICE_PORT'] ?? '3004', 10),
    appInsightsConnectionString: process.env['APP_INSIGHTS_CONNECTION_STRING'],
    swarmStateSavingTarget: process.env['SWARM_STATE_SAVING_TARGET'] ?? '/docs/state_capture.md',
    swarmDefaultLocation: normalizedLocation,
  };
}

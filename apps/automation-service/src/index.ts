import { initAppInsights } from '@cloudmatrix/observability';
import { createLogger } from '@cloudmatrix/logger';

initAppInsights();
const logger = createLogger('automation-service');

import { createApp } from './app';

const PORT = parseInt(process.env['AUTOMATION_SERVICE_PORT'] ?? '3004', 10);

const app = createApp();

app.listen(PORT, () => {
  logger.info('Automation service started', { port: PORT });
});

import { initAppInsights } from '@cloudmatrix/observability';
import { createLogger } from '@cloudmatrix/logger';

initAppInsights();
const logger = createLogger('identity-service');

import { createApp } from './app';

const PORT = parseInt(process.env['IDENTITY_SERVICE_PORT'] ?? '3001', 10);

const app = createApp();

app.listen(PORT, () => {
  logger.info(`Identity service started`, { port: PORT });
});

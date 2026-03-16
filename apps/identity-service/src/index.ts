import { createLogger } from '@cloudmatrix/logger';
import { initAppInsights } from '@cloudmatrix/observability';

initAppInsights();
const logger = createLogger('identity-service');

import { createApp } from './app';

const PORT = parseInt(process.env['IDENTITY_SERVICE_PORT'] ?? '3001', 10);

const app = createApp();

app.listen(PORT, () => {
  logger.info(`Identity service started`, { port: PORT });
});

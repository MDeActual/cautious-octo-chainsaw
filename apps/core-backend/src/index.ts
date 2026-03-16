import { createLogger } from '@cloudmatrix/logger';
import { initAppInsights } from '@cloudmatrix/observability';

initAppInsights();
const logger = createLogger('core-backend');

import { createApp } from './app';

const PORT = parseInt(process.env['CORE_BACKEND_PORT'] ?? '3003', 10);

const app = createApp();

app.listen(PORT, () => {
  logger.info('Core backend service started', { port: PORT });
});

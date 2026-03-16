import { createLogger } from '@cloudmatrix/logger';
import { initAppInsights } from '@cloudmatrix/observability';

initAppInsights();
const logger = createLogger('ai-service');

import { createApp } from './app';

const PORT = parseInt(process.env['AI_SERVICE_PORT'] ?? '3005', 10);

const app = createApp();

app.listen(PORT, () => {
  logger.info('AI service started', { port: PORT });
});

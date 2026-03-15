import { initAppInsights } from '@cloudmatrix/observability';
import { createLogger } from '@cloudmatrix/logger';

initAppInsights();
const logger = createLogger('graph-proxy');

import { createApp } from './app';

const PORT = parseInt(process.env['GRAPH_PROXY_PORT'] ?? '3002', 10);

const app = createApp();

app.listen(PORT, () => {
  logger.info('Graph proxy service started', { port: PORT });
});

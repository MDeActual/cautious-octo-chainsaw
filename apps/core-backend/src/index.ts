import { createLogger } from '@cloudmatrix/logger';
import { loadConfig } from './config.js';
import { createApp } from './app.js';

const config = loadConfig();
const app = createApp(); // Invalid identity configuration fails before listening.
const logger = createLogger({ service: 'core-backend' });
app.listen(config.port, () => {
  logger.info(`core-backend listening on port ${config.port}`);
});
export { app };

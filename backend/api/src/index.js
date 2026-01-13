import 'dotenv/config';
import app from './app.js';
import { initializeDatabase } from './server.js';
import { logger } from '@n8n-clone/shared';

const PORT = process.env.API_PORT || 3000;

async function start() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      logger.info(`API server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start API server', { error: error.message });
    process.exit(1);
  }
}

start();

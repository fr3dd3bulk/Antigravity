import 'dotenv/config';
import { connectDatabase, logger } from '@n8n-clone/shared';
import { createScheduler } from './scheduler.js';

async function start() {
  try {
    await connectDatabase();
    logger.info('Scheduler database connected');

    const scheduler = createScheduler();
    await scheduler.cronManager.loadCronWorkflows();
    logger.info('Scheduler started');

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, stopping scheduler');
      scheduler.stop();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start scheduler', { error: error.message });
    process.exit(1);
  }
}

start();

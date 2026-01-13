import 'dotenv/config';
import { connectDatabase, logger } from '@n8n-clone/shared';
import { createWorker } from './worker.js';

async function start() {
  try {
    await connectDatabase();
    logger.info('Worker database connected');

    const worker = createWorker();
    logger.info('Worker started', { 
      concurrency: process.env.WORKER_CONCURRENCY || 10 
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, closing worker');
      await worker.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start worker', { error: error.message });
    process.exit(1);
  }
}

start();

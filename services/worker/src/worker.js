import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '@n8n-clone/shared';
import { processExecution } from './jobProcessor.js';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
});

export function createWorker() {
  const worker = new Worker('workflow-execution', processExecution, {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '10'),
    limiter: {
      max: 100,
      duration: 1000
    }
  });

  worker.on('completed', (job) => {
    logger.info('Job completed', { jobId: job.id });
  });

  worker.on('failed', (job, err) => {
    logger.error('Job failed', { 
      jobId: job?.id,
      error: err.message,
      stack: err.stack
    });
  });

  worker.on('error', (err) => {
    logger.error('Worker error', { error: err.message });
  });

  return worker;
}

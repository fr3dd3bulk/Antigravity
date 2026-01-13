import { CronManager } from './cronManager.js';
import { logger } from '@n8n-clone/shared';

export function createScheduler() {
  const cronManager = new CronManager();

  const refreshInterval = setInterval(() => {
    logger.info('Refreshing scheduled workflows');
    cronManager.refresh();
  }, 5 * 60 * 1000);

  return {
    cronManager,
    stop: () => {
      clearInterval(refreshInterval);
      cronManager.stop();
    }
  };
}

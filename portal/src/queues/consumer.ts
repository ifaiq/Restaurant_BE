import { logger } from '../utils/logger';

export const setupGracefulShutdown = (workers: any): void => {
  process.on('SIGTERM', async () => {
    try {
      for (const worker of workers) {
        logger.log({
          level: 'info',
          message: `Shutting down worker: ${worker.constructor.name}`,
        });
        await worker.shutdown();
        logger.log({
          level: 'info',
          message: `${worker.constructor.name} shut down successfully.`,
        });
      }
    } catch (error: any) {
      logger.log({
        level: 'error',
        message: `Error during shutdown: ${error.message}`,
      });
    } finally {
      logger.log({
        level: 'error',
        message: `All workers shut down. Exiting process...`,
      });
    }
  });
};

// import { Worker, WorkerOptions } from 'bullmq';
// import { createRedisConnection } from '../../config/redis';
// import { EmailJobData, JobResult } from '../../types/jobs';
// import { EmailVerificationService } from '../../utils/nodemailer';
// import { logger } from '../../utils/logger';

// export class EmailQueueExecutor {
//   private worker: Worker<EmailJobData, JobResult>;

//   constructor() {
//     const workerOptions: WorkerOptions = {
//       connection: createRedisConnection(),
//       concurrency: 5,
//     };

//     this.worker = new Worker<EmailJobData, JobResult>(
//       'email-queue',
//       async (job) => {
//         const { email, content, attachments, subject } = job.data;
//         const result = await EmailVerificationService.sendEmail(
//           email,
//           content,
//           attachments,
//           subject,
//         );
//         return {
//           success: result.status === 200,
//           message: result.message || '',
//           error: result.status !== 200 ? result.response : undefined,
//         };
//       },
//       workerOptions,
//     );

//     this.setupListeners();
//   }

//   private setupListeners(): void {
//     this.worker.on('completed', (job) => {
//       logger.log({
//         level: 'info',
//         message: `Job ${job.id} completed successfully`,
//       });
//     });

//     this.worker.on('failed', (job, error) => {
//       logger.log({
//         level: 'warm',
//         message: `Job ${job?.id} failed with error:` + ' ' + error,
//       });
//     });
//   }

//   async shutdown(): Promise<void> {
//     await this.worker.close();
//   }
// }

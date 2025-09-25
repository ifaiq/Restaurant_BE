import { Queue, QueueOptions } from 'bullmq';
import { createRedisConnection } from '../../config/redis';
import { EmailJobData } from '../../types/jobs';

interface Attachment {
  attachment?: Buffer | string;
  filename?: string;
}

export class EmailQueueProducer {
  private queue: Queue<EmailJobData>;

  constructor() {
    const queueOptions: QueueOptions = {
      connection: createRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    };

    this.queue = new Queue<EmailJobData>('email-queue', queueOptions);
  }
  async addEmailJob(
    email: string,
    content: any,
    attachments: Attachment = {},
    subject: string,
  ): Promise<string> {
    const jobData: EmailJobData = {
      email,
      content,
      attachments,
      subject,
    };

    const job = await this.queue.add('send-email', jobData);
    return job.id!;
  }
}

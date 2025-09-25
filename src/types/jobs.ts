interface Attachment {
  attachment?: Buffer | string;
  filename?: string;
}

export interface EmailJobData {
  email: string;
  content: any;
  attachments?: Attachment;
  subject: string;
}
export interface JobResult {
  success: boolean;
  message: string;
  error?: string;
}

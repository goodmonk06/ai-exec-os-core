import { Queue } from 'bullmq';
import { env } from '../../config/env';
import Redis from 'ioredis';

// Create Redis connection
const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Create job queue
export const jobQueue = new Queue('workflow-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 500,
    },
  },
});

export interface JobData {
  jobId: string;
  workflowId: string;
  input: Record<string, any>;
}

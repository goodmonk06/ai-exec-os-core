import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env';
import { JobData } from '../modules/jobs/queue';
import { jobService } from '../modules/jobs/service';
import { workflowService } from '../modules/workflows/service';
import { executeWorkflow } from './executor';
import { connectDB } from '../db/client';

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const worker = new Worker<JobData>(
  'workflow-jobs',
  async (job: Job<JobData>) => {
    const { jobId, workflowId, input } = job.data;

    console.log(`[Worker] Processing job ${jobId} for workflow ${workflowId}`);

    try {
      // Update job status to running
      await jobService.updateJobStatus(jobId, 'running');
      await jobService.addJobLog(jobId, 'info', 'Job execution started');

      // Get workflow definition
      const workflow = await workflowService.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      await jobService.addJobLog(
        jobId,
        'info',
        `Executing workflow: ${workflow.name}`
      );

      // Execute workflow
      const result = await executeWorkflow(
        workflow.definition as Record<string, any>,
        input
      );

      if (result.success) {
        // Update job as succeeded
        await jobService.updateJobStatus(jobId, 'succeeded', {
          output: result.output,
        });
        await jobService.addJobLog(jobId, 'info', 'Job execution completed successfully');

        return result.output;
      } else {
        // Update job as failed
        await jobService.updateJobStatus(jobId, 'failed', {
          error: { message: result.error },
        });
        await jobService.addJobLog(jobId, 'error', `Job execution failed: ${result.error}`);

        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await jobService.updateJobStatus(jobId, 'failed', {
        error: { message: errorMessage },
      });
      await jobService.addJobLog(jobId, 'error', `Job execution failed: ${errorMessage}`);

      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('[Worker] Error:', err);
});

// Initialize worker
export async function startWorker() {
  await connectDB();
  console.log('✅ Worker started and listening for jobs');
}

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down worker...');
  await worker.close();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start worker if this file is run directly
if (require.main === module) {
  startWorker().catch((error) => {
    console.error('Failed to start worker:', error);
    process.exit(1);
  });
}

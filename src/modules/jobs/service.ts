import { prisma } from '../../db/client';
import { CreateJobInput } from './types';
import { jobQueue, JobData } from './queue';
import { JobStatus } from '@prisma/client';

export class JobService {
  async createJob(data: CreateJobInput) {
    // Create job in database
    const job = await prisma.job.create({
      data: {
        workflowId: data.workflowId,
        input: data.input,
        status: 'pending',
      },
    });

    // Add to BullMQ queue
    const jobData: JobData = {
      jobId: job.id,
      workflowId: job.workflowId,
      input: data.input,
    };

    await jobQueue.add('execute-workflow', jobData, {
      jobId: job.id,
    });

    return job;
  }

  async listJobs(filters?: { workflowId?: string; status?: JobStatus }) {
    return prisma.job.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getJob(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        workflow: true,
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async updateJobStatus(
    id: string,
    status: JobStatus,
    data?: { output?: any; error?: any }
  ) {
    return prisma.job.update({
      where: { id },
      data: {
        status,
        output: data?.output,
        error: data?.error,
      },
    });
  }

  async addJobLog(jobId: string, level: string, message: string, meta?: any) {
    return prisma.jobLog.create({
      data: {
        jobId,
        level: level as any,
        message,
        meta: meta || {},
      },
    });
  }
}

export const jobService = new JobService();

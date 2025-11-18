import { FastifyInstance } from 'fastify';
import { jobService } from './service';

export async function jobRoutes(fastify: FastifyInstance) {
  // GET /jobs - List all jobs (with optional filters)
  fastify.get<{
    Querystring: { workflowId?: string; status?: string };
  }>('/jobs', async (request, reply) => {
    const { workflowId, status } = request.query;
    const jobs = await jobService.listJobs({
      workflowId,
      status: status as any,
    });
    return reply.send(jobs);
  });

  // GET /jobs/:id - Get job by ID with logs
  fastify.get<{ Params: { id: string } }>('/jobs/:id', async (request, reply) => {
    const job = await jobService.getJob(request.params.id);
    if (!job) {
      return reply.code(404).send({ error: 'Job not found' });
    }
    return reply.send(job);
  });
}

import { FastifyInstance } from 'fastify';
import { workflowService } from './service';
import { createWorkflowSchema, triggerWorkflowSchema } from './types';
import { jobService } from '../jobs/service';

export async function workflowRoutes(fastify: FastifyInstance) {
  // POST /workflows - Create new workflow
  fastify.post('/workflows', async (request, reply) => {
    try {
      const data = createWorkflowSchema.parse(request.body);
      const workflow = await workflowService.createWorkflow(data);
      return reply.code(201).send(workflow);
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      throw error;
    }
  });

  // GET /workflows - List all workflows
  fastify.get('/workflows', async (_request, reply) => {
    const workflows = await workflowService.listWorkflows();
    return reply.send(workflows);
  });

  // GET /workflows/:id - Get workflow by ID
  fastify.get<{ Params: { id: string } }>('/workflows/:id', async (request, reply) => {
    const workflow = await workflowService.getWorkflow(request.params.id);
    if (!workflow) {
      return reply.code(404).send({ error: 'Workflow not found' });
    }
    return reply.send(workflow);
  });

  // POST /workflows/:id/trigger - Trigger workflow execution
  fastify.post<{ Params: { id: string } }>('/workflows/:id/trigger', async (request, reply) => {
    try {
      const { input } = triggerWorkflowSchema.parse(request.body);

      // Verify workflow exists
      const workflow = await workflowService.getWorkflow(request.params.id);
      if (!workflow) {
        return reply.code(404).send({ error: 'Workflow not found' });
      }

      // Create and enqueue job
      const job = await jobService.createJob({
        workflowId: request.params.id,
        input,
      });

      return reply.code(201).send(job);
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      throw error;
    }
  });

  // PUT /workflows/:id - Update workflow
  fastify.put<{ Params: { id: string } }>('/workflows/:id', async (request, reply) => {
    try {
      const data = createWorkflowSchema.partial().parse(request.body);
      const workflow = await workflowService.updateWorkflow(request.params.id, data);
      return reply.send(workflow);
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      throw error;
    }
  });

  // DELETE /workflows/:id - Delete workflow
  fastify.delete<{ Params: { id: string } }>('/workflows/:id', async (request, reply) => {
    try {
      await workflowService.deleteWorkflow(request.params.id);
      return reply.code(204).send();
    } catch (error) {
      return reply.code(404).send({ error: 'Workflow not found' });
    }
  });
}

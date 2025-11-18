import { FastifyInstance } from 'fastify';
import { agentService } from './service';
import { createAgentSchema } from './types';

export async function agentRoutes(fastify: FastifyInstance) {
  // POST /agents - Create new agent
  fastify.post('/agents', async (request, reply) => {
    try {
      const data = createAgentSchema.parse(request.body);
      const agent = await agentService.createAgent(data);
      return reply.code(201).send(agent);
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      throw error;
    }
  });

  // GET /agents - List all agents
  fastify.get('/agents', async (_request, reply) => {
    const agents = await agentService.listAgents();
    return reply.send(agents);
  });

  // GET /agents/:id - Get agent by ID
  fastify.get<{ Params: { id: string } }>('/agents/:id', async (request, reply) => {
    const agent = await agentService.getAgent(request.params.id);
    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' });
    }
    return reply.send(agent);
  });

  // PUT /agents/:id - Update agent
  fastify.put<{ Params: { id: string } }>('/agents/:id', async (request, reply) => {
    try {
      const data = createAgentSchema.partial().parse(request.body);
      const agent = await agentService.updateAgent(request.params.id, data);
      return reply.send(agent);
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      throw error;
    }
  });

  // DELETE /agents/:id - Delete agent
  fastify.delete<{ Params: { id: string } }>('/agents/:id', async (request, reply) => {
    try {
      await agentService.deleteAgent(request.params.id);
      return reply.code(204).send();
    } catch (error) {
      return reply.code(404).send({ error: 'Agent not found' });
    }
  });
}

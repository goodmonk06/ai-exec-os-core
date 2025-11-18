import { prisma } from '../../db/client';
import { CreateAgentInput } from './types';

export class AgentService {
  async createAgent(data: CreateAgentInput) {
    return prisma.agent.create({
      data: {
        name: data.name,
        description: data.description,
        model: data.model,
        tools: data.tools,
        config: data.config,
      },
    });
  }

  async listAgents() {
    return prisma.agent.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAgent(id: string) {
    return prisma.agent.findUnique({
      where: { id },
    });
  }

  async updateAgent(id: string, data: Partial<CreateAgentInput>) {
    return prisma.agent.update({
      where: { id },
      data,
    });
  }

  async deleteAgent(id: string) {
    return prisma.agent.delete({
      where: { id },
    });
  }
}

export const agentService = new AgentService();

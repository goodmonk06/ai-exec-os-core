import { prisma } from '../../db/client';
import { CreateWorkflowInput } from './types';

export class WorkflowService {
  async createWorkflow(data: CreateWorkflowInput) {
    return prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        definition: data.definition,
      },
    });
  }

  async listWorkflows() {
    return prisma.workflow.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkflow(id: string) {
    return prisma.workflow.findUnique({
      where: { id },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async updateWorkflow(id: string, data: Partial<CreateWorkflowInput>) {
    return prisma.workflow.update({
      where: { id },
      data,
    });
  }

  async deleteWorkflow(id: string) {
    return prisma.workflow.delete({
      where: { id },
    });
  }
}

export const workflowService = new WorkflowService();

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowService } from '../../../modules/workflows/service';
import { prisma } from '../../../db/client';

vi.mock('../../../db/client', () => ({
  prisma: {
    workflow: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('WorkflowService', () => {
  let workflowService: WorkflowService;

  beforeEach(() => {
    workflowService = new WorkflowService();
    vi.clearAllMocks();
  });

  describe('createWorkflow', () => {
    it('should create a workflow with valid data', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'A test workflow',
        definition: {
          steps: [{ id: 'step1', action: 'test' }],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.workflow.create).mockResolvedValue(mockWorkflow);

      const result = await workflowService.createWorkflow({
        name: 'Test Workflow',
        description: 'A test workflow',
        definition: {
          steps: [{ id: 'step1', action: 'test' }],
        },
      });

      expect(result).toEqual(mockWorkflow);
      expect(prisma.workflow.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Workflow',
          description: 'A test workflow',
          definition: {
            steps: [{ id: 'step1', action: 'test' }],
          },
        },
      });
    });
  });

  describe('listWorkflows', () => {
    it('should return list of workflows', async () => {
      const mockWorkflows = [
        {
          id: 'wf-1',
          name: 'Workflow 1',
          description: null,
          definition: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'wf-2',
          name: 'Workflow 2',
          description: null,
          definition: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.workflow.findMany).mockResolvedValue(mockWorkflows);

      const result = await workflowService.listWorkflows();

      expect(result).toEqual(mockWorkflows);
      expect(result).toHaveLength(2);
    });
  });

  describe('getWorkflow', () => {
    it('should return workflow with jobs', async () => {
      const mockWorkflow = {
        id: 'wf-1',
        name: 'Test Workflow',
        description: null,
        definition: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        jobs: [
          {
            id: 'job-1',
            workflowId: 'wf-1',
            status: 'succeeded' as const,
            input: {},
            output: {},
            error: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      vi.mocked(prisma.workflow.findUnique).mockResolvedValue(mockWorkflow);

      const result = await workflowService.getWorkflow('wf-1');

      expect(result).toEqual(mockWorkflow);
      expect(result?.jobs).toHaveLength(1);
    });
  });
});

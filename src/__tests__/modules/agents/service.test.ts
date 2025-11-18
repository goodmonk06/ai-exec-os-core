import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentService } from '../../../modules/agents/service';
import { prisma } from '../../../db/client';

vi.mock('../../../db/client', () => ({
  prisma: {
    agent: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('AgentService', () => {
  let agentService: AgentService;

  beforeEach(() => {
    agentService = new AgentService();
    vi.clearAllMocks();
  });

  describe('createAgent', () => {
    it('should create an agent with valid data', async () => {
      const mockAgent = {
        id: 'agent-1',
        name: 'Test Agent',
        description: 'A test agent',
        model: 'gpt-4',
        tools: { textAnalysis: true },
        config: { temperature: 0.7 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.agent.create).mockResolvedValue(mockAgent);

      const result = await agentService.createAgent({
        name: 'Test Agent',
        description: 'A test agent',
        model: 'gpt-4',
        tools: { textAnalysis: true },
        config: { temperature: 0.7 },
      });

      expect(result).toEqual(mockAgent);
      expect(prisma.agent.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Agent',
          description: 'A test agent',
          model: 'gpt-4',
          tools: { textAnalysis: true },
          config: { temperature: 0.7 },
        },
      });
    });
  });

  describe('listAgents', () => {
    it('should return list of agents', async () => {
      const mockAgents = [
        {
          id: 'agent-1',
          name: 'Agent 1',
          description: null,
          model: 'gpt-4',
          tools: {},
          config: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'agent-2',
          name: 'Agent 2',
          description: null,
          model: 'claude-3',
          tools: {},
          config: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.agent.findMany).mockResolvedValue(mockAgents);

      const result = await agentService.listAgents();

      expect(result).toEqual(mockAgents);
      expect(result).toHaveLength(2);
    });
  });

  describe('getAgent', () => {
    it('should return agent by id', async () => {
      const mockAgent = {
        id: 'agent-1',
        name: 'Test Agent',
        description: null,
        model: 'gpt-4',
        tools: {},
        config: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.agent.findUnique).mockResolvedValue(mockAgent);

      const result = await agentService.getAgent('agent-1');

      expect(result).toEqual(mockAgent);
      expect(prisma.agent.findUnique).toHaveBeenCalledWith({
        where: { id: 'agent-1' },
      });
    });

    it('should return null for non-existent agent', async () => {
      vi.mocked(prisma.agent.findUnique).mockResolvedValue(null);

      const result = await agentService.getAgent('non-existent');

      expect(result).toBeNull();
    });
  });
});

import { describe, it, expect } from 'vitest';
import { callAgentMock, executeWorkflow } from '../../worker/executor';

describe('Worker Executor', () => {
  describe('callAgentMock', () => {
    it('should successfully execute agent with mock data', async () => {
      const agentConfig = {
        model: 'gpt-4',
        temperature: 0.7,
      };
      const input = {
        prompt: 'Test prompt',
        context: 'Test context',
      };

      const result = await callAgentMock(agentConfig, input);

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(result.output.message).toBe('Mock agent execution completed');
      expect(result.output.input).toEqual(input);
      expect(result.output.agentConfig).toEqual(agentConfig);
      expect(result.output.timestamp).toBeDefined();
    });

    it('should include timestamp in output', async () => {
      const result = await callAgentMock({}, {});

      expect(result.output.timestamp).toBeDefined();
      expect(new Date(result.output.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('executeWorkflow', () => {
    it('should successfully execute workflow', async () => {
      const workflowDefinition = {
        steps: [
          { id: 'step1', action: 'analyze' },
          { id: 'step2', action: 'report' },
        ],
      };
      const input = {
        data: 'test data',
      };

      const result = await executeWorkflow(workflowDefinition, input);

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(result.output.workflowResult).toBeDefined();
      expect(result.output.executedAt).toBeDefined();
    });

    it('should handle empty workflow definition', async () => {
      const result = await executeWorkflow({}, {});

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
    });

    it('should return timestamp in ISO format', async () => {
      const result = await executeWorkflow({}, {});

      expect(result.output.executedAt).toBeDefined();
      expect(new Date(result.output.executedAt)).toBeInstanceOf(Date);
    });
  });
});

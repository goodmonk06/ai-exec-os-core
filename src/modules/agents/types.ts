import { z } from 'zod';

export const createAgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  model: z.string().min(1),
  tools: z.record(z.any()).default({}),
  config: z.record(z.any()).default({}),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;

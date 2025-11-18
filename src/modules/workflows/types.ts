import { z } from 'zod';

export const createWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  definition: z.record(z.any()).default({}),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;

export const triggerWorkflowSchema = z.object({
  input: z.record(z.any()).default({}),
});

export type TriggerWorkflowInput = z.infer<typeof triggerWorkflowSchema>;

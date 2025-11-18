import { z } from 'zod';

export const createJobSchema = z.object({
  workflowId: z.string().min(1),
  input: z.record(z.any()).default({}),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

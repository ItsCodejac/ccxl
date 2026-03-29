import { z } from 'zod';

export const GeneratedFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  status: z.enum(['new', 'modified', 'unchanged']),
});

export const GeneratorResultSchema = z.object({
  files: z.array(GeneratedFileSchema),
  summary: z.string(),
});

export type GeneratedFile = z.infer<typeof GeneratedFileSchema>;
export type GeneratorResult = z.infer<typeof GeneratorResultSchema>;

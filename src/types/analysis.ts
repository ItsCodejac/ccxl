import { z } from 'zod';

export const LanguageInfoSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  configFiles: z.array(z.string()),
});

export const FrameworkInfoSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  category: z.enum(['frontend', 'backend', 'fullstack', 'build', 'test', 'orm', 'data']),
});

export const PackageManagerInfoSchema = z.object({
  name: z.enum(['npm', 'yarn', 'pnpm', 'bun']),
  lockfile: z.string(),
});

export const MonorepoInfoSchema = z.object({
  tool: z.string(),
  workspaces: z.array(z.string()),
});

export const CIProviderInfoSchema = z.object({
  name: z.string(),
  configPath: z.string(),
});

export const CloudProviderInfoSchema = z.object({
  name: z.string(),
  services: z.array(z.string()),
});

export const DatabaseInfoSchema = z.object({
  name: z.string(),
  type: z.enum(['sql', 'nosql', 'cache', 'search']),
});

export const DockerInfoSchema = z.object({
  hasDockerfile: z.boolean(),
  hasCompose: z.boolean(),
});

export const ExistingConfigInfoSchema = z.object({
  tool: z.enum(['claude', 'cursor', 'copilot', 'windsurf']),
  path: z.string(),
  exists: z.boolean(),
  version: z.string().optional(),
  features: z.array(z.string()),
});

export const ProjectAnalysisSchema = z.object({
  name: z.string(),
  root: z.string(),
  languages: z.array(LanguageInfoSchema),
  frameworks: z.array(FrameworkInfoSchema),
  packageManager: PackageManagerInfoSchema.nullable(),
  monorepo: MonorepoInfoSchema.nullable(),
  ci: z.array(CIProviderInfoSchema),
  cloud: z.array(CloudProviderInfoSchema),
  databases: z.array(DatabaseInfoSchema),
  docker: DockerInfoSchema.nullable(),
  existingConfigs: z.array(ExistingConfigInfoSchema),
  analyzedAt: z.date(),
});

export type LanguageInfo = z.infer<typeof LanguageInfoSchema>;
export type FrameworkInfo = z.infer<typeof FrameworkInfoSchema>;
export type PackageManagerInfo = z.infer<typeof PackageManagerInfoSchema>;
export type MonorepoInfo = z.infer<typeof MonorepoInfoSchema>;
export type CIProviderInfo = z.infer<typeof CIProviderInfoSchema>;
export type CloudProviderInfo = z.infer<typeof CloudProviderInfoSchema>;
export type DatabaseInfo = z.infer<typeof DatabaseInfoSchema>;
export type DockerInfo = z.infer<typeof DockerInfoSchema>;
export type ExistingConfigInfo = z.infer<typeof ExistingConfigInfoSchema>;
export type ProjectAnalysis = z.infer<typeof ProjectAnalysisSchema>;

// Re-export all analysis types and schemas
export {
  type LanguageInfo,
  type FrameworkInfo,
  type PackageManagerInfo,
  type MonorepoInfo,
  type CIProviderInfo,
  type CloudProviderInfo,
  type DatabaseInfo,
  type DockerInfo,
  type ExistingConfigInfo,
  type ProjectAnalysis,
  LanguageInfoSchema,
  FrameworkInfoSchema,
  PackageManagerInfoSchema,
  MonorepoInfoSchema,
  CIProviderInfoSchema,
  CloudProviderInfoSchema,
  DatabaseInfoSchema,
  DockerInfoSchema,
  ExistingConfigInfoSchema,
  ProjectAnalysisSchema,
} from './analysis.js';

/** @deprecated Use GeneratorOptions from types/analysis instead */
export interface GeneratorOptions {
  target: 'claude' | 'cursor' | 'copilot' | 'windsurf' | 'all';
  dryRun: boolean;
  force: boolean;
  preview: boolean;
}

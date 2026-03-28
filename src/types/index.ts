export interface ProjectAnalysis {
  name: string;
  root: string;
  languages: string[];
  frameworks: string[];
  packageManager: string | null;
  monorepo: boolean;
  existingConfigs: ExistingConfig[];
}

export interface ExistingConfig {
  tool: 'claude' | 'cursor' | 'copilot' | 'windsurf';
  path: string;
  exists: boolean;
}

export interface GeneratorOptions {
  target: 'claude' | 'cursor' | 'copilot' | 'windsurf' | 'all';
  dryRun: boolean;
  force: boolean;
  preview: boolean;
}

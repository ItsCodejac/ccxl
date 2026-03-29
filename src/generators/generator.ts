import type { ProjectAnalysis } from '../types/index.js';
import type { GeneratedFile } from './types.js';

export interface Generator {
  name: string;
  generate(analysis: ProjectAnalysis, root: string): Promise<{ files: GeneratedFile[]; summary: string }>;
}

export class GeneratorPipeline {
  private generators: Generator[] = [];

  register(generator: Generator): void {
    this.generators.push(generator);
  }

  async run(analysis: ProjectAnalysis, root: string): Promise<GeneratedFile[]> {
    const fileMap = new Map<string, GeneratedFile>();

    for (const generator of this.generators) {
      const result = await generator.generate(analysis, root);
      for (const file of result.files) {
        const existing = fileMap.get(file.path);
        if (existing && file.path.endsWith('.json')) {
          // JSON files: deep merge instead of overwrite
          try {
            const existingObj = JSON.parse(existing.content) as Record<string, unknown>;
            const newObj = JSON.parse(file.content) as Record<string, unknown>;
            const merged = deepMerge(existingObj, newObj);
            fileMap.set(file.path, {
              ...file,
              content: JSON.stringify(merged, null, 2),
            });
          } catch {
            fileMap.set(file.path, file);
          }
        } else {
          fileMap.set(file.path, file);
        }
      }
    }

    return [...fileMap.values()];
  }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const targetVal = target[key];
    const sourceVal = source[key];
    if (
      targetVal && sourceVal &&
      typeof targetVal === 'object' && typeof sourceVal === 'object' &&
      !Array.isArray(targetVal) && !Array.isArray(sourceVal)
    ) {
      result[key] = deepMerge(targetVal as Record<string, unknown>, sourceVal as Record<string, unknown>);
    } else {
      result[key] = sourceVal;
    }
  }
  return result;
}

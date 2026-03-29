import type { ProjectAnalysis } from '../types/index.js';
import type { GeneratedFile, GeneratorResult } from './types.js';

export interface Generator {
  name: string;
  generate(analysis: ProjectAnalysis, root: string): Promise<GeneratorResult>;
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
        fileMap.set(file.path, file);
      }
    }

    return [...fileMap.values()];
  }
}

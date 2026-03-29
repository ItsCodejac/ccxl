import type { ProjectAnalysis } from '../../types/index.js';
import type { Generator } from '../generator.js';
import type { GeneratorResult, GeneratedFile } from '../types.js';
import { cursorAdapter } from './cursor.js';
import { copilotAdapter } from './copilot.js';
import { windsurfAdapter } from './windsurf.js';
import type { CrossToolAdapter } from './adapter.js';

const adapters: CrossToolAdapter[] = [cursorAdapter, copilotAdapter, windsurfAdapter];

export const crossToolGenerator: Generator = {
  name: 'cross-tool',
  async generate(analysis: ProjectAnalysis): Promise<GeneratorResult> {
    const files: GeneratedFile[] = [];

    for (const adapter of adapters) {
      files.push(adapter.generateLegacy(analysis));
      files.push(...adapter.generateModern(analysis));
    }

    return {
      files,
      summary: `Generated configs for ${adapters.map((a) => a.toolName).join(', ')}`,
    };
  },
};

export { cursorAdapter, copilotAdapter, windsurfAdapter };
export type { CrossToolAdapter } from './adapter.js';

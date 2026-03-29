import type { ProjectAnalysis } from '../../types/index.js';
import type { GeneratedFile } from '../types.js';

export interface CrossToolAdapter {
  toolName: string;
  generateLegacy(analysis: ProjectAnalysis): GeneratedFile;
  generateModern(analysis: ProjectAnalysis): GeneratedFile[];
}

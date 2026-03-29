import type { ProjectAnalysis } from '../../types/index.js';
import type { GeneratedFile } from '../types.js';
import type { CrossToolAdapter } from './adapter.js';
import { getActiveRules } from './shared-rules.js';

export const copilotAdapter: CrossToolAdapter = {
  toolName: 'copilot',

  generateLegacy(analysis: ProjectAnalysis): GeneratedFile {
    const rules = getActiveRules(analysis);
    const content = rules.map((r) => r.body(analysis)).join('\n\n');
    return { path: '.github/copilot-instructions.md', content, status: 'new' };
  },

  generateModern(analysis: ProjectAnalysis): GeneratedFile[] {
    const rules = getActiveRules(analysis);
    return rules
      .filter((r) => !r.alwaysOn) // Only glob-scoped rules get instruction files
      .map((rule) => {
        const fm: string[] = ['---'];
        if (rule.globs) fm.push(`applyTo: "${rule.globs}"`);
        fm.push('---');
        const content = `${fm.join('\n')}\n\n${rule.body(analysis)}\n`;
        return { path: `.github/instructions/${rule.id}.instructions.md`, content, status: 'new' as const };
      });
  },
};

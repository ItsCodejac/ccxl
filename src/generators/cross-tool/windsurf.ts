import type { ProjectAnalysis } from '../../types/index.js';
import type { GeneratedFile } from '../types.js';
import type { CrossToolAdapter } from './adapter.js';
import { getActiveRules } from './shared-rules.js';

export const windsurfAdapter: CrossToolAdapter = {
  toolName: 'windsurf',

  generateLegacy(analysis: ProjectAnalysis): GeneratedFile {
    const rules = getActiveRules(analysis);
    const content = rules.map((r) => r.body(analysis)).join('\n\n');
    return { path: '.windsurfrules', content, status: 'new' };
  },

  generateModern(analysis: ProjectAnalysis): GeneratedFile[] {
    const rules = getActiveRules(analysis);
    return rules.map((rule) => {
      const fm: string[] = ['---'];
      if (rule.alwaysOn) {
        fm.push('trigger: always_on');
      } else if (rule.globs) {
        fm.push('trigger: glob');
        fm.push(`globs: "${rule.globs}"`);
      } else {
        fm.push('trigger: model_decision');
      }
      fm.push(`description: ${rule.description}`);
      fm.push('---');
      const content = `${fm.join('\n')}\n\n${rule.body(analysis)}\n`;
      return { path: `.windsurf/rules/${rule.id}.md`, content, status: 'new' as const };
    });
  },
};

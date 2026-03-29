import type { ProjectAnalysis } from '../../types/index.js';
import type { GeneratedFile } from '../types.js';
import type { CrossToolAdapter } from './adapter.js';
import { getActiveRules } from './shared-rules.js';

export const cursorAdapter: CrossToolAdapter = {
  toolName: 'cursor',

  generateLegacy(analysis: ProjectAnalysis): GeneratedFile {
    const rules = getActiveRules(analysis);
    const content = rules.map((r) => r.body(analysis)).join('\n\n');
    return { path: '.cursorrules', content, status: 'new' };
  },

  generateModern(analysis: ProjectAnalysis): GeneratedFile[] {
    const rules = getActiveRules(analysis);
    return rules.map((rule) => {
      const fm: string[] = ['---'];
      fm.push(`description: ${rule.description}`);
      if (rule.globs) fm.push(`globs: "${rule.globs}"`);
      fm.push(`alwaysApply: ${rule.alwaysOn}`);
      fm.push('---');
      const content = `${fm.join('\n')}\n\n${rule.body(analysis)}\n`;
      return { path: `.cursor/rules/${rule.id}.mdc`, content, status: 'new' as const };
    });
  },
};

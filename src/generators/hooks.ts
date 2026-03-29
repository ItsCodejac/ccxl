import type { ProjectAnalysis } from '../types/index.js';
import type { Generator } from './generator.js';
import type { GeneratorResult, GeneratedFile } from './types.js';
import { HOOK_TEMPLATES } from './hook-templates.js';
import type { HookConfig } from './hook-templates.js';

export const hooksGenerator: Generator = {
  name: 'hooks',
  async generate(analysis: ProjectAnalysis): Promise<GeneratorResult> {
    const files: GeneratedFile[] = [];
    const hooksByEvent = new Map<string, HookConfig[]>();

    for (const template of HOOK_TEMPLATES) {
      if (template.condition && !template.condition(analysis)) {
        continue;
      }

      if (template.scriptName && template.scriptContent) {
        files.push({
          path: `.claude/hooks/${template.scriptName}`,
          content: template.scriptContent,
          status: 'new',
        });
      }

      const existing = hooksByEvent.get(template.event) ?? [];
      existing.push(template.config);
      hooksByEvent.set(template.event, existing);
    }

    // Merge hooks INTO settings.json (Claude Code expects hooks in settings.json)
    if (hooksByEvent.size > 0) {
      const hooksConfig: Record<string, HookConfig[]> = {};
      for (const [event, configs] of hooksByEvent) {
        hooksConfig[event] = configs;
      }

      const settingsWithHooks = {
        hooks: hooksConfig,
      };

      files.push({
        path: '.claude/settings.json',
        content: JSON.stringify(settingsWithHooks, null, 2),
        status: 'new',
      });
    }

    return {
      files,
      summary: `Generated ${files.filter((f) => f.path.endsWith('.sh')).length} hook scripts`,
    };
  },
};

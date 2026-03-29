import type { ProjectAnalysis } from '../types/index.js';
import type { Generator } from './generator.js';
import type { GeneratorResult } from './types.js';
import type { GeneratedFile } from './types.js';
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

      // Add hook script file if defined
      if (template.scriptName && template.scriptContent) {
        files.push({
          path: `.claude/hooks/${template.scriptName}`,
          content: template.scriptContent,
          status: 'new',
        });
      }

      // Collect hook configs by event type
      const existing = hooksByEvent.get(template.event) ?? [];
      existing.push(template.config);
      hooksByEvent.set(template.event, existing);
    }

    // Generate the hooks section for settings.json
    if (hooksByEvent.size > 0) {
      const hooksConfig: Record<string, HookConfig[]> = {};
      for (const [event, configs] of hooksByEvent) {
        hooksConfig[event] = configs;
      }

      files.push({
        path: '.claude/hooks.json',
        content: JSON.stringify(hooksConfig, null, 2),
        status: 'new',
      });
    }

    return {
      files,
      summary: `Generated ${files.length - (hooksByEvent.size > 0 ? 1 : 0)} hook scripts`,
    };
  },
};

import type { ProjectAnalysis } from '../types/index.js';
import type { Generator } from './generator.js';
import type { GeneratorResult } from './types.js';
import type { GeneratedFile } from './types.js';
import { SKILL_TEMPLATES } from './skill-templates.js';

export const skillsGenerator: Generator = {
  name: 'skills',
  async generate(analysis: ProjectAnalysis): Promise<GeneratorResult> {
    const files: GeneratedFile[] = [];

    for (const template of SKILL_TEMPLATES) {
      if (template.condition && !template.condition(analysis)) {
        continue;
      }

      const frontmatter = buildFrontmatter(template);
      const body = template.body(analysis);
      const content = `---\n${frontmatter}---\n\n${body}\n`;
      const path = `.claude/skills/${template.name}/SKILL.md`;

      files.push({ path, content, status: 'new' });
    }

    return {
      files,
      summary: `Generated ${files.length} skill files`,
    };
  },
};

function buildFrontmatter(template: { name: string; description: string; allowedTools?: string; model?: string }): string {
  let fm = `name: ${template.name}\n`;
  fm += `description: ${template.description}\n`;
  fm += `user-invocable: true\n`;
  if (template.allowedTools) {
    fm += `allowed-tools: "${template.allowedTools}"\n`;
  }
  if (template.model) {
    fm += `model: "${template.model}"\n`;
  }
  return fm;
}

import type { ProjectAnalysis } from '../types/index.js';
import type { Generator } from './generator.js';
import type { GeneratorResult, GeneratedFile } from './types.js';
import { AGENT_TEMPLATES } from './agent-templates.js';

export const agentsGenerator: Generator = {
  name: 'agents',
  async generate(analysis: ProjectAnalysis): Promise<GeneratorResult> {
    const files: GeneratedFile[] = [];

    for (const template of AGENT_TEMPLATES) {
      if (template.condition && !template.condition(analysis)) {
        continue;
      }

      const frontmatter = buildAgentFrontmatter(template);
      const body = template.body(analysis);
      const content = `---\n${frontmatter}---\n\n${body}\n`;

      files.push({
        path: `.claude/agents/${template.name}.md`,
        content,
        status: 'new',
      });
    }

    return {
      files,
      summary: `Generated ${files.length} agent definitions`,
    };
  },
};

function buildAgentFrontmatter(template: AgentTemplate): string {
  let fm = `name: ${template.name}\n`;
  fm += `description: ${template.description}\n`;
  if (template.tools) fm += `tools: "${template.tools}"\n`;
  if (template.model) fm += `model: "${template.model}"\n`;
  return fm;
}

type AgentTemplate = typeof AGENT_TEMPLATES[number];

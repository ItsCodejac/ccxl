import type { ProjectAnalysis } from '../types/index.js';
import type { GeneratedFile } from './types.js';
import { GeneratorPipeline } from './generator.js';
import { settingsGenerator } from './settings.js';
import { skillsGenerator } from './skills.js';
import { hooksGenerator } from './hooks.js';
import { agentsGenerator } from './agents.js';
import { mcpGenerator } from './mcp.js';
import { claudeMdGenerator } from './claude-md.js';

export async function runPipeline(
  analysis: ProjectAnalysis,
  root: string,
): Promise<GeneratedFile[]> {
  const pipeline = new GeneratorPipeline();

  pipeline.register(settingsGenerator);
  pipeline.register(skillsGenerator);
  pipeline.register(hooksGenerator);
  pipeline.register(agentsGenerator);
  pipeline.register(mcpGenerator);
  pipeline.register(claudeMdGenerator);

  return pipeline.run(analysis, root);
}

export { settingsGenerator, skillsGenerator, hooksGenerator, agentsGenerator, mcpGenerator, claudeMdGenerator };

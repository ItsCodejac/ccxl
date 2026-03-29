import type { ProjectAnalysis } from '../types/index.js';
import type { GeneratedFile } from './types.js';
import { GeneratorPipeline } from './generator.js';
import { settingsGenerator } from './settings.js';
import { skillsGenerator } from './skills.js';
import { hooksGenerator } from './hooks.js';
import { agentsGenerator } from './agents.js';
import { mcpGenerator } from './mcp.js';
import { claudeMdGenerator } from './claude-md.js';
import { mergeWithExisting } from './merge.js';

export interface PipelineOptions {
  merge?: boolean; // default true — set false with --force
}

export async function runPipeline(
  analysis: ProjectAnalysis,
  root: string,
  options: PipelineOptions = {},
): Promise<GeneratedFile[]> {
  const { merge = true } = options;

  const pipeline = new GeneratorPipeline();

  pipeline.register(settingsGenerator);
  pipeline.register(skillsGenerator);
  pipeline.register(hooksGenerator);
  pipeline.register(agentsGenerator);
  pipeline.register(mcpGenerator);
  pipeline.register(claudeMdGenerator);

  let files = await pipeline.run(analysis, root);

  if (merge) {
    files = await mergeWithExisting(root, files);
  }

  return files;
}

export { settingsGenerator, skillsGenerator, hooksGenerator, agentsGenerator, mcpGenerator, claudeMdGenerator };

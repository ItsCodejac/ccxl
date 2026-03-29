import os from 'node:os';
import path from 'node:path';
import type { ProjectAnalysis } from '../types/index.js';
import type { GeneratedFile } from './types.js';
import { GeneratorPipeline } from './generator.js';
import { settingsGenerator } from './settings.js';
import { skillsGenerator } from './skills.js';
import { hooksGenerator } from './hooks.js';
import { agentsGenerator } from './agents.js';
import { mcpGenerator } from './mcp.js';
import { claudeMdGenerator } from './claude-md.js';
import { crossToolGenerator } from './cross-tool/index.js';
import { mergeWithExisting } from './merge.js';

export interface PipelineOptions {
  merge?: boolean;
  scope?: 'project' | 'global';
}

export function getTargetRoot(scope: 'project' | 'global', projectRoot: string): string {
  if (scope === 'global') {
    return path.join(os.homedir(), '.claude');
  }
  return projectRoot;
}

export function createGlobalAnalysis(): ProjectAnalysis {
  return {
    name: 'global',
    root: path.join(os.homedir(), '.claude'),
    languages: [],
    frameworks: [],
    packageManager: null,
    monorepo: null,
    ci: [],
    cloud: [],
    databases: [],
    docker: null,
    existingConfigs: [],
    analyzedAt: new Date(),
  };
}

export async function runPipeline(
  analysis: ProjectAnalysis,
  root: string,
  options: PipelineOptions = {},
): Promise<GeneratedFile[]> {
  const { merge = true, scope = 'project' } = options;

  const pipeline = new GeneratorPipeline();

  pipeline.register(settingsGenerator);
  pipeline.register(skillsGenerator);
  pipeline.register(hooksGenerator);
  pipeline.register(agentsGenerator);

  // MCP, CLAUDE.md, and cross-tool only for project scope
  if (scope === 'project') {
    pipeline.register(mcpGenerator);
    pipeline.register(claudeMdGenerator);
    pipeline.register(crossToolGenerator);
  }

  const targetRoot = getTargetRoot(scope, root);
  let files = await pipeline.run(analysis, targetRoot);

  // For global scope, prefix paths with .claude/ if they aren't already
  if (scope === 'global') {
    files = files.map((f) => {
      // Global paths: .claude/skills/... → skills/... (already inside ~/.claude/)
      // But settings.json needs to stay as settings.json inside ~/.claude/
      const adjustedPath = f.path.startsWith('.claude/')
        ? f.path.slice('.claude/'.length)
        : f.path;
      return { ...f, path: adjustedPath };
    });
  }

  if (merge) {
    files = await mergeWithExisting(targetRoot, files);
  }

  return files;
}

export { settingsGenerator, skillsGenerator, hooksGenerator, agentsGenerator, mcpGenerator, claudeMdGenerator, crossToolGenerator };

import { describe, it, expect } from 'vitest';
import { runPipeline, createGlobalAnalysis } from '../pipeline.js';
import type { ProjectAnalysis } from '../../types/index.js';

function makeAnalysis(overrides: Partial<ProjectAnalysis> = {}): ProjectAnalysis {
  return {
    name: 'test-project',
    root: '/tmp/test',
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
    ...overrides,
  };
}

describe('runPipeline global scope', () => {
  it('generates only universal skills in global mode', async () => {
    const analysis = createGlobalAnalysis();
    const files = await runPipeline(analysis, '/tmp/test', { scope: 'global', merge: false });
    const skillFiles = files.filter((f) => f.path.includes('skills/'));
    const skillNames = skillFiles.map((f) => f.path.match(/skills\/([^/]+)\//)?.[1]);
    // Universal skills
    expect(skillNames).toContain('run-tests');
    expect(skillNames).toContain('review-code');
    expect(skillNames).toContain('generate-tests');
    expect(skillNames).toContain('explain-code');
    // No conditional skills
    expect(skillNames).not.toContain('deploy');
    expect(skillNames).not.toContain('db-migrate');
    expect(skillNames).not.toContain('lint-fix');
    expect(skillNames).not.toContain('docker-build');
    expect(skillNames).not.toContain('ci-check');
  });

  it('does not generate .mcp.json in global mode', async () => {
    const analysis = createGlobalAnalysis();
    const files = await runPipeline(analysis, '/tmp/test', { scope: 'global', merge: false });
    expect(files.find((f) => f.path.includes('.mcp.json'))).toBeUndefined();
  });

  it('does not generate CLAUDE.md in global mode', async () => {
    const analysis = createGlobalAnalysis();
    const files = await runPipeline(analysis, '/tmp/test', { scope: 'global', merge: false });
    expect(files.find((f) => f.path === 'CLAUDE.md')).toBeUndefined();
  });

  it('generates universal agents in global mode', async () => {
    const analysis = createGlobalAnalysis();
    const files = await runPipeline(analysis, '/tmp/test', { scope: 'global', merge: false });
    const agentFiles = files.filter((f) => f.path.includes('agents/'));
    const agentNames = agentFiles.map((f) => f.path.match(/agents\/([^.]+)/)?.[1]);
    expect(agentNames).toContain('code-reviewer');
    expect(agentNames).toContain('explorer');
    // No conditional agents
    expect(agentNames).not.toContain('frontend-dev');
    expect(agentNames).not.toContain('api-developer');
  });

  it('generates safety hooks in global mode', async () => {
    const analysis = createGlobalAnalysis();
    const files = await runPipeline(analysis, '/tmp/test', { scope: 'global', merge: false });
    const hookFiles = files.filter((f) => f.path.includes('hooks/'));
    const hookNames = hookFiles.map((f) => f.path);
    expect(hookNames.some((n) => n.includes('block-dangerous-git'))).toBe(true);
    expect(hookNames.some((n) => n.includes('context-loader'))).toBe(true);
    // No conditional auto-format
    expect(hookNames.some((n) => n.includes('auto-format'))).toBe(false);
  });

  it('strips .claude/ prefix from paths in global mode', async () => {
    const analysis = createGlobalAnalysis();
    const files = await runPipeline(analysis, '/tmp/test', { scope: 'global', merge: false });
    for (const file of files) {
      expect(file.path).not.toMatch(/^\.claude\//);
    }
  });
});

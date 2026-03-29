import { describe, it, expect } from 'vitest';
import { hooksGenerator } from '../hooks.js';
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

describe('hooksGenerator', () => {
  it('always generates safety hook scripts', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.claude/hooks/block-dangerous-git.sh');
    expect(paths).toContain('.claude/hooks/block-env-delete.sh');
  });

  it('safety scripts have shebangs', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const gitScript = result.files.find((f) => f.path.includes('block-dangerous-git'));
    expect(gitScript?.content).toMatch(/^#!/);
  });

  it('safety scripts exit with code 2', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const gitScript = result.files.find((f) => f.path.includes('block-dangerous-git'));
    expect(gitScript?.content).toContain('exit 2');
  });

  it('generates auto-format hook for JS/TS projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'typescript', configFiles: ['tsconfig.json'] }],
    });
    const result = await hooksGenerator.generate(analysis, '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.claude/hooks/auto-format.sh');
  });

  it('does not generate auto-format for Python-only projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'python', configFiles: ['pyproject.toml'] }],
    });
    const result = await hooksGenerator.generate(analysis, '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).not.toContain('.claude/hooks/auto-format.sh');
  });

  it('generates hooks.json with event configs', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const hooksJson = result.files.find((f) => f.path === '.claude/hooks.json');
    expect(hooksJson).toBeDefined();
    const config = JSON.parse(hooksJson!.content);
    expect(config.PreToolUse).toBeDefined();
    expect(config.PreToolUse.length).toBeGreaterThanOrEqual(2);
  });

  it('PreToolUse hooks have proper matcher and if fields', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const hooksJson = result.files.find((f) => f.path === '.claude/hooks.json');
    const config = JSON.parse(hooksJson!.content);
    const preToolUse = config.PreToolUse as Array<{ matcher: string; hooks: Array<{ if?: string }> }>;
    for (const hook of preToolUse) {
      expect(hook.matcher).toBe('Bash');
      expect(hook.hooks[0]?.if).toBeDefined();
    }
  });

  it('always generates context-loader.sh for SessionStart', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.claude/hooks/context-loader.sh');
    const hooksJson = result.files.find((f) => f.path === '.claude/hooks.json');
    const config = JSON.parse(hooksJson!.content);
    expect(config.SessionStart).toBeDefined();
  });

  it('always generates reread-context.sh for PreCompact', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.claude/hooks/reread-context.sh');
    const hooksJson = result.files.find((f) => f.path === '.claude/hooks.json');
    const config = JSON.parse(hooksJson!.content);
    expect(config.PreCompact).toBeDefined();
  });

  it('context-loader outputs valid JSON format', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const script = result.files.find((f) => f.path.includes('context-loader'));
    expect(script?.content).toContain('hookSpecificOutput');
    expect(script?.content).toMatch(/^#!/);
  });
});

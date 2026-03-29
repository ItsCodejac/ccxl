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

  it('merges hook config into settings.json under hooks key', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const settingsFile = result.files.find((f) => f.path === '.claude/settings.json');
    expect(settingsFile).toBeDefined();
    const config = JSON.parse(settingsFile!.content);
    expect(config.hooks).toBeDefined();
    expect(config.hooks.PreToolUse).toBeDefined();
    expect(config.hooks.PreToolUse.length).toBeGreaterThanOrEqual(2);
  });

  it('PreToolUse hooks have proper matcher and if fields', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const settingsFile = result.files.find((f) => f.path === '.claude/settings.json');
    const config = JSON.parse(settingsFile!.content);
    const preToolUse = config.hooks.PreToolUse as Array<{ matcher: string; hooks: Array<{ if?: string }> }>;
    for (const hook of preToolUse) {
      expect(hook.matcher).toBe('Bash');
      expect(hook.hooks[0]?.if).toBeDefined();
    }
  });

  it('always generates context-loader.sh for SessionStart', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.claude/hooks/context-loader.sh');
    const settingsFile = result.files.find((f) => f.path === '.claude/settings.json');
    const config = JSON.parse(settingsFile!.content);
    expect(config.hooks.SessionStart).toBeDefined();
  });

  it('always generates reread-context.sh for PreCompact', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.claude/hooks/reread-context.sh');
    const settingsFile = result.files.find((f) => f.path === '.claude/settings.json');
    const config = JSON.parse(settingsFile!.content);
    expect(config.hooks.PreCompact).toBeDefined();
  });

  it('context-loader outputs valid JSON format', async () => {
    const result = await hooksGenerator.generate(makeAnalysis(), '/tmp/test');
    const script = result.files.find((f) => f.path.includes('context-loader'));
    expect(script?.content).toContain('hookSpecificOutput');
    expect(script?.content).toMatch(/^#!/);
  });
});

import { describe, it, expect } from 'vitest';
import { settingsGenerator } from '../settings.js';
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

describe('settingsGenerator', () => {
  it('generates settings.json with base permissions', async () => {
    const result = await settingsGenerator.generate(makeAnalysis(), '/tmp/test');
    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.path).toBe('.claude/settings.json');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.permissions.allow).toContain('Read');
    expect(settings.permissions.allow).toContain('Glob');
    expect(settings.permissions.allow).toContain('Grep');
  });

  it('adds npm/npx/node for JS/TS projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'javascript', configFiles: ['package.json'] }],
      packageManager: { name: 'npm', lockfile: 'package-lock.json' },
    });
    const result = await settingsGenerator.generate(analysis, '/tmp/test');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.permissions.allow).toContain('Bash(npm run *)');
    expect(settings.permissions.allow).toContain('Bash(npx *)');
    expect(settings.permissions.allow).toContain('Bash(node *)');
  });

  it('adds yarn for yarn projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'typescript', configFiles: ['tsconfig.json'] }],
      packageManager: { name: 'yarn', lockfile: 'yarn.lock' },
    });
    const result = await settingsGenerator.generate(analysis, '/tmp/test');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.permissions.allow).toContain('Bash(yarn *)');
  });

  it('adds pnpm for pnpm projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'javascript', configFiles: ['package.json'] }],
      packageManager: { name: 'pnpm', lockfile: 'pnpm-lock.yaml' },
    });
    const result = await settingsGenerator.generate(analysis, '/tmp/test');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.permissions.allow).toContain('Bash(pnpm *)');
  });

  it('adds python/pip/pytest for Python projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'python', configFiles: ['pyproject.toml'] }],
    });
    const result = await settingsGenerator.generate(analysis, '/tmp/test');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.permissions.allow).toContain('Bash(python *)');
    expect(settings.permissions.allow).toContain('Bash(pip *)');
    expect(settings.permissions.allow).toContain('Bash(pytest *)');
  });

  it('adds go for Go projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'go', configFiles: ['go.mod'] }],
    });
    const result = await settingsGenerator.generate(analysis, '/tmp/test');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.permissions.allow).toContain('Bash(go *)');
  });

  it('adds cargo for Rust projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'rust', configFiles: ['Cargo.toml'] }],
    });
    const result = await settingsGenerator.generate(analysis, '/tmp/test');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.permissions.allow).toContain('Bash(cargo *)');
  });

  it('includes all languages for multi-language projects', async () => {
    const analysis = makeAnalysis({
      languages: [
        { name: 'javascript', configFiles: ['package.json'] },
        { name: 'python', configFiles: ['requirements.txt'] },
        { name: 'go', configFiles: ['go.mod'] },
      ],
    });
    const result = await settingsGenerator.generate(analysis, '/tmp/test');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.permissions.allow).toContain('Bash(npx *)');
    expect(settings.permissions.allow).toContain('Bash(python *)');
    expect(settings.permissions.allow).toContain('Bash(go *)');
  });

  it('always denies .env access', async () => {
    const result = await settingsGenerator.generate(makeAnalysis(), '/tmp/test');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.permissions.deny).toContain('Read(.env*)');
    expect(settings.permissions.deny).toContain('Edit(.env*)');
  });

  it('always asks for git push', async () => {
    const result = await settingsGenerator.generate(makeAnalysis(), '/tmp/test');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.permissions.ask).toContain('Bash(git push *)');
  });

  it('sets NODE_ENV for JS/TS projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'javascript', configFiles: ['package.json'] }],
    });
    const result = await settingsGenerator.generate(analysis, '/tmp/test');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.env.NODE_ENV).toBe('development');
  });

  it('adds docker permissions when Docker detected', async () => {
    const analysis = makeAnalysis({
      docker: { hasDockerfile: true, hasCompose: false },
    });
    const result = await settingsGenerator.generate(analysis, '/tmp/test');
    const settings = JSON.parse(result.files[0]!.content);
    expect(settings.permissions.allow).toContain('Bash(docker *)');
  });
});

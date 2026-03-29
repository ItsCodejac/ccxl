import { describe, it, expect } from 'vitest';
import { claudeMdGenerator } from '../claude-md.js';
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

describe('claudeMdGenerator', () => {
  it('generates CLAUDE.md with project name', async () => {
    const result = await claudeMdGenerator.generate(makeAnalysis({ name: 'my-app' }), '/tmp/test');
    expect(result.files[0]!.path).toBe('CLAUDE.md');
    expect(result.files[0]!.content).toContain('# my-app');
  });

  it('lists detected languages', async () => {
    const analysis = makeAnalysis({
      languages: [
        { name: 'typescript', configFiles: ['tsconfig.json'] },
        { name: 'python', configFiles: ['pyproject.toml'] },
      ],
    });
    const result = await claudeMdGenerator.generate(analysis, '/tmp/test');
    expect(result.files[0]!.content).toContain('typescript, python');
  });

  it('lists frameworks', async () => {
    const analysis = makeAnalysis({
      frameworks: [
        { name: 'react', category: 'frontend', version: '^18.0.0' },
        { name: 'next', category: 'fullstack', version: '^14.0.0' },
      ],
    });
    const result = await claudeMdGenerator.generate(analysis, '/tmp/test');
    expect(result.files[0]!.content).toContain('react, next');
  });

  it('includes dev commands for npm', async () => {
    const analysis = makeAnalysis({
      packageManager: { name: 'npm', lockfile: 'package-lock.json' },
    });
    const result = await claudeMdGenerator.generate(analysis, '/tmp/test');
    expect(result.files[0]!.content).toContain('npm install');
    expect(result.files[0]!.content).toContain('npm run dev');
  });

  it('includes pytest for Python projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'python', configFiles: ['pyproject.toml'] }],
    });
    const result = await claudeMdGenerator.generate(analysis, '/tmp/test');
    expect(result.files[0]!.content).toContain('pytest');
  });

  it('includes Prisma note for database projects', async () => {
    const analysis = makeAnalysis({
      databases: [{ name: 'postgresql', type: 'sql' }],
      frameworks: [{ name: 'prisma', category: 'orm' }],
    });
    const result = await claudeMdGenerator.generate(analysis, '/tmp/test');
    expect(result.files[0]!.content).toContain('prisma');
    expect(result.files[0]!.content).toContain('migrations');
  });

  it('includes Docker note when compose detected', async () => {
    const analysis = makeAnalysis({
      docker: { hasDockerfile: true, hasCompose: true },
    });
    const result = await claudeMdGenerator.generate(analysis, '/tmp/test');
    expect(result.files[0]!.content).toContain('docker compose');
  });

  it('is valid markdown', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'typescript', configFiles: ['tsconfig.json'] }],
      frameworks: [{ name: 'react', category: 'frontend', version: '^18.0.0' }],
      packageManager: { name: 'npm', lockfile: 'package-lock.json' },
    });
    const result = await claudeMdGenerator.generate(analysis, '/tmp/test');
    const content = result.files[0]!.content;
    expect(content).toMatch(/^# /m);
    expect(content).toMatch(/^## /m);
    expect(content).not.toContain('undefined');
    expect(content).not.toContain('null');
  });
});

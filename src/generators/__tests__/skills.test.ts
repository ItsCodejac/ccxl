import { describe, it, expect } from 'vitest';
import { skillsGenerator } from '../skills.js';
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

describe('skillsGenerator', () => {
  it('always generates universal skills', async () => {
    const result = await skillsGenerator.generate(makeAnalysis(), '/tmp/test');
    const names = result.files.map((f) => f.path);
    expect(names).toContain('.claude/skills/run-tests/SKILL.md');
    expect(names).toContain('.claude/skills/review-code/SKILL.md');
    expect(names).toContain('.claude/skills/generate-tests/SKILL.md');
    expect(names).toContain('.claude/skills/explain-code/SKILL.md');
  });

  it('generates lint-fix for JS/TS projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'typescript', configFiles: ['tsconfig.json'] }],
    });
    const result = await skillsGenerator.generate(analysis, '/tmp/test');
    const names = result.files.map((f) => f.path);
    expect(names).toContain('.claude/skills/lint-fix/SKILL.md');
  });

  it('does not generate lint-fix for Python-only projects', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'python', configFiles: ['pyproject.toml'] }],
    });
    const result = await skillsGenerator.generate(analysis, '/tmp/test');
    const names = result.files.map((f) => f.path);
    expect(names).not.toContain('.claude/skills/lint-fix/SKILL.md');
  });

  it('generates deploy skill for Vercel projects', async () => {
    const analysis = makeAnalysis({
      cloud: [{ name: 'vercel', services: ['hosting'] }],
    });
    const result = await skillsGenerator.generate(analysis, '/tmp/test');
    const names = result.files.map((f) => f.path);
    expect(names).toContain('.claude/skills/deploy/SKILL.md');
  });

  it('generates db-migrate for Prisma projects', async () => {
    const analysis = makeAnalysis({
      frameworks: [{ name: 'prisma', category: 'orm' }],
    });
    const result = await skillsGenerator.generate(analysis, '/tmp/test');
    const names = result.files.map((f) => f.path);
    expect(names).toContain('.claude/skills/db-migrate/SKILL.md');
    const content = result.files.find((f) => f.path.includes('db-migrate'))!.content;
    expect(content).toContain('prisma');
  });

  it('generates docker-build for Docker projects', async () => {
    const analysis = makeAnalysis({
      docker: { hasDockerfile: true, hasCompose: true },
    });
    const result = await skillsGenerator.generate(analysis, '/tmp/test');
    const names = result.files.map((f) => f.path);
    expect(names).toContain('.claude/skills/docker-build/SKILL.md');
  });

  it('generates ci-check for projects with CI', async () => {
    const analysis = makeAnalysis({
      ci: [{ name: 'github-actions', configPath: '.github/workflows/' }],
    });
    const result = await skillsGenerator.generate(analysis, '/tmp/test');
    const names = result.files.map((f) => f.path);
    expect(names).toContain('.claude/skills/ci-check/SKILL.md');
    const content = result.files.find((f) => f.path.includes('ci-check'))!.content;
    expect(content).toContain('gh run');
  });

  it('skill files have correct frontmatter', async () => {
    const result = await skillsGenerator.generate(makeAnalysis(), '/tmp/test');
    for (const file of result.files) {
      expect(file.content).toMatch(/^---\n/);
      expect(file.content).toContain('name:');
      expect(file.content).toContain('description:');
      expect(file.content).toContain('user-invocable: true');
    }
  });

  it('run-tests skill detects vitest', async () => {
    const analysis = makeAnalysis({
      frameworks: [{ name: 'vitest', category: 'test' }],
      packageManager: { name: 'npm', lockfile: 'package-lock.json' },
    });
    const result = await skillsGenerator.generate(analysis, '/tmp/test');
    const content = result.files.find((f) => f.path.includes('run-tests'))!.content;
    expect(content).toContain('npm run test');
  });

  it('run-tests skill detects pytest for Python', async () => {
    const analysis = makeAnalysis({
      languages: [{ name: 'python', configFiles: ['pyproject.toml'] }],
    });
    const result = await skillsGenerator.generate(analysis, '/tmp/test');
    const content = result.files.find((f) => f.path.includes('run-tests'))!.content;
    expect(content).toContain('pytest');
  });
});

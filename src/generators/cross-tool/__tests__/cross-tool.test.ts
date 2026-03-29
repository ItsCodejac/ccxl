import { describe, it, expect } from 'vitest';
import { crossToolGenerator } from '../index.js';
import { cursorAdapter } from '../cursor.js';
import { copilotAdapter } from '../copilot.js';
import { windsurfAdapter } from '../windsurf.js';
import type { ProjectAnalysis } from '../../../types/index.js';

function makeAnalysis(overrides: Partial<ProjectAnalysis> = {}): ProjectAnalysis {
  return {
    name: 'test-project',
    root: '/tmp/test',
    languages: [{ name: 'typescript', configFiles: ['tsconfig.json'] }],
    frameworks: [
      { name: 'react', category: 'frontend', version: '^18.0.0' },
      { name: 'vitest', category: 'test', version: '^2.0.0' },
    ],
    packageManager: { name: 'npm', lockfile: 'package-lock.json' },
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

describe('cursorAdapter', () => {
  it('generates .cursorrules as plain markdown', () => {
    const file = cursorAdapter.generateLegacy(makeAnalysis());
    expect(file.path).toBe('.cursorrules');
    expect(file.content).toContain('typescript');
    expect(file.content).not.toContain('---');
  });

  it('generates .cursor/rules/*.mdc with frontmatter', () => {
    const files = cursorAdapter.generateModern(makeAnalysis());
    expect(files.length).toBeGreaterThanOrEqual(2);
    const general = files.find((f) => f.path.includes('general.mdc'));
    expect(general).toBeDefined();
    expect(general!.content).toContain('alwaysApply: true');
    expect(general!.content).toContain('description:');
  });

  it('generates testing rule with globs', () => {
    const files = cursorAdapter.generateModern(makeAnalysis());
    const testing = files.find((f) => f.path.includes('testing.mdc'));
    expect(testing).toBeDefined();
    expect(testing!.content).toContain('globs:');
    expect(testing!.content).toContain('alwaysApply: false');
  });
});

describe('copilotAdapter', () => {
  it('generates .github/copilot-instructions.md', () => {
    const file = copilotAdapter.generateLegacy(makeAnalysis());
    expect(file.path).toBe('.github/copilot-instructions.md');
    expect(file.content).toContain('typescript');
  });

  it('generates .github/instructions/*.instructions.md with applyTo', () => {
    const files = copilotAdapter.generateModern(makeAnalysis());
    expect(files.length).toBeGreaterThanOrEqual(1);
    for (const file of files) {
      expect(file.path).toMatch(/\.github\/instructions\/.*\.instructions\.md$/);
      expect(file.content).toContain('applyTo:');
    }
  });
});

describe('windsurfAdapter', () => {
  it('generates .windsurfrules', () => {
    const file = windsurfAdapter.generateLegacy(makeAnalysis());
    expect(file.path).toBe('.windsurfrules');
    expect(file.content).toContain('typescript');
  });

  it('generates .windsurf/rules/*.md with trigger field', () => {
    const files = windsurfAdapter.generateModern(makeAnalysis());
    expect(files.length).toBeGreaterThanOrEqual(2);
    const general = files.find((f) => f.path.includes('general.md'));
    expect(general).toBeDefined();
    expect(general!.content).toContain('trigger: always_on');
  });

  it('generates glob-triggered rules', () => {
    const files = windsurfAdapter.generateModern(makeAnalysis());
    const testing = files.find((f) => f.path.includes('testing.md'));
    expect(testing).toBeDefined();
    expect(testing!.content).toContain('trigger: glob');
    expect(testing!.content).toContain('globs:');
  });
});

describe('crossToolGenerator', () => {
  it('generates files for all three tools', async () => {
    const result = await crossToolGenerator.generate(makeAnalysis(), '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths.some((p) => p.includes('.cursorrules'))).toBe(true);
    expect(paths.some((p) => p.includes('copilot-instructions'))).toBe(true);
    expect(paths.some((p) => p.includes('.windsurfrules'))).toBe(true);
    expect(paths.some((p) => p.includes('.cursor/rules/'))).toBe(true);
    expect(paths.some((p) => p.includes('.windsurf/rules/'))).toBe(true);
  });

  it('includes project-specific content in legacy files', async () => {
    const result = await crossToolGenerator.generate(makeAnalysis(), '/tmp/test');
    const legacyFiles = result.files.filter((f) =>
      f.path === '.cursorrules' || f.path.includes('copilot-instructions') || f.path === '.windsurfrules'
    );
    for (const file of legacyFiles) {
      expect(file.content).toContain('typescript');
    }
  });

  it('generates component rules for React projects', async () => {
    const result = await crossToolGenerator.generate(makeAnalysis(), '/tmp/test');
    const componentRules = result.files.filter((f) => f.path.includes('components'));
    expect(componentRules.length).toBeGreaterThanOrEqual(1);
  });

  it('does not generate api rules for frontend-only projects', async () => {
    const analysis = makeAnalysis({
      frameworks: [{ name: 'react', category: 'frontend' }],
    });
    const result = await crossToolGenerator.generate(analysis, '/tmp/test');
    const apiRules = result.files.filter((f) => f.path.includes('/api.'));
    expect(apiRules.length).toBe(0);
  });
});

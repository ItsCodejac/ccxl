import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import os from 'node:os';
import { frameworkDetector } from '../framework.js';
import { packageManagerDetector } from '../package-manager.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccxl-test-'));
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe('frameworkDetector', () => {
  it('detects react from dependencies', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { react: '^18.0.0' },
    });
    const result = await frameworkDetector.detect(tmpDir);
    const frameworks = result.data as Array<{ name: string; category: string }>;
    expect(frameworks.some((f) => f.name === 'react' && f.category === 'frontend')).toBe(true);
  });

  it('detects next.js as fullstack', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { next: '^14.0.0', react: '^18.0.0' },
    });
    const result = await frameworkDetector.detect(tmpDir);
    const frameworks = result.data as Array<{ name: string; category: string }>;
    expect(frameworks.some((f) => f.name === 'next' && f.category === 'fullstack')).toBe(true);
  });

  it('detects vue from dependencies', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { vue: '^3.0.0' },
    });
    const result = await frameworkDetector.detect(tmpDir);
    const frameworks = result.data as Array<{ name: string; category: string }>;
    expect(frameworks.some((f) => f.name === 'vue' && f.category === 'frontend')).toBe(true);
  });

  it('detects express as backend', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { express: '^4.0.0' },
    });
    const result = await frameworkDetector.detect(tmpDir);
    const frameworks = result.data as Array<{ name: string; category: string }>;
    expect(frameworks.some((f) => f.name === 'express' && f.category === 'backend')).toBe(true);
  });

  it('detects prisma as orm', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { '@prisma/client': '^5.0.0' },
      devDependencies: { prisma: '^5.0.0' },
    });
    const result = await frameworkDetector.detect(tmpDir);
    const frameworks = result.data as Array<{ name: string; category: string }>;
    expect(frameworks.some((f) => f.name === 'prisma' && f.category === 'orm')).toBe(true);
  });

  it('detects vite as build tool', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      devDependencies: { vite: '^5.0.0' },
    });
    const result = await frameworkDetector.detect(tmpDir);
    const frameworks = result.data as Array<{ name: string; category: string }>;
    expect(frameworks.some((f) => f.name === 'vite' && f.category === 'build')).toBe(true);
  });

  it('detects vitest as test framework', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      devDependencies: { vitest: '^2.0.0' },
    });
    const result = await frameworkDetector.detect(tmpDir);
    const frameworks = result.data as Array<{ name: string; category: string }>;
    expect(frameworks.some((f) => f.name === 'vitest' && f.category === 'test')).toBe(true);
  });

  it('detects multiple frameworks', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { next: '^14.0.0', react: '^18.0.0', '@prisma/client': '^5.0.0' },
      devDependencies: { vitest: '^2.0.0' },
    });
    const result = await frameworkDetector.detect(tmpDir);
    const frameworks = result.data as Array<{ name: string }>;
    expect(frameworks.length).toBeGreaterThanOrEqual(3);
  });

  it('detects django from pyproject.toml', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'pyproject.toml'),
      '[project]\ndependencies = ["django>=4.0"]\n',
    );
    const result = await frameworkDetector.detect(tmpDir);
    const frameworks = result.data as Array<{ name: string; category: string }>;
    expect(frameworks.some((f) => f.name === 'django' && f.category === 'backend')).toBe(true);
  });

  it('detects fastapi from pyproject.toml', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'pyproject.toml'),
      '[project]\ndependencies = ["fastapi>=0.100"]\n',
    );
    const result = await frameworkDetector.detect(tmpDir);
    const frameworks = result.data as Array<{ name: string; category: string }>;
    expect(frameworks.some((f) => f.name === 'fastapi' && f.category === 'backend')).toBe(true);
  });

  it('returns empty array when no package.json', async () => {
    const result = await frameworkDetector.detect(tmpDir);
    const frameworks = result.data as Array<{ name: string }>;
    expect(frameworks).toEqual([]);
  });
});

describe('packageManagerDetector', () => {
  it('detects npm from package-lock.json', async () => {
    await fs.writeFile(path.join(tmpDir, 'package-lock.json'), '{}');
    const result = await packageManagerDetector.detect(tmpDir);
    expect(result.data).toEqual({ name: 'npm', lockfile: 'package-lock.json' });
  });

  it('detects yarn from yarn.lock', async () => {
    await fs.writeFile(path.join(tmpDir, 'yarn.lock'), '');
    const result = await packageManagerDetector.detect(tmpDir);
    expect(result.data).toEqual({ name: 'yarn', lockfile: 'yarn.lock' });
  });

  it('detects pnpm from pnpm-lock.yaml', async () => {
    await fs.writeFile(path.join(tmpDir, 'pnpm-lock.yaml'), '');
    const result = await packageManagerDetector.detect(tmpDir);
    expect(result.data).toEqual({ name: 'pnpm', lockfile: 'pnpm-lock.yaml' });
  });

  it('detects bun from bun.lockb', async () => {
    await fs.writeFile(path.join(tmpDir, 'bun.lockb'), '');
    const result = await packageManagerDetector.detect(tmpDir);
    expect(result.data).toEqual({ name: 'bun', lockfile: 'bun.lockb' });
  });

  it('returns null when no lockfile found', async () => {
    const result = await packageManagerDetector.detect(tmpDir);
    expect(result.data).toBeNull();
  });
});

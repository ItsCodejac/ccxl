import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import os from 'node:os';
import { ciDetector } from '../ci.js';
import { cloudDetector } from '../cloud.js';
import { databaseDetector } from '../database.js';
import { dockerDetector } from '../docker.js';
import { monorepoDetector } from '../monorepo.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccxl-test-'));
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe('ciDetector', () => {
  it('detects GitHub Actions', async () => {
    await fs.ensureDir(path.join(tmpDir, '.github', 'workflows'));
    await fs.writeFile(path.join(tmpDir, '.github', 'workflows', 'ci.yml'), 'name: CI');
    const result = await ciDetector.detect(tmpDir);
    const providers = result.data as Array<{ name: string }>;
    expect(providers.some((p) => p.name === 'github-actions')).toBe(true);
  });

  it('detects GitLab CI', async () => {
    await fs.writeFile(path.join(tmpDir, '.gitlab-ci.yml'), 'stages: [build]');
    const result = await ciDetector.detect(tmpDir);
    const providers = result.data as Array<{ name: string }>;
    expect(providers.some((p) => p.name === 'gitlab-ci')).toBe(true);
  });

  it('detects CircleCI', async () => {
    await fs.ensureDir(path.join(tmpDir, '.circleci'));
    await fs.writeFile(path.join(tmpDir, '.circleci', 'config.yml'), 'version: 2.1');
    const result = await ciDetector.detect(tmpDir);
    const providers = result.data as Array<{ name: string }>;
    expect(providers.some((p) => p.name === 'circleci')).toBe(true);
  });

  it('detects multiple CI providers', async () => {
    await fs.ensureDir(path.join(tmpDir, '.github', 'workflows'));
    await fs.writeFile(path.join(tmpDir, '.github', 'workflows', 'ci.yml'), '');
    await fs.writeFile(path.join(tmpDir, '.gitlab-ci.yml'), '');
    const result = await ciDetector.detect(tmpDir);
    const providers = result.data as Array<{ name: string }>;
    expect(providers.length).toBeGreaterThanOrEqual(2);
  });

  it('returns empty for no CI config', async () => {
    const result = await ciDetector.detect(tmpDir);
    expect(result.data).toEqual([]);
  });
});

describe('cloudDetector', () => {
  it('detects AWS from package.json deps', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { '@aws-sdk/client-s3': '^3.0.0' },
    });
    const result = await cloudDetector.detect(tmpDir);
    const providers = result.data as Array<{ name: string }>;
    expect(providers.some((p) => p.name === 'aws')).toBe(true);
  });

  it('detects Vercel from vercel.json', async () => {
    await fs.writeJson(path.join(tmpDir, 'vercel.json'), { framework: 'nextjs' });
    const result = await cloudDetector.detect(tmpDir);
    const providers = result.data as Array<{ name: string; services: string[] }>;
    expect(providers.some((p) => p.name === 'vercel' && p.services.includes('hosting'))).toBe(true);
  });

  it('detects Netlify from netlify.toml', async () => {
    await fs.writeFile(path.join(tmpDir, 'netlify.toml'), '[build]\ncommand = "npm run build"');
    const result = await cloudDetector.detect(tmpDir);
    const providers = result.data as Array<{ name: string }>;
    expect(providers.some((p) => p.name === 'netlify')).toBe(true);
  });

  it('detects Fly from fly.toml', async () => {
    await fs.writeFile(path.join(tmpDir, 'fly.toml'), 'app = "my-app"');
    const result = await cloudDetector.detect(tmpDir);
    const providers = result.data as Array<{ name: string }>;
    expect(providers.some((p) => p.name === 'fly')).toBe(true);
  });

  it('returns empty for no cloud signals', async () => {
    const result = await cloudDetector.detect(tmpDir);
    expect(result.data).toEqual([]);
  });
});

describe('databaseDetector', () => {
  it('detects PostgreSQL from pg dependency', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { pg: '^8.0.0' },
    });
    const result = await databaseDetector.detect(tmpDir);
    const dbs = result.data as Array<{ name: string; type: string }>;
    expect(dbs.some((d) => d.name === 'postgresql' && d.type === 'sql')).toBe(true);
  });

  it('detects MongoDB', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { mongodb: '^6.0.0' },
    });
    const result = await databaseDetector.detect(tmpDir);
    const dbs = result.data as Array<{ name: string; type: string }>;
    expect(dbs.some((d) => d.name === 'mongodb' && d.type === 'nosql')).toBe(true);
  });

  it('detects Redis', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { ioredis: '^5.0.0' },
    });
    const result = await databaseDetector.detect(tmpDir);
    const dbs = result.data as Array<{ name: string; type: string }>;
    expect(dbs.some((d) => d.name === 'redis' && d.type === 'cache')).toBe(true);
  });

  it('detects SQLite', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { 'better-sqlite3': '^9.0.0' },
    });
    const result = await databaseDetector.detect(tmpDir);
    const dbs = result.data as Array<{ name: string; type: string }>;
    expect(dbs.some((d) => d.name === 'sqlite' && d.type === 'sql')).toBe(true);
  });

  it('returns empty for no database deps', async () => {
    const result = await databaseDetector.detect(tmpDir);
    expect(result.data).toEqual([]);
  });
});

describe('dockerDetector', () => {
  it('detects Dockerfile', async () => {
    await fs.writeFile(path.join(tmpDir, 'Dockerfile'), 'FROM node:20');
    const result = await dockerDetector.detect(tmpDir);
    const docker = result.data as { hasDockerfile: boolean; hasCompose: boolean } | null;
    expect(docker?.hasDockerfile).toBe(true);
  });

  it('detects docker-compose.yml', async () => {
    await fs.writeFile(path.join(tmpDir, 'docker-compose.yml'), 'version: "3"');
    const result = await dockerDetector.detect(tmpDir);
    const docker = result.data as { hasDockerfile: boolean; hasCompose: boolean } | null;
    expect(docker?.hasCompose).toBe(true);
  });

  it('detects compose.yml', async () => {
    await fs.writeFile(path.join(tmpDir, 'compose.yml'), 'services:');
    const result = await dockerDetector.detect(tmpDir);
    const docker = result.data as { hasDockerfile: boolean; hasCompose: boolean } | null;
    expect(docker?.hasCompose).toBe(true);
  });

  it('returns null for no Docker files', async () => {
    const result = await dockerDetector.detect(tmpDir);
    expect(result.data).toBeNull();
  });
});

describe('monorepoDetector', () => {
  it('detects Turborepo', async () => {
    await fs.writeJson(path.join(tmpDir, 'turbo.json'), { pipeline: {} });
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      workspaces: ['packages/*'],
    });
    const result = await monorepoDetector.detect(tmpDir);
    const mono = result.data as { tool: string; workspaces: string[] } | null;
    expect(mono?.tool).toBe('turborepo');
    expect(mono?.workspaces).toContain('packages/*');
  });

  it('detects pnpm workspaces', async () => {
    await fs.writeFile(path.join(tmpDir, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n');
    const result = await monorepoDetector.detect(tmpDir);
    const mono = result.data as { tool: string } | null;
    expect(mono?.tool).toBe('pnpm');
  });

  it('detects npm/yarn workspaces from package.json', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), {
      name: 'test',
      workspaces: ['apps/*', 'packages/*'],
    });
    const result = await monorepoDetector.detect(tmpDir);
    const mono = result.data as { tool: string; workspaces: string[] } | null;
    expect(mono?.tool).toBe('npm/yarn');
    expect(mono?.workspaces).toEqual(['apps/*', 'packages/*']);
  });

  it('returns null for non-monorepo', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
    const result = await monorepoDetector.detect(tmpDir);
    expect(result.data).toBeNull();
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import os from 'node:os';
import { checkCompliance, loadBaseConfig, applyBaseConfig } from '../base-config.js';
import type { BaseConfig } from '../types.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccxl-gov-'));
  await fs.ensureDir(path.join(tmpDir, '.claude'));
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

const testBaseConfig: BaseConfig = {
  name: 'test-org-standards',
  source: 'test-org/standards',
  version: '1.0.0',
  policies: [
    { type: 'require', target: 'permission:deny', value: 'Read(.env*)' },
    { type: 'deny', target: 'permission:allow', value: 'Bash(rm -rf /)' },
    { type: 'require', target: 'permission:deny', value: 'Edit(.env*)' },
  ],
};

describe('checkCompliance', () => {
  it('passes when all required rules present', async () => {
    await fs.writeJson(path.join(tmpDir, '.claude', 'settings.json'), {
      permissions: { allow: [], ask: [], deny: ['Read(.env*)', 'Edit(.env*)'] },
    });
    const report = await checkCompliance(tmpDir, testBaseConfig);
    expect(report.compliant).toBe(true);
    expect(report.violations).toHaveLength(0);
  });

  it('fails when required deny rule missing', async () => {
    await fs.writeJson(path.join(tmpDir, '.claude', 'settings.json'), {
      permissions: { allow: [], ask: [], deny: [] },
    });
    const report = await checkCompliance(tmpDir, testBaseConfig);
    expect(report.compliant).toBe(false);
    expect(report.violations.length).toBeGreaterThan(0);
    expect(report.violations.some((v) => v.message.includes('Read(.env*)'))).toBe(true);
  });

  it('fails when disallowed allow rule present', async () => {
    await fs.writeJson(path.join(tmpDir, '.claude', 'settings.json'), {
      permissions: { allow: ['Bash(rm -rf /)'], ask: [], deny: ['Read(.env*)', 'Edit(.env*)'] },
    });
    const report = await checkCompliance(tmpDir, testBaseConfig);
    expect(report.compliant).toBe(false);
    expect(report.violations.some((v) => v.message.includes('rm -rf'))).toBe(true);
  });

  it('reports total policy count', async () => {
    await fs.writeJson(path.join(tmpDir, '.claude', 'settings.json'), {
      permissions: { allow: [], ask: [], deny: ['Read(.env*)', 'Edit(.env*)'] },
    });
    const report = await checkCompliance(tmpDir, testBaseConfig);
    expect(report.policies).toBe(3);
  });
});

describe('loadBaseConfig', () => {
  it('returns null when no base config', async () => {
    const result = await loadBaseConfig(tmpDir);
    expect(result).toBeNull();
  });

  it('loads valid base config', async () => {
    await applyBaseConfig(tmpDir, testBaseConfig);
    const result = await loadBaseConfig(tmpDir);
    expect(result?.name).toBe('test-org-standards');
    expect(result?.policies).toHaveLength(3);
  });
});

describe('applyBaseConfig', () => {
  it('saves base config to .claude/base-config.json', async () => {
    await applyBaseConfig(tmpDir, testBaseConfig);
    const saved = await fs.readJson(path.join(tmpDir, '.claude', 'base-config.json'));
    expect(saved.name).toBe('test-org-standards');
  });
});

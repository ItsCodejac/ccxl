import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import os from 'node:os';
import { PackageManifestSchema } from '../types.js';
import { listInstalled } from '../list.js';
import { uninstallPackage } from '../uninstall.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccxl-registry-'));
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe('PackageManifestSchema', () => {
  it('validates a valid manifest', () => {
    const valid = {
      name: 'security-hooks',
      version: '1.0.0',
      description: 'Security validation hooks',
      type: 'hook',
      files: ['hooks/validate-imports.sh'],
    };
    expect(() => PackageManifestSchema.parse(valid)).not.toThrow();
  });

  it('rejects manifest missing name', () => {
    const invalid = {
      version: '1.0.0',
      description: 'Test',
      type: 'skill',
      files: ['skills/test/SKILL.md'],
    };
    expect(() => PackageManifestSchema.parse(invalid)).toThrow();
  });

  it('rejects manifest with empty files array', () => {
    const invalid = {
      name: 'test',
      version: '1.0.0',
      description: 'Test',
      type: 'skill',
      files: [],
    };
    expect(() => PackageManifestSchema.parse(invalid)).toThrow();
  });

  it('rejects invalid version format', () => {
    const invalid = {
      name: 'test',
      version: 'abc',
      description: 'Test',
      type: 'skill',
      files: ['a.md'],
    };
    expect(() => PackageManifestSchema.parse(invalid)).toThrow();
  });

  it('accepts manifest with optional fields', () => {
    const valid = {
      name: 'react-skills',
      version: '2.1.0',
      description: 'React component skills',
      author: 'test-user',
      type: 'bundle',
      files: ['skills/component/SKILL.md', 'agents/frontend.md'],
      keywords: ['react', 'frontend'],
      compatibility: {
        languages: ['typescript'],
        frameworks: ['react'],
      },
    };
    const parsed = PackageManifestSchema.parse(valid);
    expect(parsed.keywords).toEqual(['react', 'frontend']);
    expect(parsed.compatibility?.frameworks).toEqual(['react']);
  });
});

describe('listInstalled', () => {
  it('returns empty array when no packages file', async () => {
    const result = await listInstalled(tmpDir);
    expect(result).toEqual([]);
  });

  it('returns installed packages', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude'));
    await fs.writeJson(path.join(tmpDir, '.claude', 'ccxl-packages.json'), {
      packages: [
        { name: 'test-pkg', version: '1.0.0', source: 'user/repo', installedAt: '2026-01-01', files: ['a.md'] },
      ],
    });
    const result = await listInstalled(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('test-pkg');
  });
});

describe('uninstallPackage', () => {
  it('removes files and registry entry', async () => {
    // Set up installed package
    const skillPath = path.join(tmpDir, '.claude', 'skills', 'test', 'SKILL.md');
    await fs.ensureDir(path.dirname(skillPath));
    await fs.writeFile(skillPath, 'test skill');
    await fs.writeJson(path.join(tmpDir, '.claude', 'ccxl-packages.json'), {
      packages: [
        { name: 'test-pkg', version: '1.0.0', source: 'user/repo', installedAt: '2026-01-01', files: ['skills/test/SKILL.md'] },
      ],
    });

    await uninstallPackage('test-pkg', tmpDir);

    // File removed
    expect(await fs.pathExists(skillPath)).toBe(false);
    // Registry updated
    const registry = await fs.readJson(path.join(tmpDir, '.claude', 'ccxl-packages.json'));
    expect(registry.packages).toHaveLength(0);
  });

  it('throws for non-installed package', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude'));
    await fs.writeJson(path.join(tmpDir, '.claude', 'ccxl-packages.json'), { packages: [] });
    await expect(uninstallPackage('nonexistent', tmpDir)).rejects.toThrow('not installed');
  });
});

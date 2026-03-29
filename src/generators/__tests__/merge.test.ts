import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import os from 'node:os';
import { mergeWithExisting } from '../merge.js';
import type { GeneratedFile } from '../types.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccxl-merge-'));
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe('mergeWithExisting', () => {
  it('marks new files as new', async () => {
    const files: GeneratedFile[] = [
      { path: '.claude/settings.json', content: '{}', status: 'new' },
    ];
    const result = await mergeWithExisting(tmpDir, files);
    expect(result[0]!.status).toBe('new');
  });

  it('skips existing markdown files', async () => {
    await fs.writeFile(path.join(tmpDir, 'CLAUDE.md'), '# Existing');
    const files: GeneratedFile[] = [
      { path: 'CLAUDE.md', content: '# Generated', status: 'new' },
    ];
    const result = await mergeWithExisting(tmpDir, files);
    expect(result[0]!.status).toBe('unchanged');
  });

  it('skips existing shell scripts', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude', 'hooks'));
    await fs.writeFile(path.join(tmpDir, '.claude', 'hooks', 'custom.sh'), '#!/bin/bash');
    const files: GeneratedFile[] = [
      { path: '.claude/hooks/custom.sh', content: '#!/bin/bash\nnew', status: 'new' },
    ];
    const result = await mergeWithExisting(tmpDir, files);
    expect(result[0]!.status).toBe('unchanged');
  });

  it('merges settings.json permissions (union)', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude'));
    await fs.writeJson(path.join(tmpDir, '.claude', 'settings.json'), {
      permissions: {
        allow: ['Bash(custom-cmd)'],
        ask: [],
        deny: ['Read(.secret)'],
      },
      model: 'claude-opus-4-6',
    });

    const files: GeneratedFile[] = [{
      path: '.claude/settings.json',
      content: JSON.stringify({
        permissions: {
          allow: ['Read', 'Glob'],
          ask: ['Bash(git push *)'],
          deny: ['Read(.env*)'],
        },
      }),
      status: 'new',
    }];

    const result = await mergeWithExisting(tmpDir, files);
    expect(result[0]!.status).toBe('modified');

    const merged = JSON.parse(result[0]!.content);
    // Existing custom rules preserved
    expect(merged.permissions.allow).toContain('Bash(custom-cmd)');
    // New rules added
    expect(merged.permissions.allow).toContain('Read');
    expect(merged.permissions.allow).toContain('Glob');
    // Deny rules merged
    expect(merged.permissions.deny).toContain('Read(.secret)');
    expect(merged.permissions.deny).toContain('Read(.env*)');
    // Existing model preserved
    expect(merged.model).toBe('claude-opus-4-6');
  });

  it('preserves existing env values over generated ones', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude'));
    await fs.writeJson(path.join(tmpDir, '.claude', 'settings.json'), {
      permissions: { allow: [], ask: [], deny: [] },
      env: { NODE_ENV: 'production', CUSTOM: 'value' },
    });

    const files: GeneratedFile[] = [{
      path: '.claude/settings.json',
      content: JSON.stringify({
        permissions: { allow: [], ask: [], deny: [] },
        env: { NODE_ENV: 'development' },
      }),
      status: 'new',
    }];

    const result = await mergeWithExisting(tmpDir, files);
    const merged = JSON.parse(result[0]!.content);
    // Existing value takes precedence
    expect(merged.env.NODE_ENV).toBe('production');
    // Existing custom env preserved
    expect(merged.env.CUSTOM).toBe('value');
  });

  it('skips existing skill directories', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude', 'skills', 'custom-skill'));
    await fs.writeFile(
      path.join(tmpDir, '.claude', 'skills', 'custom-skill', 'SKILL.md'),
      '---\nname: custom\n---\nMy skill',
    );

    const files: GeneratedFile[] = [{
      path: '.claude/skills/custom-skill/SKILL.md',
      content: '---\nname: custom\n---\nGenerated skill',
      status: 'new',
    }];

    const result = await mergeWithExisting(tmpDir, files);
    expect(result[0]!.status).toBe('unchanged');
  });

  it('skips existing agent files', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude', 'agents'));
    await fs.writeFile(path.join(tmpDir, '.claude', 'agents', 'my-agent.md'), 'existing');

    const files: GeneratedFile[] = [{
      path: '.claude/agents/my-agent.md',
      content: 'generated',
      status: 'new',
    }];

    const result = await mergeWithExisting(tmpDir, files);
    expect(result[0]!.status).toBe('unchanged');
  });
});

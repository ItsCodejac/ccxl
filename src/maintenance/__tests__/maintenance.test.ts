import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import os from 'node:os';
import { runDiagnostics } from '../diagnostics.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccxl-maint-'));
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe('runDiagnostics', () => {
  it('reports fail when settings.json missing', async () => {
    const results = await runDiagnostics(tmpDir);
    const settingsCheck = results.find((r) => r.name === 'settings.json');
    expect(settingsCheck?.status).toBe('fail');
  });

  it('reports pass for valid settings.json', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude'));
    await fs.writeJson(path.join(tmpDir, '.claude', 'settings.json'), {
      permissions: { allow: ['Read'], deny: ['Read(.env*)'] },
    });
    const results = await runDiagnostics(tmpDir);
    const settingsCheck = results.find((r) => r.name === 'settings.json');
    expect(settingsCheck?.status).toBe('pass');
  });

  it('reports warn when CLAUDE.md missing', async () => {
    const results = await runDiagnostics(tmpDir);
    const claudeCheck = results.find((r) => r.name === 'CLAUDE.md');
    expect(claudeCheck?.status).toBe('warn');
  });

  it('reports pass when CLAUDE.md exists', async () => {
    await fs.writeFile(path.join(tmpDir, 'CLAUDE.md'), '# Project');
    const results = await runDiagnostics(tmpDir);
    const claudeCheck = results.find((r) => r.name === 'CLAUDE.md');
    expect(claudeCheck?.status).toBe('pass');
  });

  it('reports warn for non-executable hook scripts', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude', 'hooks'));
    await fs.writeFile(path.join(tmpDir, '.claude', 'hooks', 'test.sh'), '#!/bin/bash\nexit 0', { mode: 0o644 });
    const results = await runDiagnostics(tmpDir);
    const hookCheck = results.find((r) => r.name === 'Hook permissions');
    expect(hookCheck?.status).toBe('warn');
    expect(hookCheck?.fixable).toBe(true);
  });

  it('fixes non-executable scripts with --fix', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude', 'hooks'));
    const scriptPath = path.join(tmpDir, '.claude', 'hooks', 'test.sh');
    await fs.writeFile(scriptPath, '#!/bin/bash\nexit 0', { mode: 0o644 });
    const results = await runDiagnostics(tmpDir, { fix: true });
    const hookCheck = results.find((r) => r.name === 'Hook permissions');
    expect(hookCheck?.status).toBe('pass');
  });

  it('reports both Cursor formats as normal (ccxl generates both)', async () => {
    await fs.writeFile(path.join(tmpDir, '.cursorrules'), 'rules');
    await fs.ensureDir(path.join(tmpDir, '.cursor', 'rules'));
    const results = await runDiagnostics(tmpDir);
    const conflictCheck = results.find((r) => r.name === 'Config conflicts');
    expect(conflictCheck?.status).toBe('pass');
  });

  it('passes conflict check with no duplicates', async () => {
    const results = await runDiagnostics(tmpDir);
    const conflictCheck = results.find((r) => r.name === 'Config conflicts');
    expect(conflictCheck?.status).toBe('pass');
  });
});

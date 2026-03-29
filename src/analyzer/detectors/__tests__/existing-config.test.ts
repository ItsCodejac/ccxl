import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import os from 'node:os';
import { existingConfigDetector } from '../existing-config.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccxl-test-'));
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe('existingConfigDetector', () => {
  it('detects Claude Code settings', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude'));
    await fs.writeJson(path.join(tmpDir, '.claude', 'settings.json'), {});
    const result = await existingConfigDetector.detect(tmpDir);
    const configs = result.data as Array<{ tool: string; exists: boolean }>;
    expect(configs.find((c) => c.tool === 'claude')?.exists).toBe(true);
  });

  it('detects Claude Code features', async () => {
    await fs.ensureDir(path.join(tmpDir, '.claude', 'skills'));
    await fs.writeJson(path.join(tmpDir, '.claude', 'settings.json'), {});
    await fs.writeFile(path.join(tmpDir, 'CLAUDE.md'), '# Context');
    await fs.writeFile(path.join(tmpDir, 'AGENTS.md'), '---');
    const result = await existingConfigDetector.detect(tmpDir);
    const claude = (result.data as Array<{ tool: string; features: string[] }>).find((c) => c.tool === 'claude');
    expect(claude?.features).toContain('skills');
    expect(claude?.features).toContain('claude-md');
    expect(claude?.features).toContain('agents');
  });

  it('detects .cursorrules', async () => {
    await fs.writeFile(path.join(tmpDir, '.cursorrules'), 'rules');
    const result = await existingConfigDetector.detect(tmpDir);
    const cursor = (result.data as Array<{ tool: string; exists: boolean }>).find((c) => c.tool === 'cursor');
    expect(cursor?.exists).toBe(true);
  });

  it('detects copilot-instructions.md', async () => {
    await fs.writeFile(path.join(tmpDir, 'copilot-instructions.md'), '# Instructions');
    const result = await existingConfigDetector.detect(tmpDir);
    const copilot = (result.data as Array<{ tool: string; exists: boolean }>).find((c) => c.tool === 'copilot');
    expect(copilot?.exists).toBe(true);
  });

  it('detects .windsurfrules', async () => {
    await fs.writeFile(path.join(tmpDir, '.windsurfrules'), 'rules');
    const result = await existingConfigDetector.detect(tmpDir);
    const windsurf = (result.data as Array<{ tool: string; exists: boolean }>).find((c) => c.tool === 'windsurf');
    expect(windsurf?.exists).toBe(true);
  });

  it('reports missing configs as exists: false', async () => {
    const result = await existingConfigDetector.detect(tmpDir);
    const configs = result.data as Array<{ tool: string; exists: boolean }>;
    expect(configs.every((c) => c.exists === false)).toBe(true);
  });
});

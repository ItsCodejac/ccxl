import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import os from 'node:os';
import { languageDetector } from '../language.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccxl-test-'));
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe('languageDetector', () => {
  it('detects javascript from package.json', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
    const result = await languageDetector.detect(tmpDir);
    expect(result.type).toBe('languages');
    const langs = result.data as Array<{ name: string }>;
    expect(langs.some((l) => l.name === 'javascript')).toBe(true);
  });

  it('detects typescript when tsconfig.json exists', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
    await fs.writeJson(path.join(tmpDir, 'tsconfig.json'), {});
    const result = await languageDetector.detect(tmpDir);
    const langs = result.data as Array<{ name: string }>;
    expect(langs.some((l) => l.name === 'typescript')).toBe(true);
  });

  it('detects python from pyproject.toml', async () => {
    await fs.writeFile(path.join(tmpDir, 'pyproject.toml'), '[project]\nname = "test"');
    const result = await languageDetector.detect(tmpDir);
    const langs = result.data as Array<{ name: string }>;
    expect(langs.some((l) => l.name === 'python')).toBe(true);
  });

  it('detects python from requirements.txt', async () => {
    await fs.writeFile(path.join(tmpDir, 'requirements.txt'), 'flask\n');
    const result = await languageDetector.detect(tmpDir);
    const langs = result.data as Array<{ name: string }>;
    expect(langs.some((l) => l.name === 'python')).toBe(true);
  });

  it('detects go from go.mod', async () => {
    await fs.writeFile(path.join(tmpDir, 'go.mod'), 'module example.com/test');
    const result = await languageDetector.detect(tmpDir);
    const langs = result.data as Array<{ name: string }>;
    expect(langs.some((l) => l.name === 'go')).toBe(true);
  });

  it('detects rust from Cargo.toml', async () => {
    await fs.writeFile(path.join(tmpDir, 'Cargo.toml'), '[package]\nname = "test"');
    const result = await languageDetector.detect(tmpDir);
    const langs = result.data as Array<{ name: string }>;
    expect(langs.some((l) => l.name === 'rust')).toBe(true);
  });

  it('detects java from pom.xml', async () => {
    await fs.writeFile(path.join(tmpDir, 'pom.xml'), '<project></project>');
    const result = await languageDetector.detect(tmpDir);
    const langs = result.data as Array<{ name: string }>;
    expect(langs.some((l) => l.name === 'java')).toBe(true);
  });

  it('detects java from build.gradle', async () => {
    await fs.writeFile(path.join(tmpDir, 'build.gradle'), 'apply plugin: "java"');
    const result = await languageDetector.detect(tmpDir);
    const langs = result.data as Array<{ name: string }>;
    expect(langs.some((l) => l.name === 'java')).toBe(true);
  });

  it('detects swift from Package.swift', async () => {
    await fs.writeFile(path.join(tmpDir, 'Package.swift'), '// swift-tools-version:5.9');
    const result = await languageDetector.detect(tmpDir);
    const langs = result.data as Array<{ name: string }>;
    expect(langs.some((l) => l.name === 'swift')).toBe(true);
  });

  it('detects multiple languages', async () => {
    await fs.writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
    await fs.writeFile(path.join(tmpDir, 'go.mod'), 'module example.com/test');
    const result = await languageDetector.detect(tmpDir);
    const langs = result.data as Array<{ name: string }>;
    expect(langs.length).toBeGreaterThanOrEqual(2);
    expect(langs.some((l) => l.name === 'javascript')).toBe(true);
    expect(langs.some((l) => l.name === 'go')).toBe(true);
  });

  it('returns empty array for no config files', async () => {
    const result = await languageDetector.detect(tmpDir);
    const langs = result.data as Array<{ name: string }>;
    expect(langs).toEqual([]);
  });
});

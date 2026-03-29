import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { execFileSync } from 'node:child_process';
import { PackageManifestSchema, PackageRegistrySchema } from './types.js';
import type { InstalledPackage, PackageRegistry } from './types.js';

const SAFE_PATH_RE = /^[a-zA-Z0-9._\-/]+$/;

function validateFilePath(file: string, baseDir: string): string {
  if (!SAFE_PATH_RE.test(file) || file.includes('..')) {
    throw new Error(`Unsafe file path in package manifest: ${file}`);
  }
  const resolved = path.resolve(baseDir, file);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error(`Path traversal detected in package file: ${file}`);
  }
  return resolved;
}

function validateOwnerRepo(value: string): void {
  if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
    throw new Error(`Invalid GitHub identifier: ${value}`);
  }
}

export async function installPackage(
  source: string,
  root: string,
  options: { global?: boolean; preview?: boolean } = {},
): Promise<InstalledPackage> {
  const targetRoot = options.global ? path.join(os.homedir(), '.claude') : root;

  const { owner, repo } = parseSource(source);
  validateOwnerRepo(owner);
  validateOwnerRepo(repo);

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ccxl-install-'));
  try {
    const tarballUrl = `https://api.github.com/repos/${owner}/${repo}/tarball/main`;
    const response = await fetch(tarballUrl, {
      headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'ccxl' },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${owner}/${repo}: ${response.status} ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const tarPath = path.join(tmpDir, 'package.tar.gz');
    await fs.writeFile(tarPath, buffer);

    // Use execFileSync to avoid shell injection
    execFileSync('tar', ['-xzf', tarPath, '-C', tmpDir], { stdio: 'pipe' });

    const entries = await fs.readdir(tmpDir);
    const extractedDir = entries.find((e) => e !== 'package.tar.gz');
    if (!extractedDir) throw new Error('Failed to extract package');

    const packageDir = path.join(tmpDir, extractedDir);

    const manifestPath = path.join(packageDir, 'ccxl-package.json');
    if (!await fs.pathExists(manifestPath)) {
      throw new Error(`No ccxl-package.json found in ${owner}/${repo}`);
    }

    const manifestData = await fs.readJson(manifestPath);
    const manifest = PackageManifestSchema.parse(manifestData);

    if (options.preview) {
      return {
        name: manifest.name,
        version: manifest.version,
        source: `${owner}/${repo}`,
        installedAt: new Date().toISOString(),
        files: manifest.files,
      };
    }

    // Copy files with path traversal protection
    const claudeDir = path.join(targetRoot, '.claude');
    const installedFiles: string[] = [];
    for (const file of manifest.files) {
      const destPath = validateFilePath(file, claudeDir);
      const srcPath = path.join(packageDir, file);

      if (!await fs.pathExists(srcPath)) {
        console.warn(`Warning: ${file} listed in manifest but not found in package`);
        continue;
      }

      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(srcPath, destPath, { overwrite: false });
      installedFiles.push(file);
    }

    const installed: InstalledPackage = {
      name: manifest.name,
      version: manifest.version,
      source: `${owner}/${repo}`,
      installedAt: new Date().toISOString(),
      files: installedFiles,
    };

    await recordInstallation(targetRoot, installed);
    return installed;
  } finally {
    await fs.remove(tmpDir);
  }
}

function parseSource(source: string): { owner: string; repo: string } {
  if (source.includes('/') && !source.includes('://')) {
    const [owner, repo] = source.split('/');
    if (!owner || !repo) throw new Error(`Invalid source: ${source}. Use format: user/repo`);
    return { owner, repo };
  }

  const match = source.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)/);
  if (match) return { owner: match[1]!, repo: match[2]!.replace(/\.git$/, '') };

  throw new Error(`Invalid source: ${source}. Use format: user/repo or a GitHub URL`);
}

async function recordInstallation(root: string, pkg: InstalledPackage): Promise<void> {
  const registryPath = path.join(root, '.claude', 'ccxl-packages.json');

  let registry: PackageRegistry = { packages: [] };
  if (await fs.pathExists(registryPath)) {
    const data = await fs.readJson(registryPath);
    registry = PackageRegistrySchema.parse(data);
  }

  registry.packages = registry.packages.filter((p) => p.name !== pkg.name);
  registry.packages.push(pkg);

  await fs.ensureDir(path.dirname(registryPath));
  await fs.writeJson(registryPath, registry, { spaces: 2 });
}

import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { PackageManifestSchema } from './types.js';
import type { InstalledPackage, PackageRegistry } from './types.js';

export async function installPackage(
  source: string,
  root: string,
  options: { global?: boolean; preview?: boolean } = {},
): Promise<InstalledPackage> {
  const targetRoot = options.global ? path.join(os.homedir(), '.claude') : root;

  // Parse source: "user/repo" or full URL
  const { owner, repo } = parseSource(source);

  // Fetch tarball
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

    // Extract tarball
    const buffer = Buffer.from(await response.arrayBuffer());
    const tarPath = path.join(tmpDir, 'package.tar.gz');
    await fs.writeFile(tarPath, buffer);

    // Use tar to extract
    const { execSync } = await import('node:child_process');
    execSync(`tar -xzf "${tarPath}" -C "${tmpDir}"`, { stdio: 'pipe' });

    // Find the extracted directory (GitHub adds a prefix)
    const entries = await fs.readdir(tmpDir);
    const extractedDir = entries.find((e) => e !== 'package.tar.gz');
    if (!extractedDir) throw new Error('Failed to extract package');

    const packageDir = path.join(tmpDir, extractedDir);

    // Read and validate manifest
    const manifestPath = path.join(packageDir, 'ccxl-package.json');
    if (!await fs.pathExists(manifestPath)) {
      throw new Error(`No ccxl-package.json found in ${owner}/${repo}`);
    }

    const manifestData = await fs.readJson(manifestPath);
    const manifest = PackageManifestSchema.parse(manifestData);

    if (options.preview) {
      // Return without writing
      return {
        name: manifest.name,
        version: manifest.version,
        source: `${owner}/${repo}`,
        installedAt: new Date().toISOString(),
        files: manifest.files,
      };
    }

    // Copy files to target
    const installedFiles: string[] = [];
    for (const file of manifest.files) {
      const srcPath = path.join(packageDir, file);
      const destPath = path.join(targetRoot, '.claude', file);

      if (!await fs.pathExists(srcPath)) {
        console.warn(`Warning: ${file} listed in manifest but not found in package`);
        continue;
      }

      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(srcPath, destPath, { overwrite: false });
      installedFiles.push(file);
    }

    // Record installation
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
  // Handle "user/repo" format
  if (source.includes('/') && !source.includes('://')) {
    const [owner, repo] = source.split('/');
    if (!owner || !repo) throw new Error(`Invalid source: ${source}. Use format: user/repo`);
    return { owner, repo };
  }

  // Handle full GitHub URL
  const match = source.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) return { owner: match[1]!, repo: match[2]!.replace(/\.git$/, '') };

  throw new Error(`Invalid source: ${source}. Use format: user/repo or a GitHub URL`);
}

async function recordInstallation(root: string, pkg: InstalledPackage): Promise<void> {
  const registryPath = path.join(root, '.claude', 'ccxl-packages.json');

  let registry: PackageRegistry = { packages: [] };
  if (await fs.pathExists(registryPath)) {
    registry = await fs.readJson(registryPath) as PackageRegistry;
  }

  // Replace existing entry for same package name
  registry.packages = registry.packages.filter((p) => p.name !== pkg.name);
  registry.packages.push(pkg);

  await fs.ensureDir(path.dirname(registryPath));
  await fs.writeJson(registryPath, registry, { spaces: 2 });
}

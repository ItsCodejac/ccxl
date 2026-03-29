import path from 'node:path';
import fs from 'fs-extra';
import { PackageRegistrySchema } from './types.js';

export async function uninstallPackage(name: string, root: string): Promise<void> {
  const registryPath = path.join(root, '.claude', 'ccxl-packages.json');

  if (!await fs.pathExists(registryPath)) {
    throw new Error(`No packages installed (${registryPath} not found)`);
  }

  const data = await fs.readJson(registryPath);
  const registry = PackageRegistrySchema.parse(data);
  const pkg = registry.packages.find((p) => p.name === name);

  if (!pkg) {
    throw new Error(`Package "${name}" is not installed`);
  }

  // Remove installed files with path traversal protection
  const claudeDir = path.resolve(root, '.claude');
  for (const file of pkg.files) {
    if (file.includes('..') || !(/^[a-zA-Z0-9._\-/]+$/.test(file))) {
      console.warn(`Skipping unsafe path: ${file}`);
      continue;
    }
    const filePath = path.resolve(claudeDir, file);
    if (!filePath.startsWith(claudeDir)) {
      console.warn(`Skipping path traversal: ${file}`);
      continue;
    }
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  registry.packages = registry.packages.filter((p) => p.name !== name);
  await fs.writeJson(registryPath, registry, { spaces: 2 });
}

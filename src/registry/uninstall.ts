import path from 'node:path';
import fs from 'fs-extra';
import type { PackageRegistry } from './types.js';

export async function uninstallPackage(name: string, root: string): Promise<void> {
  const registryPath = path.join(root, '.claude', 'ccxl-packages.json');

  if (!await fs.pathExists(registryPath)) {
    throw new Error(`No packages installed (${registryPath} not found)`);
  }

  const registry = await fs.readJson(registryPath) as PackageRegistry;
  const pkg = registry.packages.find((p) => p.name === name);

  if (!pkg) {
    throw new Error(`Package "${name}" is not installed`);
  }

  // Remove installed files
  for (const file of pkg.files) {
    const filePath = path.join(root, '.claude', file);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  // Update registry
  registry.packages = registry.packages.filter((p) => p.name !== name);
  await fs.writeJson(registryPath, registry, { spaces: 2 });
}

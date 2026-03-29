import path from 'node:path';
import fs from 'fs-extra';
import type { InstalledPackage, PackageRegistry } from './types.js';

export async function listInstalled(root: string): Promise<InstalledPackage[]> {
  const registryPath = path.join(root, '.claude', 'ccxl-packages.json');

  if (!await fs.pathExists(registryPath)) {
    return [];
  }

  const registry = await fs.readJson(registryPath) as PackageRegistry;
  return registry.packages;
}

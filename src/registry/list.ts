import path from 'node:path';
import fs from 'fs-extra';
import { PackageRegistrySchema } from './types.js';
import type { InstalledPackage } from './types.js';

export async function listInstalled(root: string): Promise<InstalledPackage[]> {
  const registryPath = path.join(root, '.claude', 'ccxl-packages.json');

  if (!await fs.pathExists(registryPath)) {
    return [];
  }

  const data = await fs.readJson(registryPath);
  const registry = PackageRegistrySchema.parse(data);
  return registry.packages;
}

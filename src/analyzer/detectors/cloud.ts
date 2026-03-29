import path from 'node:path';
import fs from 'fs-extra';
import type { Detector, DetectorResult } from '../detector.js';
import type { CloudProviderInfo } from '../../types/index.js';

const CONFIG_FILE_SIGNALS: Array<{ name: string; file: string; services: string[] }> = [
  { name: 'vercel', file: 'vercel.json', services: ['hosting'] },
  { name: 'netlify', file: 'netlify.toml', services: ['hosting'] },
  { name: 'fly', file: 'fly.toml', services: ['hosting'] },
];

const DEP_SIGNALS: Array<{ name: string; patterns: string[]; services: string[] }> = [
  { name: 'aws', patterns: ['aws-sdk', '@aws-sdk/'], services: [] },
  { name: 'gcp', patterns: ['@google-cloud/'], services: [] },
  { name: 'azure', patterns: ['@azure/'], services: [] },
];

export const cloudDetector: Detector = {
  name: 'cloud',
  async detect(root: string): Promise<DetectorResult> {
    const providers: CloudProviderInfo[] = [];
    const seen = new Set<string>();

    // Check config files
    for (const signal of CONFIG_FILE_SIGNALS) {
      if (await fs.pathExists(path.join(root, signal.file))) {
        if (!seen.has(signal.name)) {
          seen.add(signal.name);
          providers.push({ name: signal.name, services: signal.services });
        }
      }
    }

    // Check package.json deps
    const pkgPath = path.join(root, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = (await fs.readJson(pkgPath)) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const allDeps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

      for (const signal of DEP_SIGNALS) {
        if (seen.has(signal.name)) continue;
        const found = allDeps.some((dep) =>
          signal.patterns.some((p) => dep === p || dep.startsWith(p)),
        );
        if (found) {
          seen.add(signal.name);
          providers.push({ name: signal.name, services: signal.services });
        }
      }
    }

    return { type: 'cloud', data: providers };
  },
};

import path from 'node:path';
import fs from 'fs-extra';
import type { Detector, DetectorResult } from '../detector.js';
import type { PackageManagerInfo } from '../../types/index.js';

const LOCKFILES: Array<{ name: PackageManagerInfo['name']; lockfile: string }> = [
  { name: 'bun', lockfile: 'bun.lockb' },
  { name: 'pnpm', lockfile: 'pnpm-lock.yaml' },
  { name: 'yarn', lockfile: 'yarn.lock' },
  { name: 'npm', lockfile: 'package-lock.json' },
];

export const packageManagerDetector: Detector = {
  name: 'package-manager',
  async detect(root: string): Promise<DetectorResult> {
    for (const entry of LOCKFILES) {
      if (await fs.pathExists(path.join(root, entry.lockfile))) {
        return {
          type: 'packageManager',
          data: { name: entry.name, lockfile: entry.lockfile },
        };
      }
    }
    return { type: 'packageManager', data: null };
  },
};

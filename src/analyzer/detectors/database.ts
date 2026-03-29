import path from 'node:path';
import fs from 'fs-extra';
import type { Detector, DetectorResult } from '../detector.js';
import type { DatabaseInfo } from '../../types/index.js';

const DB_SIGNALS: Array<{ name: string; type: DatabaseInfo['type']; deps: string[] }> = [
  { name: 'postgresql', type: 'sql', deps: ['pg', 'postgres', '@neondatabase/serverless'] },
  { name: 'mysql', type: 'sql', deps: ['mysql2', 'mysql'] },
  { name: 'sqlite', type: 'sql', deps: ['sqlite3', 'better-sqlite3'] },
  { name: 'mongodb', type: 'nosql', deps: ['mongodb', 'mongoose'] },
  { name: 'redis', type: 'cache', deps: ['redis', 'ioredis', '@upstash/redis'] },
  { name: 'elasticsearch', type: 'search', deps: ['@elastic/elasticsearch'] },
];

export const databaseDetector: Detector = {
  name: 'database',
  async detect(root: string): Promise<DetectorResult> {
    const databases: DatabaseInfo[] = [];
    const seen = new Set<string>();

    const pkgPath = path.join(root, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = (await fs.readJson(pkgPath)) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const allDeps = new Set(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }));

      for (const signal of DB_SIGNALS) {
        if (signal.deps.some((d) => allDeps.has(d)) && !seen.has(signal.name)) {
          seen.add(signal.name);
          databases.push({ name: signal.name, type: signal.type });
        }
      }
    }

    return { type: 'databases', data: databases };
  },
};

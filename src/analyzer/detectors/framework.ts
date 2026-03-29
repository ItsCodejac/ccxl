import path from 'node:path';
import fs from 'fs-extra';
import type { Detector, DetectorResult } from '../detector.js';
import type { FrameworkInfo } from '../../types/index.js';

type FrameworkCategory = FrameworkInfo['category'];

interface FrameworkSignal {
  name: string;
  category: FrameworkCategory;
  dep: string;
  devDep?: boolean;
}

const JS_FRAMEWORK_SIGNALS: FrameworkSignal[] = [
  { name: 'react', category: 'frontend', dep: 'react' },
  { name: 'next', category: 'fullstack', dep: 'next' },
  { name: 'vue', category: 'frontend', dep: 'vue' },
  { name: 'nuxt', category: 'fullstack', dep: 'nuxt' },
  { name: 'svelte', category: 'frontend', dep: 'svelte' },
  { name: 'angular', category: 'frontend', dep: '@angular/core' },
  { name: 'solid', category: 'frontend', dep: 'solid-js' },
  { name: 'remix', category: 'fullstack', dep: '@remix-run/react' },
  { name: 'astro', category: 'fullstack', dep: 'astro' },
  { name: 'express', category: 'backend', dep: 'express' },
  { name: 'fastify', category: 'backend', dep: 'fastify' },
  { name: 'hono', category: 'backend', dep: 'hono' },
  { name: 'prisma', category: 'orm', dep: '@prisma/client' },
  { name: 'drizzle', category: 'orm', dep: 'drizzle-orm' },
  { name: 'trpc', category: 'data', dep: '@trpc/server' },
  { name: 'vite', category: 'build', dep: 'vite', devDep: true },
  { name: 'webpack', category: 'build', dep: 'webpack', devDep: true },
  { name: 'jest', category: 'test', dep: 'jest', devDep: true },
  { name: 'vitest', category: 'test', dep: 'vitest', devDep: true },
  { name: 'mocha', category: 'test', dep: 'mocha', devDep: true },
];

interface PythonFrameworkSignal {
  name: string;
  category: FrameworkCategory;
  pattern: string;
}

const PYTHON_FRAMEWORK_SIGNALS: PythonFrameworkSignal[] = [
  { name: 'django', category: 'backend', pattern: 'django' },
  { name: 'flask', category: 'backend', pattern: 'flask' },
  { name: 'fastapi', category: 'backend', pattern: 'fastapi' },
];

export const frameworkDetector: Detector = {
  name: 'framework',
  async detect(root: string): Promise<DetectorResult> {
    const frameworks: FrameworkInfo[] = [];

    // Check JS/TS frameworks from package.json
    const pkgPath = path.join(root, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = (await fs.readJson(pkgPath)) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const deps = pkg.dependencies ?? {};
      const devDeps = pkg.devDependencies ?? {};
      const allDeps = { ...deps, ...devDeps };

      for (const signal of JS_FRAMEWORK_SIGNALS) {
        const source = signal.devDep ? allDeps : deps;
        const version = source[signal.dep] ?? (signal.devDep ? undefined : devDeps[signal.dep]);
        if (version !== undefined || allDeps[signal.dep] !== undefined) {
          frameworks.push({
            name: signal.name,
            version: allDeps[signal.dep],
            category: signal.category,
          });
        }
      }
    }

    // Check Python frameworks from pyproject.toml
    const pyprojectPath = path.join(root, 'pyproject.toml');
    if (await fs.pathExists(pyprojectPath)) {
      const content = await fs.readFile(pyprojectPath, 'utf-8');
      const lower = content.toLowerCase();
      for (const signal of PYTHON_FRAMEWORK_SIGNALS) {
        if (lower.includes(signal.pattern)) {
          frameworks.push({ name: signal.name, category: signal.category });
        }
      }
    }

    return { type: 'frameworks', data: frameworks };
  },
};

import path from 'node:path';
import fs from 'fs-extra';
import type { Detector, DetectorResult } from '../detector.js';
import type { MonorepoInfo } from '../../types/index.js';

export const monorepoDetector: Detector = {
  name: 'monorepo',
  async detect(root: string): Promise<DetectorResult> {
    // Check for turbo.json (Turborepo)
    if (await fs.pathExists(path.join(root, 'turbo.json'))) {
      const workspaces = await readWorkspacesFromPkg(root);
      return { type: 'monorepo', data: { tool: 'turborepo', workspaces } };
    }

    // Check for nx.json (Nx)
    if (await fs.pathExists(path.join(root, 'nx.json'))) {
      const workspaces = await readWorkspacesFromPkg(root);
      return { type: 'monorepo', data: { tool: 'nx', workspaces } };
    }

    // Check for pnpm-workspace.yaml
    if (await fs.pathExists(path.join(root, 'pnpm-workspace.yaml'))) {
      const content = await fs.readFile(path.join(root, 'pnpm-workspace.yaml'), 'utf-8');
      const workspaces = parsePnpmWorkspaces(content);
      return { type: 'monorepo', data: { tool: 'pnpm', workspaces } };
    }

    // Check for lerna.json
    if (await fs.pathExists(path.join(root, 'lerna.json'))) {
      const lerna = (await fs.readJson(path.join(root, 'lerna.json'))) as { packages?: string[] };
      return { type: 'monorepo', data: { tool: 'lerna', workspaces: lerna.packages ?? [] } };
    }

    // Check for workspaces in package.json (npm/yarn)
    const pkgPath = path.join(root, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = (await fs.readJson(pkgPath)) as { workspaces?: string[] | { packages: string[] } };
      if (pkg.workspaces) {
        const workspaces = Array.isArray(pkg.workspaces) ? pkg.workspaces : pkg.workspaces.packages;
        return { type: 'monorepo', data: { tool: 'npm/yarn', workspaces } };
      }
    }

    return { type: 'monorepo', data: null };
  },
};

async function readWorkspacesFromPkg(root: string): Promise<string[]> {
  const pkgPath = path.join(root, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    const pkg = (await fs.readJson(pkgPath)) as { workspaces?: string[] | { packages: string[] } };
    if (pkg.workspaces) {
      return Array.isArray(pkg.workspaces) ? pkg.workspaces : pkg.workspaces.packages;
    }
  }
  return [];
}

function parsePnpmWorkspaces(content: string): string[] {
  const workspaces: string[] = [];
  const lines = content.split('\n');
  let inPackages = false;
  for (const line of lines) {
    if (line.trim() === 'packages:') {
      inPackages = true;
      continue;
    }
    if (inPackages) {
      const match = line.match(/^\s+-\s+"?([^"]+)"?\s*$/);
      if (match) {
        workspaces.push(match[1]!);
      } else if (line.trim() && !line.startsWith(' ') && !line.startsWith('\t')) {
        break;
      }
    }
  }
  return workspaces;
}

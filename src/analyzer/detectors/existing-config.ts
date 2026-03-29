import path from 'node:path';
import fs from 'fs-extra';
import type { Detector, DetectorResult } from '../detector.js';
import type { ExistingConfigInfo } from '../../types/index.js';

interface ConfigSignal {
  tool: ExistingConfigInfo['tool'];
  path: string;
  featureChecks?: Array<{ check: (root: string) => Promise<boolean>; feature: string }>;
}

const CONFIG_SIGNALS: ConfigSignal[] = [
  {
    tool: 'claude',
    path: '.claude/settings.json',
    featureChecks: [
      { check: (root) => fs.pathExists(path.join(root, '.claude', 'skills')), feature: 'skills' },
      { check: (root) => fs.pathExists(path.join(root, 'AGENTS.md')), feature: 'agents' },
      { check: (root) => fs.pathExists(path.join(root, '.mcp.json')), feature: 'mcp' },
      { check: (root) => fs.pathExists(path.join(root, 'CLAUDE.md')), feature: 'claude-md' },
    ],
  },
  { tool: 'cursor', path: '.cursorrules' },
  { tool: 'copilot', path: '.github/copilot-instructions.md' },
  { tool: 'windsurf', path: '.windsurfrules' },
];

export const existingConfigDetector: Detector = {
  name: 'existing-config',
  async detect(root: string): Promise<DetectorResult> {
    const configs: ExistingConfigInfo[] = [];

    for (const signal of CONFIG_SIGNALS) {
      const fullPath = path.join(root, signal.path);
      const exists = await fs.pathExists(fullPath);

      if (!exists) {
        // Also check alternate paths
        if (signal.tool === 'copilot') {
          const altPath = path.join(root, 'copilot-instructions.md');
          if (await fs.pathExists(altPath)) {
            const features = await detectFeatures(root, signal);
            configs.push({ tool: signal.tool, path: 'copilot-instructions.md', exists: true, features });
            continue;
          }
        }
        if (signal.tool === 'cursor') {
          const altPath = path.join(root, '.cursor', 'rules');
          if (await fs.pathExists(altPath)) {
            configs.push({ tool: signal.tool, path: '.cursor/rules/', exists: true, features: ['rules-dir'] });
            continue;
          }
        }
        configs.push({ tool: signal.tool, path: signal.path, exists: false, features: [] });
        continue;
      }

      const features = await detectFeatures(root, signal);
      configs.push({ tool: signal.tool, path: signal.path, exists: true, features });
    }

    return { type: 'existingConfigs', data: configs };
  },
};

async function detectFeatures(root: string, signal: ConfigSignal): Promise<string[]> {
  if (!signal.featureChecks) return [];
  const features: string[] = [];
  for (const fc of signal.featureChecks) {
    if (await fc.check(root)) {
      features.push(fc.feature);
    }
  }
  return features;
}

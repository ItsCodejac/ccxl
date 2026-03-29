import path from 'node:path';
import fs from 'fs-extra';
import type { Detector, DetectorResult } from '../detector.js';
import type { CIProviderInfo } from '../../types/index.js';

const CI_SIGNALS: Array<{ name: string; configPath: string; check: (root: string) => Promise<boolean> }> = [
  {
    name: 'github-actions',
    configPath: '.github/workflows/',
    check: (root) => fs.pathExists(path.join(root, '.github', 'workflows')),
  },
  {
    name: 'gitlab-ci',
    configPath: '.gitlab-ci.yml',
    check: (root) => fs.pathExists(path.join(root, '.gitlab-ci.yml')),
  },
  {
    name: 'circleci',
    configPath: '.circleci/config.yml',
    check: (root) => fs.pathExists(path.join(root, '.circleci', 'config.yml')),
  },
  {
    name: 'jenkins',
    configPath: 'Jenkinsfile',
    check: (root) => fs.pathExists(path.join(root, 'Jenkinsfile')),
  },
  {
    name: 'travis',
    configPath: '.travis.yml',
    check: (root) => fs.pathExists(path.join(root, '.travis.yml')),
  },
];

export const ciDetector: Detector = {
  name: 'ci',
  async detect(root: string): Promise<DetectorResult> {
    const providers: CIProviderInfo[] = [];
    for (const signal of CI_SIGNALS) {
      if (await signal.check(root)) {
        providers.push({ name: signal.name, configPath: signal.configPath });
      }
    }
    return { type: 'ci', data: providers };
  },
};

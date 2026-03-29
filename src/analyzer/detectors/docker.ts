import path from 'node:path';
import fs from 'fs-extra';
import type { Detector, DetectorResult } from '../detector.js';

export const dockerDetector: Detector = {
  name: 'docker',
  async detect(root: string): Promise<DetectorResult> {
    const hasDockerfile = await fs.pathExists(path.join(root, 'Dockerfile'));
    const hasCompose =
      (await fs.pathExists(path.join(root, 'docker-compose.yml'))) ||
      (await fs.pathExists(path.join(root, 'docker-compose.yaml'))) ||
      (await fs.pathExists(path.join(root, 'compose.yml'))) ||
      (await fs.pathExists(path.join(root, 'compose.yaml')));

    if (!hasDockerfile && !hasCompose) {
      return { type: 'docker', data: null };
    }

    return { type: 'docker', data: { hasDockerfile, hasCompose } };
  },
};

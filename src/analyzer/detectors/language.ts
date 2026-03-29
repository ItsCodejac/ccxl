import path from 'node:path';
import fs from 'fs-extra';
import type { Detector, DetectorResult } from '../detector.js';
import type { LanguageInfo } from '../../types/index.js';

interface LanguageSignal {
  name: string;
  configFiles: string[];
}

const LANGUAGE_SIGNALS: LanguageSignal[] = [
  { name: 'javascript', configFiles: ['package.json'] },
  { name: 'typescript', configFiles: ['tsconfig.json'] },
  { name: 'python', configFiles: ['pyproject.toml', 'requirements.txt', 'setup.py'] },
  { name: 'go', configFiles: ['go.mod'] },
  { name: 'rust', configFiles: ['Cargo.toml'] },
  { name: 'java', configFiles: ['pom.xml', 'build.gradle', 'build.gradle.kts'] },
  { name: 'swift', configFiles: ['Package.swift'] },
];

export const languageDetector: Detector = {
  name: 'language',
  async detect(root: string): Promise<DetectorResult> {
    const languages: LanguageInfo[] = [];

    for (const signal of LANGUAGE_SIGNALS) {
      const found: string[] = [];
      for (const configFile of signal.configFiles) {
        if (await fs.pathExists(path.join(root, configFile))) {
          found.push(configFile);
        }
      }
      if (found.length > 0) {
        languages.push({ name: signal.name, configFiles: found });
      }
    }

    return { type: 'languages', data: languages };
  },
};

import path from 'node:path';
import fs from 'fs-extra';
import { analyzeProject } from '../analyzer/index.js';
import { runPipeline } from '../generators/pipeline.js';
import type { GeneratedFile } from '../generators/types.js';

export interface DriftReport {
  missing: GeneratedFile[];
  stale: Array<GeneratedFile & { existingContent: string }>;
  current: string[];
}

export async function detectDrift(root: string): Promise<DriftReport> {
  const analysis = await analyzeProject(root);
  const generated = await runPipeline(analysis, root, { merge: false });

  const missing: GeneratedFile[] = [];
  const stale: Array<GeneratedFile & { existingContent: string }> = [];
  const current: string[] = [];

  for (const file of generated) {
    const fullPath = path.join(root, file.path);

    if (!await fs.pathExists(fullPath)) {
      missing.push(file);
      continue;
    }

    const existingContent = await fs.readFile(fullPath, 'utf-8');
    if (existingContent.trim() !== file.content.trim()) {
      stale.push({ ...file, existingContent });
    } else {
      current.push(file.path);
    }
  }

  return { missing, stale, current };
}

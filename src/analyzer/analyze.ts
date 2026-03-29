import path from 'node:path';
import { ProjectAnalysisSchema } from '../types/index.js';
import type { ProjectAnalysis } from '../types/index.js';
import { DetectorRegistry } from './detector.js';
import type { DetectorResult } from './detector.js';

export async function analyzeProject(root: string): Promise<ProjectAnalysis> {
  const registry = new DetectorRegistry();

  // Detectors are registered here as they're implemented in Plans 02-02 through 02-04.
  // Each detector module exports a Detector object that gets imported and registered.

  const results = await registry.runAll(root);

  const analysis = assembleResults(root, results);

  return ProjectAnalysisSchema.parse(analysis);
}

function assembleResults(
  root: string,
  results: DetectorResult[],
): ProjectAnalysis {
  const analysis: ProjectAnalysis = {
    name: path.basename(root),
    root,
    languages: [],
    frameworks: [],
    packageManager: null,
    monorepo: null,
    ci: [],
    cloud: [],
    databases: [],
    docker: null,
    existingConfigs: [],
    analyzedAt: new Date(),
  };

  for (const result of results) {
    switch (result.type) {
      case 'languages':
        analysis.languages.push(...result.data);
        break;
      case 'frameworks':
        analysis.frameworks.push(...result.data);
        break;
      case 'packageManager':
        if (result.data) analysis.packageManager = result.data;
        break;
      case 'monorepo':
        if (result.data) analysis.monorepo = result.data;
        break;
      case 'ci':
        analysis.ci.push(...result.data);
        break;
      case 'cloud':
        analysis.cloud.push(...result.data);
        break;
      case 'databases':
        analysis.databases.push(...result.data);
        break;
      case 'docker':
        if (result.data) analysis.docker = result.data;
        break;
      case 'existingConfigs':
        analysis.existingConfigs.push(...result.data);
        break;
    }
  }

  return analysis;
}

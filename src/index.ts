import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string };

export const version = pkg.version;

export type { ProjectAnalysis, ExistingConfig, GeneratorOptions } from './types/index.js';

import type { ProjectAnalysis } from '../types/index.js';
import type { Generator } from './generator.js';
import type { GeneratorResult } from './types.js';

export const claudeMdGenerator: Generator = {
  name: 'claude-md',
  async generate(analysis: ProjectAnalysis): Promise<GeneratorResult> {
    const sections: string[] = [];

    sections.push(`# ${analysis.name}\n`);
    sections.push(buildOverview(analysis));
    sections.push(buildArchitecture(analysis));
    sections.push(buildDevelopment(analysis));
    sections.push(buildStandards(analysis));
    sections.push(buildNotes(analysis));

    const content = sections.filter(Boolean).join('\n');

    return {
      files: [{ path: 'CLAUDE.md', content, status: 'new' }],
      summary: 'Generated CLAUDE.md with project-specific context',
    };
  },
};

function buildOverview(a: ProjectAnalysis): string {
  const langs = a.languages.map((l) => l.name).join(', ');
  const fws = a.frameworks.filter((f) => f.category !== 'test' && f.category !== 'build')
    .map((f) => f.name).join(', ');

  let overview = `## Overview\n\n`;
  if (langs) overview += `**Languages:** ${langs}\n`;
  if (fws) overview += `**Frameworks:** ${fws}\n`;
  if (a.packageManager) overview += `**Package Manager:** ${a.packageManager.name}\n`;
  if (a.monorepo) overview += `**Monorepo:** ${a.monorepo.tool} (${a.monorepo.workspaces.join(', ')})\n`;
  return overview;
}

function buildArchitecture(a: ProjectAnalysis): string {
  const parts: string[] = ['## Architecture\n'];

  // Key dependencies
  const deps = a.frameworks.filter((f) => f.version);
  if (deps.length > 0) {
    parts.push('### Key Dependencies\n');
    for (const d of deps) {
      parts.push(`- **${d.name}** ${d.version} (${d.category})`);
    }
    parts.push('');
  }

  // Infrastructure
  const infra: string[] = [];
  if (a.ci.length > 0) infra.push(`CI/CD: ${a.ci.map((c) => c.name).join(', ')}`);
  if (a.cloud.length > 0) infra.push(`Cloud: ${a.cloud.map((c) => c.name).join(', ')}`);
  if (a.databases.length > 0) infra.push(`Databases: ${a.databases.map((d) => `${d.name} (${d.type})`).join(', ')}`);
  if (a.docker) {
    const dockerParts = [];
    if (a.docker.hasDockerfile) dockerParts.push('Dockerfile');
    if (a.docker.hasCompose) dockerParts.push('Compose');
    infra.push(`Docker: ${dockerParts.join(', ')}`);
  }

  if (infra.length > 0) {
    parts.push('### Infrastructure\n');
    for (const line of infra) parts.push(`- ${line}`);
    parts.push('');
  }

  return parts.join('\n');
}

function buildDevelopment(a: ProjectAnalysis): string {
  const pm = a.packageManager?.name ?? 'npm';
  const parts: string[] = ['## Development\n'];

  parts.push('```bash');
  parts.push(`# Install dependencies`);
  parts.push(pm === 'yarn' ? 'yarn' : pm === 'pnpm' ? 'pnpm install' : pm === 'bun' ? 'bun install' : 'npm install');
  parts.push('');
  parts.push('# Run development server');
  parts.push(`${pm} run dev`);
  parts.push('');
  parts.push('# Run tests');

  const testFw = a.frameworks.find((f) => f.category === 'test');
  if (testFw) {
    parts.push(pm === 'npm' ? `npm run test` : `${pm} test`);
  } else if (a.languages.some((l) => l.name === 'python')) {
    parts.push('pytest');
  } else if (a.languages.some((l) => l.name === 'go')) {
    parts.push('go test ./...');
  } else if (a.languages.some((l) => l.name === 'rust')) {
    parts.push('cargo test');
  } else {
    parts.push(`${pm} test`);
  }

  parts.push('');
  parts.push('# Build');
  parts.push(`${pm} run build`);
  parts.push('```\n');

  return parts.join('\n');
}

function buildStandards(a: ProjectAnalysis): string {
  const parts: string[] = ['## Standards\n'];
  const testFw = a.frameworks.find((f) => f.category === 'test');
  const buildTool = a.frameworks.find((f) => f.category === 'build');

  if (testFw) parts.push(`- **Testing:** ${testFw.name}`);
  if (buildTool) parts.push(`- **Build:** ${buildTool.name}`);

  const orm = a.frameworks.find((f) => f.category === 'orm');
  if (orm) parts.push(`- **ORM:** ${orm.name}`);

  if (parts.length === 1) return '';
  parts.push('');
  return parts.join('\n');
}

function buildNotes(a: ProjectAnalysis): string {
  const notes: string[] = [];

  if (a.databases.length > 0) {
    const orm = a.frameworks.find((f) => f.category === 'orm');
    if (orm) {
      notes.push(`Database managed via ${orm.name}. Run migrations before making schema changes.`);
    }
  }

  if (a.docker?.hasCompose) {
    notes.push('Use `docker compose up` to start local services.');
  }

  if (a.ci.length > 0) {
    notes.push(`CI runs on ${a.ci.map((c) => c.name).join(', ')}. Check pipeline before merging.`);
  }

  if (notes.length === 0) return '';

  return `## Notes\n\n${notes.map((n) => `- ${n}`).join('\n')}\n`;
}

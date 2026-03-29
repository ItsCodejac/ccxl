import { describe, it, expect } from 'vitest';
import { agentsGenerator } from '../agents.js';
import { mcpGenerator } from '../mcp.js';
import type { ProjectAnalysis } from '../../types/index.js';

function makeAnalysis(overrides: Partial<ProjectAnalysis> = {}): ProjectAnalysis {
  return {
    name: 'test-project',
    root: '/tmp/test',
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
    ...overrides,
  };
}

describe('agentsGenerator', () => {
  it('always generates code-reviewer and explorer', async () => {
    const result = await agentsGenerator.generate(makeAnalysis(), '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.claude/agents/code-reviewer.md');
    expect(paths).toContain('.claude/agents/explorer.md');
  });

  it('generates frontend-dev for React projects', async () => {
    const analysis = makeAnalysis({
      frameworks: [{ name: 'react', category: 'frontend' }],
    });
    const result = await agentsGenerator.generate(analysis, '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.claude/agents/frontend-dev.md');
    const content = result.files.find((f) => f.path.includes('frontend-dev'))!.content;
    expect(content).toContain('react');
  });

  it('generates api-developer for Express projects', async () => {
    const analysis = makeAnalysis({
      frameworks: [{ name: 'express', category: 'backend' }],
    });
    const result = await agentsGenerator.generate(analysis, '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.claude/agents/api-developer.md');
  });

  it('generates db-specialist for database projects', async () => {
    const analysis = makeAnalysis({
      databases: [{ name: 'postgresql', type: 'sql' }],
    });
    const result = await agentsGenerator.generate(analysis, '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.claude/agents/db-specialist.md');
  });

  it('generates devops for Docker projects', async () => {
    const analysis = makeAnalysis({
      docker: { hasDockerfile: true, hasCompose: true },
    });
    const result = await agentsGenerator.generate(analysis, '/tmp/test');
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.claude/agents/devops.md');
  });

  it('agent files have valid frontmatter', async () => {
    const result = await agentsGenerator.generate(makeAnalysis(), '/tmp/test');
    for (const file of result.files) {
      expect(file.content).toMatch(/^---\n/);
      expect(file.content).toContain('name:');
      expect(file.content).toContain('description:');
    }
  });

  it('code-reviewer uses sonnet model', async () => {
    const result = await agentsGenerator.generate(makeAnalysis(), '/tmp/test');
    const reviewer = result.files.find((f) => f.path.includes('code-reviewer'))!;
    expect(reviewer.content).toContain('model: "sonnet"');
  });

  it('explorer uses haiku model', async () => {
    const result = await agentsGenerator.generate(makeAnalysis(), '/tmp/test');
    const explorer = result.files.find((f) => f.path.includes('explorer'))!;
    expect(explorer.content).toContain('model: "haiku"');
  });
});

describe('mcpGenerator', () => {
  it('generates postgres MCP for PostgreSQL projects', async () => {
    const analysis = makeAnalysis({
      databases: [{ name: 'postgresql', type: 'sql' }],
    });
    const result = await mcpGenerator.generate(analysis, '/tmp/test');
    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.path).toBe('.mcp.json');
    const config = JSON.parse(result.files[0]!.content);
    expect(config.postgres).toBeDefined();
    expect(config.postgres.env.DATABASE_URL).toBe('$DATABASE_URL');
  });

  it('generates github MCP for GitHub Actions projects', async () => {
    const analysis = makeAnalysis({
      ci: [{ name: 'github-actions', configPath: '.github/workflows/' }],
    });
    const result = await mcpGenerator.generate(analysis, '/tmp/test');
    const config = JSON.parse(result.files[0]!.content);
    expect(config.github).toBeDefined();
  });

  it('generates no .mcp.json when no servers needed', async () => {
    const result = await mcpGenerator.generate(makeAnalysis(), '/tmp/test');
    expect(result.files).toHaveLength(0);
  });

  it('MCP configs use npx -y pattern', async () => {
    const analysis = makeAnalysis({
      databases: [{ name: 'postgresql', type: 'sql' }],
    });
    const result = await mcpGenerator.generate(analysis, '/tmp/test');
    const config = JSON.parse(result.files[0]!.content);
    expect(config.postgres.command).toBe('npx');
    expect(config.postgres.args[0]).toBe('-y');
  });
});

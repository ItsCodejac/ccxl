import type { ProjectAnalysis } from '../types/index.js';
import type { Generator } from './generator.js';
import type { GeneratorResult } from './types.js';

interface McpServerConfig {
  type: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface McpMapping {
  key: string;
  config: McpServerConfig;
  condition: (analysis: ProjectAnalysis) => boolean;
}

const MCP_MAPPINGS: McpMapping[] = [
  {
    key: 'postgres',
    config: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      env: { DATABASE_URL: '$DATABASE_URL' },
    },
    condition: (a) => a.databases.some((d) => d.name === 'postgresql'),
  },
  {
    key: 'sqlite',
    config: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite'],
      env: { SQLITE_PATH: '$SQLITE_PATH' },
    },
    condition: (a) => a.databases.some((d) => d.name === 'sqlite'),
  },
  {
    key: 'github',
    config: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: '$GITHUB_TOKEN' },
    },
    condition: (a) => a.ci.some((c) => c.name === 'github-actions'),
  },
];

export const mcpGenerator: Generator = {
  name: 'mcp',
  async generate(analysis: ProjectAnalysis): Promise<GeneratorResult> {
    const servers: Record<string, McpServerConfig> = {};

    for (const mapping of MCP_MAPPINGS) {
      if (mapping.condition(analysis)) {
        servers[mapping.key] = mapping.config;
      }
    }

    if (Object.keys(servers).length === 0) {
      return { files: [], summary: 'No MCP servers needed' };
    }

    return {
      files: [{
        path: '.mcp.json',
        content: JSON.stringify(servers, null, 2),
        status: 'new',
      }],
      summary: `Generated .mcp.json with ${Object.keys(servers).length} servers`,
    };
  },
};

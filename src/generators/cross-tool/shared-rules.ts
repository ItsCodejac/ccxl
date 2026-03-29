import type { ProjectAnalysis } from '../../types/index.js';

export interface SharedRule {
  id: string;
  title: string;
  description: string;
  globs?: string;
  alwaysOn: boolean;
  condition?: (analysis: ProjectAnalysis) => boolean;
  body: (analysis: ProjectAnalysis) => string;
}

export const SHARED_RULES: SharedRule[] = [
  {
    id: 'general',
    title: 'Project Overview',
    description: 'General project context and tech stack',
    alwaysOn: true,
    body: (a) => {
      const lines: string[] = [`# ${a.name}\n`];
      const langs = a.languages.map((l) => l.name).join(', ');
      if (langs) lines.push(`**Languages:** ${langs}`);
      const fws = a.frameworks.filter((f) => f.category !== 'test' && f.category !== 'build')
        .map((f) => f.name).join(', ');
      if (fws) lines.push(`**Frameworks:** ${fws}`);
      if (a.packageManager) lines.push(`**Package Manager:** ${a.packageManager.name}`);
      if (a.monorepo) lines.push(`**Monorepo:** ${a.monorepo.tool}`);
      return lines.join('\n');
    },
  },
  {
    id: 'code-style',
    title: 'Code Style',
    description: 'Coding standards and conventions for this project',
    alwaysOn: true,
    body: (a) => {
      const lines: string[] = ['# Code Style\n'];
      if (a.languages.some((l) => l.name === 'typescript')) {
        lines.push('- Use TypeScript strict mode');
        lines.push('- Prefer `unknown` over `any`');
        lines.push('- Use explicit return types for exported functions');
      }
      if (a.languages.some((l) => l.name === 'python')) {
        lines.push('- Follow PEP 8 naming conventions');
        lines.push('- Use type hints for function parameters and return values');
      }
      if (a.languages.some((l) => l.name === 'go')) {
        lines.push('- Follow Go conventions (gofmt, effective Go)');
        lines.push('- Handle all errors explicitly');
      }
      if (a.languages.some((l) => l.name === 'rust')) {
        lines.push('- Follow Rust conventions (cargo fmt, clippy)');
        lines.push('- Prefer Result over panic');
      }
      if (lines.length === 1) lines.push('- Follow existing codebase conventions');
      return lines.join('\n');
    },
  },
  {
    id: 'testing',
    title: 'Testing Standards',
    description: 'Testing conventions and patterns for test files',
    alwaysOn: false,
    globs: '**/*.test.{ts,tsx,js,jsx},**/*.spec.{ts,tsx,js,jsx},**/*_test.{go,py},**/test_*.py',
    condition: (a) => a.frameworks.some((f) => f.category === 'test') || a.languages.length > 0,
    body: (a) => {
      const testFw = a.frameworks.find((f) => f.category === 'test');
      const lines = ['# Testing Standards\n'];
      if (testFw) lines.push(`Test framework: **${testFw.name}**\n`);
      lines.push('- Write descriptive test names');
      lines.push('- One assertion per test when possible');
      lines.push('- Mock external dependencies, not internal modules');
      lines.push('- Test behavior, not implementation details');
      return lines.join('\n');
    },
  },
  {
    id: 'api',
    title: 'API Patterns',
    description: 'API endpoint conventions and patterns',
    alwaysOn: false,
    globs: '**/routes/**,**/api/**,**/controllers/**,**/endpoints/**',
    condition: (a) => a.frameworks.some((f) => f.category === 'backend' || f.category === 'fullstack'),
    body: (a) => {
      const fw = a.frameworks.find((f) => f.category === 'backend' || f.category === 'fullstack');
      const lines = ['# API Patterns\n'];
      if (fw) lines.push(`Backend framework: **${fw.name}**\n`);
      lines.push('- Validate all input at the boundary');
      lines.push('- Return consistent error response format');
      lines.push('- Use appropriate HTTP status codes');
      lines.push('- Never expose internal errors to clients');
      return lines.join('\n');
    },
  },
  {
    id: 'components',
    title: 'Component Patterns',
    description: 'UI component conventions and patterns',
    alwaysOn: false,
    globs: '**/components/**,**/pages/**,**/views/**,**/app/**',
    condition: (a) => a.frameworks.some((f) => f.category === 'frontend' || f.category === 'fullstack'),
    body: (a) => {
      const fw = a.frameworks.find((f) => f.category === 'frontend' || f.category === 'fullstack');
      const lines = ['# Component Patterns\n'];
      if (fw) lines.push(`UI framework: **${fw.name}**\n`);
      lines.push('- Keep components focused and single-purpose');
      lines.push('- Extract reusable logic into hooks/composables');
      lines.push('- Use semantic HTML elements');
      lines.push('- Ensure keyboard accessibility');
      return lines.join('\n');
    },
  },
];

export function getActiveRules(analysis: ProjectAnalysis): SharedRule[] {
  return SHARED_RULES.filter((r) => !r.condition || r.condition(analysis));
}

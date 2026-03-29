import type { ProjectAnalysis } from '../types/index.js';

export interface SkillTemplate {
  name: string;
  description: string;
  allowedTools?: string;
  model?: string;
  condition?: (analysis: ProjectAnalysis) => boolean;
  body: (analysis: ProjectAnalysis) => string;
}

function detectTestCommand(analysis: ProjectAnalysis): string {
  const frameworks = analysis.frameworks.map((f) => f.name);
  const pm = analysis.packageManager?.name ?? 'npm';
  if (frameworks.includes('vitest')) return `${pm} run test`;
  if (frameworks.includes('jest')) return `${pm} test`;
  if (frameworks.includes('mocha')) return `${pm} test`;
  if (analysis.languages.some((l) => l.name === 'python')) return 'pytest';
  if (analysis.languages.some((l) => l.name === 'go')) return 'go test ./...';
  if (analysis.languages.some((l) => l.name === 'rust')) return 'cargo test';
  return `${pm} test`;
}

function detectRunCommand(analysis: ProjectAnalysis): string {
  const pm = analysis.packageManager?.name ?? 'npm';
  return `${pm} run`;
}

export const SKILL_TEMPLATES: SkillTemplate[] = [
  // === Universal skills ===
  {
    name: 'run-tests',
    description: 'Run the project test suite and analyze results',
    allowedTools: 'Read, Grep, Glob, Bash',
    body: (analysis) => {
      const cmd = detectTestCommand(analysis);
      return `Run the project test suite using \`${cmd}\`.

If tests fail:
1. Read the failing test file to understand what's being tested
2. Read the implementation being tested
3. Identify the root cause of the failure
4. Suggest a fix (or fix it if $ARGUMENTS includes "fix")

If all tests pass, report the results concisely.`;
    },
  },
  {
    name: 'review-code',
    description: 'Review code for quality, security, and patterns',
    allowedTools: 'Read, Grep, Glob',
    model: 'sonnet',
    body: () => `Review the code specified by $ARGUMENTS for:

1. **Security**: SQL injection, XSS, command injection, hardcoded secrets
2. **Quality**: Error handling, edge cases, resource leaks
3. **Patterns**: Consistency with existing codebase conventions
4. **Performance**: Obvious inefficiencies, N+1 queries, unnecessary allocations

Organize findings by severity: Critical > Warning > Suggestion.
Be specific — reference file paths and line numbers.`,
  },
  {
    name: 'generate-tests',
    description: 'Generate tests for specified code',
    allowedTools: 'Read, Grep, Glob, Edit, Write, Bash',
    body: (analysis) => {
      const cmd = detectTestCommand(analysis);
      return `Generate tests for the code specified by $ARGUMENTS.

1. Read the target code and understand its behavior
2. Identify test cases: happy path, edge cases, error cases
3. Write tests following the project's existing test patterns
4. Run \`${cmd}\` to verify tests pass

Match the project's test style and framework.`;
    },
  },
  {
    name: 'explain-code',
    description: 'Explain code architecture and patterns',
    allowedTools: 'Read, Grep, Glob',
    model: 'sonnet',
    body: () => `Explain the code at $ARGUMENTS.

Cover:
1. **Purpose**: What does this code do and why?
2. **Architecture**: How does it fit into the broader system?
3. **Key patterns**: Design patterns, data flow, state management
4. **Dependencies**: What does it depend on? What depends on it?

Keep explanations clear and concise. Reference related files.`,
  },
  // === Conditional skills ===
  {
    name: 'deploy',
    description: 'Deploy the project to production',
    allowedTools: 'Read, Bash, Glob',
    condition: (a) => a.cloud.some((c) => ['vercel', 'netlify', 'fly'].includes(c.name)),
    body: (analysis) => {
      const cloud = analysis.cloud.find((c) => ['vercel', 'netlify', 'fly'].includes(c.name));
      const tool = cloud?.name ?? 'your hosting provider';
      return `Deploy to ${tool}.

1. Run the build to ensure it succeeds
2. Check for any uncommitted changes
3. Deploy using the ${tool} CLI
4. Verify the deployment is live

If $ARGUMENTS includes "preview", deploy a preview/staging build instead of production.`;
    },
  },
  {
    name: 'db-migrate',
    description: 'Run database migrations',
    allowedTools: 'Read, Bash, Glob, Grep',
    condition: (a) => a.frameworks.some((f) => ['prisma', 'drizzle'].includes(f.name)),
    body: (analysis) => {
      const orm = analysis.frameworks.find((f) => ['prisma', 'drizzle'].includes(f.name));
      if (orm?.name === 'prisma') {
        return `Manage Prisma database migrations.

Commands:
- \`npx prisma migrate dev\` — Create and apply migration
- \`npx prisma migrate deploy\` — Apply pending migrations (production)
- \`npx prisma db push\` — Push schema without migration
- \`npx prisma generate\` — Regenerate client

If $ARGUMENTS specifies an action, run that. Otherwise show migration status.`;
      }
      return `Manage Drizzle database migrations.

Run drizzle-kit commands for schema management.
If $ARGUMENTS specifies an action, run that. Otherwise show migration status.`;
    },
  },
  {
    name: 'lint-fix',
    description: 'Run linter and auto-fix issues',
    allowedTools: 'Read, Bash, Glob',
    condition: (a) => a.languages.some((l) => l.name === 'javascript' || l.name === 'typescript'),
    body: (analysis) => {
      const run = detectRunCommand(analysis);
      return `Run the linter and fix issues.

1. Run \`${run} lint\` (or \`${run} lint:fix\` if available)
2. If errors remain, read the failing files and fix them
3. Re-run to confirm all issues resolved

If $ARGUMENTS specifies a path, lint only that path.`;
    },
  },
  {
    name: 'docker-build',
    description: 'Build and manage Docker containers',
    allowedTools: 'Read, Bash, Glob',
    condition: (a) => a.docker !== null,
    body: () => `Build and manage Docker containers.

Commands based on $ARGUMENTS:
- "build" — \`docker build -t project .\`
- "up" — \`docker compose up -d\`
- "down" — \`docker compose down\`
- "logs" — \`docker compose logs -f\`
- No args — Show running containers and images`,
  },
  {
    name: 'ci-check',
    description: 'Check CI/CD pipeline status and debug failures',
    allowedTools: 'Read, Bash, Grep, Glob',
    condition: (a) => a.ci.length > 0,
    body: (analysis) => {
      const ci = analysis.ci[0];
      if (ci?.name === 'github-actions') {
        return `Check GitHub Actions CI status.

1. Run \`gh run list --limit 5\` to see recent runs
2. If a run failed, run \`gh run view <id> --log-failed\` to get failure logs
3. Analyze the failure and suggest fixes

If $ARGUMENTS includes a run ID, check that specific run.`;
      }
      return `Check CI/CD pipeline status for ${ci?.name ?? 'the project'}.

Read the CI config at ${ci?.configPath ?? '.ci/'} and check for recent issues.`;
    },
  },
];

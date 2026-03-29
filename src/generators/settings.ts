import type { ProjectAnalysis } from '../types/index.js';
import type { Generator } from './generator.js';
import type { GeneratorResult } from './types.js';

interface SettingsJson {
  permissions: {
    allow: string[];
    ask: string[];
    deny: string[];
  };
  env?: Record<string, string>;
}

export const settingsGenerator: Generator = {
  name: 'settings',
  async generate(analysis: ProjectAnalysis): Promise<GeneratorResult> {
    const allow = buildAllowRules(analysis);
    const ask = buildAskRules();
    const deny = buildDenyRules();
    const env = buildEnvVars(analysis);

    const settings: SettingsJson = {
      permissions: { allow, ask, deny },
    };

    if (Object.keys(env).length > 0) {
      settings.env = env;
    }

    const content = JSON.stringify(settings, null, 2);

    return {
      files: [{ path: '.claude/settings.json', content, status: 'new' }],
      summary: `Generated settings.json with ${allow.length} allow, ${ask.length} ask, ${deny.length} deny rules`,
    };
  },
};

function buildAllowRules(analysis: ProjectAnalysis): string[] {
  const rules: string[] = [
    'Read',
    'Glob',
    'Grep',
    'Edit',
    'Write',
    'WebFetch',
    'WebSearch',
    'Bash(ls *)',
    'Bash(cat *)',
    'Bash(mkdir *)',
    'Bash(cp *)',
    'Bash(echo *)',
    'Bash(which *)',
    'Bash(find *)',
    'Bash(git status)',
    'Bash(git diff *)',
    'Bash(git log *)',
    'Bash(git add *)',
    'Bash(git commit *)',
    'Bash(git stash *)',
    'Bash(git branch *)',
    'Bash(git checkout *)',
    'Bash(git merge *)',
  ];

  const langNames = new Set(analysis.languages.map((l) => l.name));
  const pmName = analysis.packageManager?.name;

  // JavaScript/TypeScript
  if (langNames.has('javascript') || langNames.has('typescript')) {
    if (pmName === 'npm' || !pmName) {
      rules.push('Bash(npm run *)', 'Bash(npm install *)', 'Bash(npm test *)');
    }
    if (pmName === 'yarn') {
      rules.push('Bash(yarn *)', 'Bash(yarn run *)', 'Bash(yarn add *)');
    }
    if (pmName === 'pnpm') {
      rules.push('Bash(pnpm *)', 'Bash(pnpm run *)', 'Bash(pnpm add *)');
    }
    if (pmName === 'bun') {
      rules.push('Bash(bun *)', 'Bash(bun run *)', 'Bash(bun add *)');
    }
    rules.push('Bash(npx *)', 'Bash(node *)');
  }

  // Python
  if (langNames.has('python')) {
    rules.push(
      'Bash(python *)',
      'Bash(python3 *)',
      'Bash(pip *)',
      'Bash(pip3 *)',
      'Bash(pytest *)',
      'Bash(uv *)',
    );
  }

  // Go
  if (langNames.has('go')) {
    rules.push('Bash(go *)', 'Bash(golangci-lint *)');
  }

  // Rust
  if (langNames.has('rust')) {
    rules.push('Bash(cargo *)');
  }

  // Java
  if (langNames.has('java')) {
    rules.push('Bash(mvn *)', 'Bash(gradle *)', 'Bash(./gradlew *)');
  }

  // Swift
  if (langNames.has('swift')) {
    rules.push('Bash(swift *)', 'Bash(xcodebuild *)');
  }

  // Docker
  if (analysis.docker) {
    rules.push('Bash(docker *)');
  }

  return rules;
}

function buildAskRules(): string[] {
  return [
    'Bash(git push *)',
    'Bash(git reset *)',
    'Bash(git rebase *)',
    'Bash(docker push *)',
  ];
}

function buildDenyRules(): string[] {
  return [
    'Bash(rm -rf *)',
    'Bash(rm -r /)',
    'Read(.env*)',
    'Edit(.env*)',
    'Read(**/.env*)',
    'Edit(**/.env*)',
  ];
}

function buildEnvVars(analysis: ProjectAnalysis): Record<string, string> {
  const env: Record<string, string> = {};
  const langNames = new Set(analysis.languages.map((l) => l.name));

  if (langNames.has('javascript') || langNames.has('typescript')) {
    env['NODE_ENV'] = 'development';
  }

  return env;
}

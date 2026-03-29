import type { ProjectAnalysis } from '../types/index.js';

export interface HookConfig {
  matcher: string;
  hooks: Array<{
    type: 'command';
    command: string;
    timeout?: number;
    if?: string;
  }>;
}

export interface HookTemplate {
  event: string;
  config: HookConfig;
  scriptName?: string;
  scriptContent?: string;
  condition?: (analysis: ProjectAnalysis) => boolean;
}

export const HOOK_TEMPLATES: HookTemplate[] = [
  // === Universal safety hooks ===
  {
    event: 'PreToolUse',
    config: {
      matcher: 'Bash',
      hooks: [{
        type: 'command',
        command: '.claude/hooks/block-dangerous-git.sh',
        timeout: 5,
        if: 'Bash(git reset --hard *)',
      }],
    },
    scriptName: 'block-dangerous-git.sh',
    scriptContent: `#!/bin/bash
# Block dangerous git operations that could lose work
echo "BLOCKED: This command can cause data loss." >&2
echo "Use 'git stash' first, or run manually if intentional." >&2
exit 2
`,
  },
  {
    event: 'PreToolUse',
    config: {
      matcher: 'Bash',
      hooks: [{
        type: 'command',
        command: '.claude/hooks/block-env-delete.sh',
        timeout: 5,
        if: 'Bash(rm *.env*)',
      }],
    },
    scriptName: 'block-env-delete.sh',
    scriptContent: `#!/bin/bash
# Block deletion of environment files
echo "BLOCKED: Cannot delete .env files." >&2
exit 2
`,
  },
  // === Conditional hooks ===
  {
    event: 'PostToolUse',
    config: {
      matcher: 'Edit|Write',
      hooks: [{
        type: 'command',
        command: '.claude/hooks/auto-format.sh',
        timeout: 10,
      }],
    },
    scriptName: 'auto-format.sh',
    scriptContent: `#!/bin/bash
# Auto-format edited files using prettier
FILE="$CLAUDE_TOOL_INPUT_FILE"
if [ -n "$FILE" ] && command -v npx &> /dev/null; then
  npx prettier --write "$FILE" 2>/dev/null || true
fi
`,
    condition: (a) => {
      const hasPrettier = a.frameworks.some((f) => f.name === 'prettier') ||
        (a.languages.some((l) => l.name === 'javascript' || l.name === 'typescript'));
      return hasPrettier;
    },
  },
];

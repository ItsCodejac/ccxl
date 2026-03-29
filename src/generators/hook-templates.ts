import type { ProjectAnalysis } from '../types/index.js';

export interface HookHandler {
  type: 'command';
  command: string;
  timeout?: number;
  if?: string;
}

export interface HookConfig {
  matcher?: string;
  hooks: HookHandler[];
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
  // === Force config reading hooks (universal) ===
  {
    event: 'SessionStart',
    config: {
      hooks: [{
        type: 'command',
        command: '.claude/hooks/context-loader.sh',
        timeout: 5,
      }],
    },
    scriptName: 'context-loader.sh',
    scriptContent: `#!/bin/bash
# Load project context at session start
MSG=""
if [ -f "CLAUDE.md" ]; then
  MSG="\${MSG}[Project instructions loaded from CLAUDE.md]\\n"
fi
if [ -d ".claude/skills" ]; then
  SKILLS=$(ls .claude/skills/ 2>/dev/null | tr '\\n' ', ' | sed 's/,$//')
  if [ -n "$SKILLS" ]; then
    MSG="\${MSG}Available skills: $SKILLS\\n"
  fi
fi
if [ -d ".claude/agents" ]; then
  AGENTS=$(ls .claude/agents/ 2>/dev/null | sed 's/\\.md$//' | tr '\\n' ', ' | sed 's/,$//')
  if [ -n "$AGENTS" ]; then
    MSG="\${MSG}Available agents: $AGENTS\\n"
  fi
fi
if [ -n "$MSG" ]; then
  printf '{"hookSpecificOutput":{"message":"%s"}}' "$MSG"
fi
`,
  },
  {
    event: 'PreCompact',
    config: {
      hooks: [{
        type: 'command',
        command: '.claude/hooks/reread-context.sh',
        timeout: 5,
      }],
    },
    scriptName: 'reread-context.sh',
    scriptContent: `#!/bin/bash
# Re-inject context before compaction to prevent loss
MSG=""
if [ -f "CLAUDE.md" ]; then
  # Extract key sections (Overview, Standards) to preserve through compaction
  OVERVIEW=$(sed -n '/^## Overview/,/^## /p' CLAUDE.md | head -20)
  if [ -n "$OVERVIEW" ]; then
    MSG="\${MSG}[CLAUDE.md context preserved]\\n$OVERVIEW\\n"
  fi
fi
if [ -d ".claude/skills" ]; then
  SKILLS=$(ls .claude/skills/ 2>/dev/null | tr '\\n' ', ' | sed 's/,$//')
  if [ -n "$SKILLS" ]; then
    MSG="\${MSG}Remember available skills: $SKILLS\\n"
  fi
fi
if [ -n "$MSG" ]; then
  printf '{"hookSpecificOutput":{"message":"%s"}}' "$MSG"
fi
`,
  },
];

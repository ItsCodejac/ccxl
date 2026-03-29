import React, { useState } from 'react';
import { App } from '../App.js';
import { SelectPrompt } from '../components/SelectPrompt.js';
import { style } from '../theme.js';
import type { SelectOption } from '../components/SelectPrompt.js';

const setupOptions: SelectOption[] = [
  { label: 'Full setup', value: 'full', description: 'Scan project and generate all config layers' },
  { label: 'Skills only', value: 'skills', description: 'Generate .claude/skills/ with project-appropriate skills' },
  { label: 'Hooks only', value: 'hooks', description: 'Generate hooks for PreToolUse/PostToolUse events' },
  { label: 'CLAUDE.md only', value: 'claude-md', description: 'Generate deep codebase-aware CLAUDE.md' },
];

interface InitViewProps {
  version: string;
}

export function InitView({ version }: InitViewProps): React.ReactElement {
  const [selection, setSelection] = useState<string | null>(null);

  if (selection) {
    return (
      <App title="init" version={version} statusMessage="Setup complete">
        <></>
      </App>
    );
  }

  return (
    <App title="init" version={version} step={1} totalSteps={4} statusMessage="Choose setup type">
      <SelectPrompt
        message="What would you like to configure?"
        options={setupOptions}
        onSelect={(value) => {
          setSelection(value);
          console.log(style.success('✓') + ` Selected: ${style.bold(value)} — ${style.muted('implementation coming in Phase 2+3')}`);
          process.exit(0);
        }}
      />
    </App>
  );
}

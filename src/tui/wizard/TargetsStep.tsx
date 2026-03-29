import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import type { ProjectAnalysis } from '../../types/index.js';

interface Target {
  value: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

interface TargetsStepProps {
  analysis: ProjectAnalysis;
  initialTargets: Set<string>;
  onNext: (targets: Set<string>) => void;
  onBack: () => void;
}

function getTargets(analysis: ProjectAnalysis): Target[] {
  const hasClaudeMd = analysis.existingConfigs.some((c) => c.tool === 'claude' && c.features.includes('claude-md'));

  return [
    { value: 'claude', label: 'Claude Code', description: 'settings, skills, hooks, agents, MCP', defaultOn: true },
    { value: 'cursor', label: 'Cursor', description: '.cursorrules + .cursor/rules/', defaultOn: true },
    { value: 'copilot', label: 'GitHub Copilot', description: 'copilot-instructions.md + .github/instructions/', defaultOn: true },
    { value: 'windsurf', label: 'Windsurf', description: '.windsurfrules + .windsurf/rules/', defaultOn: true },
    { value: 'claude-md', label: 'CLAUDE.md', description: hasClaudeMd ? 'already exists' : 'project context file', defaultOn: !hasClaudeMd },
  ];
}

export function TargetsStep({ analysis, initialTargets, onNext, onBack }: TargetsStepProps): React.ReactElement {
  const targets = getTargets(analysis);
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (initialTargets.size > 0) return initialTargets;
    return new Set(targets.filter((t) => t.defaultOn).map((t) => t.value));
  });
  const [cursor, setCursor] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setCursor((c) => Math.max(0, c - 1));
    if (key.downArrow) setCursor((c) => Math.min(targets.length - 1, c + 1));
    if (input === ' ') {
      setSelected((prev) => {
        const next = new Set(prev);
        const val = targets[cursor]!.value;
        if (next.has(val)) next.delete(val);
        else next.add(val);
        return next;
      });
    }
    if (key.return) onNext(selected);
    if (key.escape) onBack();
  });

  return (
    <Box flexDirection="column" gap={0}>
      <Text bold>What to generate:</Text>
      <Box flexDirection="column" marginTop={1}>
        {targets.map((t, i) => {
          const isSelected = selected.has(t.value);
          const isCursor = i === cursor;
          return (
            <Box key={t.value} gap={1}>
              <Text color={isCursor ? colors.primary : undefined}>
                {isSelected ? '◉' : '○'}
              </Text>
              <Text bold={isCursor} color={isCursor ? colors.primary : undefined}>
                {t.label}
              </Text>
              <Text color={colors.muted}>{t.description}</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

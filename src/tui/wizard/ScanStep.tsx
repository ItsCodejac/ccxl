import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { colors } from '../theme.js';
import { analyzeProject } from '../../analyzer/index.js';
import type { ProjectAnalysis } from '../../types/index.js';

interface ScanStepProps {
  root: string;
  onComplete: (analysis: ProjectAnalysis) => void;
  onError: (message: string) => void;
}

interface DetectorStatus {
  name: string;
  label: string;
  done: boolean;
  result?: string;
}

export function ScanStep({ root, onComplete, onError }: ScanStepProps): React.ReactElement {
  const [statuses, setStatuses] = useState<DetectorStatus[]>([
    { name: 'languages', label: 'Languages', done: false },
    { name: 'frameworks', label: 'Frameworks', done: false },
    { name: 'infrastructure', label: 'Infrastructure', done: false },
    { name: 'configs', label: 'Existing configs', done: false },
  ]);

  useEffect(() => {
    let cancelled = false;

    async function scan(): Promise<void> {
      try {
        // Simulate progressive updates for visual effect
        const analysis = await analyzeProject(root);

        if (cancelled) return;

        // Update statuses progressively
        const updates = [
          { name: 'languages', result: analysis.languages.map((l) => l.name).join(', ') || 'none detected' },
          { name: 'frameworks', result: analysis.frameworks.filter((f) => f.category !== 'test' && f.category !== 'build').map((f) => f.name).join(', ') || 'none detected' },
          { name: 'infrastructure', result: [
            ...analysis.ci.map((c) => c.name),
            ...analysis.cloud.map((c) => c.name),
            ...analysis.databases.map((d) => d.name),
            ...(analysis.docker ? ['Docker'] : []),
          ].join(', ') || 'none detected' },
          { name: 'configs', result: analysis.existingConfigs.filter((c) => c.exists).map((c) => c.tool).join(', ') || 'none found' },
        ];

        for (let i = 0; i < updates.length; i++) {
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, 150));
          setStatuses((prev) =>
            prev.map((s) =>
              s.name === updates[i]!.name ? { ...s, done: true, result: updates[i]!.result } : s,
            ),
          );
        }

        await new Promise((r) => setTimeout(r, 500));
        if (!cancelled) onComplete(analysis);
      } catch (err) {
        if (!cancelled) onError((err as Error).message);
      }
    }

    scan();
    return () => { cancelled = true; };
  }, [root, onComplete, onError]);

  return (
    <Box flexDirection="column" gap={1}>
      {statuses.map((s) => (
        <Box key={s.name} gap={1}>
          {s.done ? (
            <Text color={colors.success}>✓</Text>
          ) : (
            <Spinner label="" />
          )}
          <Text bold={!s.done}>{s.label}</Text>
          {s.result && <Text color={colors.muted}>{s.result}</Text>}
        </Box>
      ))}
    </Box>
  );
}

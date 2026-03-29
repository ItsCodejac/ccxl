import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import type { GeneratedFile } from '../../generators/types.js';

interface PreviewStepProps {
  files: GeneratedFile[];
  onNext: () => void;
  onBack: () => void;
}

export function PreviewStep({ files, onNext, onBack }: PreviewStepProps): React.ReactElement {
  const [cursor, setCursor] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  useInput((_input, key) => {
    if (key.upArrow) setCursor((c) => Math.max(0, c - 1));
    if (key.downArrow) setCursor((c) => Math.min(files.length - 1, c + 1));
    if (key.return) {
      const file = files[cursor];
      if (file) setExpanded((prev) => prev === file.path ? null : file.path);
    }
    if (key.tab) onNext();
    if (key.escape) onBack();
  });

  const statusIcon = (status: string): string => {
    if (status === 'new') return '+';
    if (status === 'modified') return '~';
    return '=';
  };

  const statusColor = (status: string): string => {
    if (status === 'new') return colors.success;
    if (status === 'modified') return colors.warning;
    return colors.muted;
  };

  // Group files by directory
  const grouped = new Map<string, Array<GeneratedFile & { index: number }>>();
  files.forEach((file, index) => {
    const dir = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '.';
    const existing = grouped.get(dir) ?? [];
    existing.push({ ...file, index });
    grouped.set(dir, existing);
  });

  return (
    <Box flexDirection="column">
      <Text bold>{files.length} files:</Text>
      <Box flexDirection="column" marginTop={1}>
        {[...grouped.entries()].map(([dir, dirFiles]) => (
          <Box key={dir} flexDirection="column">
            <Text color={colors.muted} dimColor>  {dir}/</Text>
            {dirFiles.map((file) => {
              const isCursor = file.index === cursor;
              const isExpanded = expanded === file.path;
              const fileName = file.path.substring(file.path.lastIndexOf('/') + 1);

              return (
                <Box key={file.path} flexDirection="column">
                  <Box marginLeft={2} gap={1}>
                    <Text color={isCursor ? colors.primary : statusColor(file.status)}>
                      {isCursor ? '❯' : ' '} {statusIcon(file.status)}
                    </Text>
                    <Text bold={isCursor} color={isCursor ? colors.primary : undefined}>
                      {fileName}
                    </Text>
                    {file.status !== 'new' && (
                      <Text color={colors.muted}>({file.status})</Text>
                    )}
                  </Box>
                  {isExpanded && (
                    <Box marginLeft={6} flexDirection="column" borderStyle="single" borderColor={colors.border} paddingX={1}>
                      {file.content.split('\n').slice(0, 15).map((line, i) => (
                        <Text key={i} color={colors.muted}>{line}</Text>
                      ))}
                      {file.content.split('\n').length > 15 && (
                        <Text color={colors.muted} dimColor>... ({file.content.split('\n').length - 15} more lines)</Text>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

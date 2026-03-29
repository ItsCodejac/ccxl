import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface PreviewPanelProps {
  filePath: string;
  content: string;
  status: 'new' | 'modified' | 'unchanged';
}

export function PreviewPanel({
  filePath,
  content,
  status,
}: PreviewPanelProps): React.ReactElement {
  const statusIcon = status === 'new' ? '+' : status === 'modified' ? '~' : ' ';
  const statusColor = status === 'new' ? colors.success : status === 'modified' ? colors.warning : colors.muted;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.border} paddingX={1}>
      <Box>
        <Text color={statusColor} bold>{statusIcon} </Text>
        <Text color={colors.secondary} bold>{filePath}</Text>
        <Text color={colors.muted}> ({status})</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={colors.muted}>{content}</Text>
      </Box>
    </Box>
  );
}

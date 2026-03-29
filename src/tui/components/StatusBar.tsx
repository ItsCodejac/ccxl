import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface StatusBarProps {
  step?: number;
  totalSteps?: number;
  message?: string;
}

export function StatusBar({ step, totalSteps, message }: StatusBarProps): React.ReactElement {
  return (
    <Box marginTop={1} borderStyle="single" borderColor={colors.border} paddingX={1}>
      {step !== undefined && totalSteps !== undefined && (
        <Text color={colors.muted}>
          Step {step}/{totalSteps}
        </Text>
      )}
      {step !== undefined && totalSteps !== undefined && message && (
        <Text color={colors.muted}> — </Text>
      )}
      {message && (
        <Text color={colors.muted}>{message}</Text>
      )}
    </Box>
  );
}

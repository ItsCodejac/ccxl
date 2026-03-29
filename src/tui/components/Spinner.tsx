import React from 'react';
import { Box, Text } from 'ink';
import InkSpinner from 'ink-spinner';
import { colors } from '../theme.js';

interface SpinnerProps {
  label: string;
}

export function Spinner({ label }: SpinnerProps): React.ReactElement {
  return (
    <Box>
      <Text color={colors.primary}>
        <InkSpinner type="dots" />
      </Text>
      <Text> {label}</Text>
    </Box>
  );
}

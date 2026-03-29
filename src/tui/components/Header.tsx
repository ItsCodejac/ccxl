import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface HeaderProps {
  command?: string;
  version?: string;
}

export function Header({ command, version }: HeaderProps): React.ReactElement {
  return (
    <Box
      borderStyle="round"
      borderColor={colors.primary}
      paddingX={1}
      marginBottom={1}
    >
      <Text color={colors.primary} bold>
        ccxl
      </Text>
      {version && (
        <Text color={colors.muted}> v{version}</Text>
      )}
      {command && (
        <>
          <Text color={colors.muted}> — </Text>
          <Text color={colors.secondary} bold>{command}</Text>
        </>
      )}
    </Box>
  );
}

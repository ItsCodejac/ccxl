import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';

interface ConfirmPromptProps {
  message: string;
  defaultValue?: boolean;
  onConfirm: (value: boolean) => void;
}

export function ConfirmPrompt({
  message,
  defaultValue = true,
  onConfirm,
}: ConfirmPromptProps): React.ReactElement {
  const [value, setValue] = useState(defaultValue);

  useInput((input, key) => {
    if (input === 'y' || input === 'Y') {
      onConfirm(true);
    } else if (input === 'n' || input === 'N') {
      onConfirm(false);
    } else if (key.return) {
      onConfirm(value);
    } else if (key.leftArrow || key.rightArrow) {
      setValue((prev) => !prev);
    }
  });

  return (
    <Box>
      <Text bold>{message} </Text>
      <Text color={value ? colors.primary : colors.muted} bold={value}>[Yes]</Text>
      <Text> / </Text>
      <Text color={!value ? colors.primary : colors.muted} bold={!value}>[No]</Text>
    </Box>
  );
}

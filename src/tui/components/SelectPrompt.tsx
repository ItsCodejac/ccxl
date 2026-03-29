import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

interface SelectPromptProps {
  message: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
}

export function SelectPrompt({
  message,
  options,
  onSelect,
  multiSelect = false,
}: SelectPromptProps): React.ReactElement {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (key.downArrow) {
      setCursor((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      if (multiSelect) {
        onSelect([...selected].join(','));
      } else {
        onSelect(options[cursor]!.value);
      }
    } else if (input === ' ' && multiSelect) {
      setSelected((prev) => {
        const next = new Set(prev);
        const value = options[cursor]!.value;
        if (next.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        return next;
      });
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold>{message}</Text>
      <Box flexDirection="column" marginTop={1}>
        {options.map((option, i) => {
          const isCursor = i === cursor;
          const isSelected = selected.has(option.value);
          const prefix = multiSelect
            ? isSelected ? '◉ ' : '○ '
            : isCursor ? '❯ ' : '  ';

          return (
            <Box key={option.value} flexDirection="column">
              <Text
                color={isCursor ? colors.primary : undefined}
                bold={isCursor}
              >
                {prefix}{option.label}
              </Text>
              {option.description && isCursor && (
                <Text color={colors.muted}>    {option.description}</Text>
              )}
            </Box>
          );
        })}
      </Box>
      <Text color={colors.muted} dimColor>
        {multiSelect ? '\n↑↓ navigate · space select · enter confirm' : '\n↑↓ navigate · enter select'}
      </Text>
    </Box>
  );
}

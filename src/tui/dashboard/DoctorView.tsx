import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { colors } from '../theme.js';
import { runDiagnostics } from '../../maintenance/diagnostics.js';
import type { DiagnosticResult } from '../../maintenance/diagnostics.js';

interface DoctorViewProps {
  root: string;
  version: string;
  onBack: () => void;
}

export function DoctorView({ root, version, onBack }: DoctorViewProps): React.ReactElement {
  const [results, setResults] = useState<DiagnosticResult[] | null>(null);

  useEffect(() => {
    runDiagnostics(root).then(setResults);
  }, [root]);

  useInput((_input, key) => {
    if (key.escape || _input === 'q') onBack();
    if (key.return && results) onBack();
  });

  const statusIcon = { pass: '✓', warn: '!', fail: '✗' };
  const statusColor = { pass: colors.success, warn: colors.warning, fail: colors.error };

  return (
    <Box flexDirection="column">
      <Header command="doctor" version={version} />
      <Box flexDirection="column" paddingX={1}>
        {!results ? (
          <Text>Running diagnostics...</Text>
        ) : (
          <>
            {results.map((r, i) => (
              <Box key={i} gap={1}>
                <Text color={statusColor[r.status]}>{statusIcon[r.status]}</Text>
                <Text bold>{r.name}</Text>
                <Text color={colors.muted}>— {r.message}</Text>
              </Box>
            ))}
            <Box marginTop={1}>
              <Text color={colors.muted}>
                {results.filter((r) => r.status === 'pass').length} passed, {' '}
                {results.filter((r) => r.status === 'warn').length} warnings, {' '}
                {results.filter((r) => r.status === 'fail').length} failures
              </Text>
            </Box>
          </>
        )}
      </Box>
      <Box paddingX={1} marginTop={1} borderStyle="single" borderColor={colors.border}>
        <Text color={colors.muted}>esc back to menu · q quit</Text>
      </Box>
    </Box>
  );
}

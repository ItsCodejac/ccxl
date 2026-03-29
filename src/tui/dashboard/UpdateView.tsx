import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { colors } from '../theme.js';
import { detectDrift } from '../../maintenance/drift.js';
import type { DriftReport } from '../../maintenance/drift.js';

interface UpdateViewProps {
  root: string;
  version: string;
  onBack: () => void;
}

export function UpdateView({ root, version, onBack }: UpdateViewProps): React.ReactElement {
  const [report, setReport] = useState<DriftReport | null>(null);

  useEffect(() => {
    detectDrift(root).then(setReport);
  }, [root]);

  useInput((_input, key) => {
    if (key.escape || _input === 'q') onBack();
    if (key.return && report) onBack();
  });

  return (
    <Box flexDirection="column">
      <Header command="update" version={version} />
      <Box flexDirection="column" paddingX={1}>
        {!report ? (
          <Text>Checking for drift...</Text>
        ) : (
          <>
            <Text color={colors.success}>{report.current.length} current</Text>
            <Text color={colors.warning}>{report.stale.length} stale</Text>
            <Text color={colors.primary}>{report.missing.length} new suggestions</Text>

            {report.stale.length === 0 && report.missing.length === 0 ? (
              <Box marginTop={1}>
                <Text color={colors.success}>✓ All configs are up to date.</Text>
              </Box>
            ) : (
              <Box marginTop={1} flexDirection="column">
                {report.stale.map((f) => (
                  <Text key={f.path} color={colors.warning}>  ~ {f.path}</Text>
                ))}
                {report.missing.map((f) => (
                  <Text key={f.path} color={colors.success}>  + {f.path}</Text>
                ))}
                <Box marginTop={1}>
                  <Text color={colors.muted}>Run `ccxl update --apply` to apply changes.</Text>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
      <Box paddingX={1} marginTop={1} borderStyle="single" borderColor={colors.border}>
        <Text color={colors.muted}>esc back to menu · q quit</Text>
      </Box>
    </Box>
  );
}

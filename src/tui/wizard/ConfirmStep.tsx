import React, { useState, useEffect } from 'react';
import path from 'node:path';
import { Box, Text, useInput } from 'ink';
import fs from 'fs-extra';
import { colors } from '../theme.js';
import type { GeneratedFile } from '../../generators/types.js';

interface ConfirmStepProps {
  files: GeneratedFile[];
  root: string;
  onDone: () => void;
  onBack: () => void;
}

export function ConfirmStep({ files, root, onDone, onBack }: ConfirmStepProps): React.ReactElement {
  const [writing, setWriting] = useState(false);
  const [written, setWritten] = useState(0);
  const [done, setDone] = useState(false);

  const toWrite = files.filter((f) => f.status !== 'unchanged');
  const newCount = files.filter((f) => f.status === 'new').length;
  const mergeCount = files.filter((f) => f.status === 'modified').length;
  const skipCount = files.filter((f) => f.status === 'unchanged').length;

  useInput((_input, key) => {
    if (done) {
      if (key.return) onDone();
      return;
    }
    if (writing) return;
    if (_input === 'y' || _input === 'Y' || key.return) {
      setWriting(true);
    }
    if (_input === 'n' || _input === 'N') {
      onBack();
    }
    if (key.escape) onBack();
  });

  useEffect(() => {
    if (!writing) return;
    let cancelled = false;

    async function write(): Promise<void> {
      for (let i = 0; i < toWrite.length; i++) {
        if (cancelled) return;
        const file = toWrite[i]!;
        const fullPath = path.join(root, file.path);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, file.content);
        if (file.path.endsWith('.sh')) {
          await fs.chmod(fullPath, 0o755);
        }
        setWritten(i + 1);
      }
      if (!cancelled) setDone(true);
    }

    write();
    return () => { cancelled = true; };
  }, [writing, toWrite, root]);

  if (done) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color={colors.success} bold>✓ {toWrite.length} files written</Text>
        {skipCount > 0 && <Text color={colors.muted}>{skipCount} existing files preserved</Text>}
        <Box marginTop={1} flexDirection="column">
          <Text>Run <Text color={colors.primary} bold>claude</Text> to start using your new config.</Text>
          <Text color={colors.muted}>Run <Text color={colors.muted}>ccxl doctor</Text> to verify setup.</Text>
        </Box>
        <Text color={colors.muted} dimColor>{'\n'}Press enter to exit</Text>
      </Box>
    );
  }

  if (writing) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text>Writing files... {written}/{toWrite.length}</Text>
        {toWrite.slice(0, written).map((f) => (
          <Text key={f.path} color={colors.success}>  ✓ {f.path}</Text>
        ))}
        {written < toWrite.length && (
          <Text color={colors.primary}>  ● {toWrite[written]!.path}</Text>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Summary:</Text>
      <Box flexDirection="column" marginLeft={2}>
        <Text color={colors.success}>{newCount} new files</Text>
        {mergeCount > 0 && <Text color={colors.warning}>{mergeCount} merged with existing</Text>}
        {skipCount > 0 && <Text color={colors.muted}>{skipCount} skipped (already exist)</Text>}
      </Box>
      <Box marginTop={1}>
        <Text bold>Write {toWrite.length} files? </Text>
        <Text color={colors.primary}>(Y/n)</Text>
      </Box>
    </Box>
  );
}

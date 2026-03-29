import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

export interface FileEntry {
  path: string;
  status: 'new' | 'modified' | 'removed';
}

interface FileListProps {
  files: FileEntry[];
  title?: string;
}

export function FileList({ files, title }: FileListProps): React.ReactElement {
  const statusConfig = {
    new: { icon: '+', color: colors.success },
    modified: { icon: '~', color: colors.warning },
    removed: { icon: '-', color: colors.error },
  } as const;

  const grouped = new Map<string, FileEntry[]>();
  for (const file of files) {
    const dir = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '.';
    const existing = grouped.get(dir) ?? [];
    existing.push(file);
    grouped.set(dir, existing);
  }

  return (
    <Box flexDirection="column">
      {title && (
        <Text bold>{title}</Text>
      )}
      {[...grouped.entries()].map(([dir, dirFiles]) => (
        <Box key={dir} flexDirection="column" marginLeft={1}>
          <Text color={colors.muted} dimColor>{dir}/</Text>
          {dirFiles.map((file) => {
            const { icon, color } = statusConfig[file.status];
            const fileName = file.path.includes('/')
              ? file.path.substring(file.path.lastIndexOf('/') + 1)
              : file.path;
            return (
              <Box key={file.path} marginLeft={2}>
                <Text color={color}>{icon} </Text>
                <Text>{fileName}</Text>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}

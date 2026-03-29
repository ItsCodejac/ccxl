import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Header } from '../components/Header.js';
import { colors } from '../theme.js';

interface MenuItem {
  value: string;
  label: string;
  description: string;
  hint?: string;
}

interface DashboardProps {
  version: string;
  projectName: string;
  configStatus: { claude: boolean; cursor: boolean; copilot: boolean; windsurf: boolean };
  packageCount: number;
}

const MENU_ITEMS: MenuItem[] = [
  { value: 'init', label: 'Init', description: 'Scan & generate configs' },
  { value: 'generate', label: 'Generate', description: 'Generate specific layers' },
  { value: 'doctor', label: 'Doctor', description: 'Run diagnostics' },
  { value: 'update', label: 'Update', description: 'Check for drift' },
  { value: 'registry', label: 'Registry', description: 'Browse & install packages' },
  { value: 'config', label: 'Config', description: 'Manage base configs' },
];

export function Dashboard({ version, projectName, configStatus, packageCount }: DashboardProps): React.ReactElement {
  const [cursor, setCursor] = useState(0);
  const app = useApp();

  useInput((input, key) => {
    if (key.upArrow) setCursor((c) => Math.max(0, c - 1));
    if (key.downArrow) setCursor((c) => Math.min(MENU_ITEMS.length - 1, c + 1));
    if (key.return) {
      // Exit and run the selected command
      const cmd = MENU_ITEMS[cursor]!.value;
      app.exit();
      console.log(`\nRun: ccxl ${cmd}`);
    }
    if (input === 'q') app.exit();
  });

  return (
    <Box flexDirection="column">
      <Header version={version} />

      <Box flexDirection="column" paddingX={1} gap={0}>
        {MENU_ITEMS.map((item, i) => {
          const isCursor = i === cursor;
          return (
            <Box key={item.value} gap={1}>
              <Text color={isCursor ? colors.primary : colors.muted}>
                {isCursor ? '❯' : ' '}
              </Text>
              <Box width={12}>
                <Text bold={isCursor} color={isCursor ? colors.primary : undefined}>
                  {item.label}
                </Text>
              </Box>
              <Text color={colors.muted}>{item.description}</Text>
            </Box>
          );
        })}
      </Box>

      <Box flexDirection="column" paddingX={1} marginTop={1} borderStyle="single" borderColor={colors.border} paddingY={0}>
        <Text>Project: <Text bold>{projectName}</Text></Text>
        <Box gap={2}>
          <Text color={colors.muted}>Configs:</Text>
          <Text color={configStatus.claude ? colors.success : colors.muted}>
            {configStatus.claude ? '✓' : '✗'} Claude
          </Text>
          <Text color={configStatus.cursor ? colors.success : colors.muted}>
            {configStatus.cursor ? '✓' : '✗'} Cursor
          </Text>
          <Text color={configStatus.copilot ? colors.success : colors.muted}>
            {configStatus.copilot ? '✓' : '✗'} Copilot
          </Text>
          <Text color={configStatus.windsurf ? colors.success : colors.muted}>
            {configStatus.windsurf ? '✓' : '✗'} Windsurf
          </Text>
        </Box>
        <Text color={colors.muted}>Packages: {packageCount} installed</Text>
      </Box>

      <Box paddingX={1} marginTop={1}>
        <Text color={colors.muted}>↑↓ navigate · enter select · q quit</Text>
      </Box>
    </Box>
  );
}

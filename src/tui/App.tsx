import React from 'react';
import { Box } from 'ink';
import { Header } from './components/Header.js';
import { StatusBar } from './components/StatusBar.js';

interface AppProps {
  title: string;
  version?: string;
  step?: number;
  totalSteps?: number;
  statusMessage?: string;
  children: React.ReactNode;
}

export function App({
  title,
  version,
  step,
  totalSteps,
  statusMessage,
  children,
}: AppProps): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Header command={title} version={version} />
      <Box flexDirection="column" paddingX={1}>
        {children}
      </Box>
      {(step !== undefined || statusMessage) && (
        <StatusBar step={step} totalSteps={totalSteps} message={statusMessage} />
      )}
    </Box>
  );
}

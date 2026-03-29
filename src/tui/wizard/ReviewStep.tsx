import React from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import type { ProjectAnalysis } from '../../types/index.js';

interface ReviewStepProps {
  analysis: ProjectAnalysis;
  onNext: () => void;
  onBack: () => void;
}

function Row({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <Box gap={1}>
      <Box width={14}>
        <Text color={colors.muted}>{label}</Text>
      </Box>
      <Text>{value}</Text>
    </Box>
  );
}

export function ReviewStep({ analysis, onNext, onBack }: ReviewStepProps): React.ReactElement {
  useInput((_input, key) => {
    if (key.return) onNext();
    if (key.escape) onBack();
  });

  const langs = analysis.languages.map((l) => l.name).join(', ');
  const frameworks = analysis.frameworks
    .filter((f) => f.category !== 'test' && f.category !== 'build')
    .map((f) => f.name)
    .join(', ');
  const testFw = analysis.frameworks.find((f) => f.category === 'test');
  const buildTool = analysis.frameworks.find((f) => f.category === 'build');
  const ci = analysis.ci.map((c) => c.name).join(', ');
  const cloud = analysis.cloud.map((c) => c.name).join(', ');
  const dbs = analysis.databases.map((d) => `${d.name}`).join(', ');
  const configs = analysis.existingConfigs
    .map((c) => `${c.exists ? '✓' : '✗'} ${c.tool}`)
    .join('  ');

  return (
    <Box flexDirection="column" gap={0}>
      {langs && <Row label="Languages" value={langs} />}
      {frameworks && <Row label="Frameworks" value={frameworks} />}
      {analysis.packageManager && (
        <Row label="Package Mgr" value={`${analysis.packageManager.name} (${analysis.packageManager.lockfile})`} />
      )}
      {testFw && <Row label="Testing" value={testFw.name} />}
      {buildTool && <Row label="Build" value={buildTool.name} />}
      {analysis.monorepo && (
        <Row label="Monorepo" value={`${analysis.monorepo.tool} (${analysis.monorepo.workspaces.join(', ')})`} />
      )}
      {ci && <Row label="CI/CD" value={ci} />}
      {cloud && <Row label="Cloud" value={cloud} />}
      {dbs && <Row label="Databases" value={dbs} />}
      {analysis.docker && (
        <Row label="Docker" value={[
          analysis.docker.hasDockerfile ? 'Dockerfile' : '',
          analysis.docker.hasCompose ? 'Compose' : '',
        ].filter(Boolean).join(', ')} />
      )}
      <Row label="AI Configs" value={configs} />
    </Box>
  );
}

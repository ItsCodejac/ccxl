import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import type { ProjectAnalysis } from '../../types/index.js';

interface AnalysisViewProps {
  analysis: ProjectAnalysis;
}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={colors.secondary} bold>{title}</Text>
      <Box flexDirection="column" marginLeft={2}>
        {children}
      </Box>
    </Box>
  );
}

function EmptyLine({ label }: { label: string }): React.ReactElement {
  return <Text color={colors.muted}>No {label} detected</Text>;
}

export function AnalysisView({ analysis }: AnalysisViewProps): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>Project: {analysis.name}</Text>
      <Text color={colors.muted}>{analysis.root}</Text>
      <Box marginTop={1} flexDirection="column">

        <Section title="Languages">
          {analysis.languages.length === 0 ? (
            <EmptyLine label="languages" />
          ) : (
            analysis.languages.map((l) => (
              <Text key={l.name}>
                <Text color={colors.success}>  {l.name}</Text>
                <Text color={colors.muted}> ({l.configFiles.join(', ')})</Text>
              </Text>
            ))
          )}
        </Section>

        <Section title="Frameworks">
          {analysis.frameworks.length === 0 ? (
            <EmptyLine label="frameworks" />
          ) : (
            analysis.frameworks.map((f) => (
              <Text key={f.name}>
                <Text color={colors.success}>  {f.name}</Text>
                <Text color={colors.muted}> [{f.category}]</Text>
                {f.version && <Text color={colors.muted}> {f.version}</Text>}
              </Text>
            ))
          )}
        </Section>

        <Section title="Package Manager">
          {analysis.packageManager ? (
            <Text color={colors.success}>  {analysis.packageManager.name} <Text color={colors.muted}>({analysis.packageManager.lockfile})</Text></Text>
          ) : (
            <EmptyLine label="package manager" />
          )}
        </Section>

        {analysis.monorepo && (
          <Section title="Monorepo">
            <Text color={colors.success}>  {analysis.monorepo.tool} <Text color={colors.muted}>({analysis.monorepo.workspaces.join(', ')})</Text></Text>
          </Section>
        )}

        <Section title="CI/CD">
          {analysis.ci.length === 0 ? (
            <EmptyLine label="CI/CD" />
          ) : (
            analysis.ci.map((c) => (
              <Text key={c.name} color={colors.success}>  {c.name}</Text>
            ))
          )}
        </Section>

        <Section title="Cloud">
          {analysis.cloud.length === 0 ? (
            <EmptyLine label="cloud providers" />
          ) : (
            analysis.cloud.map((c) => (
              <Text key={c.name}>
                <Text color={colors.success}>  {c.name}</Text>
                {c.services.length > 0 && <Text color={colors.muted}> ({c.services.join(', ')})</Text>}
              </Text>
            ))
          )}
        </Section>

        <Section title="Databases">
          {analysis.databases.length === 0 ? (
            <EmptyLine label="databases" />
          ) : (
            analysis.databases.map((d) => (
              <Text key={d.name}>
                <Text color={colors.success}>  {d.name}</Text>
                <Text color={colors.muted}> [{d.type}]</Text>
              </Text>
            ))
          )}
        </Section>

        {analysis.docker && (
          <Section title="Docker">
            {analysis.docker.hasDockerfile && <Text color={colors.success}>  Dockerfile</Text>}
            {analysis.docker.hasCompose && <Text color={colors.success}>  Docker Compose</Text>}
          </Section>
        )}

        <Section title="AI Tool Configs">
          {analysis.existingConfigs.map((c) => (
            <Text key={c.tool}>
              <Text color={c.exists ? colors.success : colors.muted}>
                {c.exists ? '  ✓' : '  ✗'} {c.tool}
              </Text>
              {c.exists && c.features.length > 0 && (
                <Text color={colors.muted}> ({c.features.join(', ')})</Text>
              )}
            </Text>
          ))}
        </Section>
      </Box>
    </Box>
  );
}

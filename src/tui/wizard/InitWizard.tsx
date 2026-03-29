import React, { useReducer, useCallback } from 'react';
import { Box, Text, useApp } from 'ink';
import { Header } from '../components/Header.js';
import { colors } from '../theme.js';
import { wizardReducer, initialWizardState } from './state.js';
import { ScanStep } from './ScanStep.js';
import { ReviewStep } from './ReviewStep.js';
import { TargetsStep } from './TargetsStep.js';
import { PreviewStep } from './PreviewStep.js';
import { ConfirmStep } from './ConfirmStep.js';
import { runPipeline } from '../../generators/pipeline.js';
import type { ProjectAnalysis } from '../../types/index.js';
import type { WizardStep } from './state.js';

interface InitWizardProps {
  version: string;
  root: string;
}

const STEP_LABELS: Record<WizardStep, string> = {
  scan: 'Scan',
  review: 'Review',
  targets: 'Targets',
  preview: 'Preview',
  confirm: 'Write',
  writing: 'Writing',
  done: 'Done',
};

const STEP_NUMBERS: Partial<Record<WizardStep, number>> = {
  scan: 1,
  review: 2,
  targets: 3,
  preview: 4,
  confirm: 5,
};

const STEP_HINTS: Record<WizardStep, string> = {
  scan: 'Scanning project...',
  review: 'enter continue · esc back · q quit',
  targets: '↑↓ navigate · space toggle · enter continue · esc back',
  preview: '↑↓ scroll · enter expand · tab confirm · esc back',
  confirm: 'y write · n cancel · esc back',
  writing: 'Writing files...',
  done: 'enter exit',
};

export function InitWizard({ version, root }: InitWizardProps): React.ReactElement {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);
  const app = useApp();

  const handleScanComplete = useCallback((analysis: ProjectAnalysis) => {
    dispatch({ type: 'SET_ANALYSIS', analysis });
    dispatch({ type: 'NEXT' });
  }, []);

  const handleScanError = useCallback((message: string) => {
    dispatch({ type: 'ERROR', message });
  }, []);

  const handleTargetsNext = useCallback(async (targets: Set<string>) => {
    dispatch({ type: 'SET_TARGETS', targets });
    if (!state.analysis) return;

    // Generate files based on selected targets
    const files = await runPipeline(state.analysis, root, { merge: true });
    // TODO: filter files by selected targets
    dispatch({ type: 'SET_FILES', files });
    dispatch({ type: 'NEXT' });
  }, [state.analysis, root]);

  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const back = useCallback(() => dispatch({ type: 'BACK' }), []);
  const done = useCallback(() => app.exit(), [app]);

  const stepNum = STEP_NUMBERS[state.step];
  const stepLabel = STEP_LABELS[state.step];

  return (
    <Box flexDirection="column">
      <Header
        command={`init`}
        version={version}
      />
      {stepNum && (
        <Box paddingX={1} marginBottom={1}>
          <Text color={colors.muted}>Step {stepNum}/5 · </Text>
          <Text color={colors.secondary} bold>{stepLabel}</Text>
        </Box>
      )}

      <Box flexDirection="column" paddingX={1} minHeight={8}>
        {state.error && (
          <Text color={colors.error}>Error: {state.error}</Text>
        )}

        {state.step === 'scan' && (
          <ScanStep root={root} onComplete={handleScanComplete} onError={handleScanError} />
        )}

        {state.step === 'review' && state.analysis && (
          <ReviewStep analysis={state.analysis} onNext={next} onBack={back} />
        )}

        {state.step === 'targets' && state.analysis && (
          <TargetsStep
            analysis={state.analysis}
            initialTargets={state.selectedTargets}
            onNext={handleTargetsNext}
            onBack={back}
          />
        )}

        {state.step === 'preview' && (
          <PreviewStep files={state.generatedFiles} onNext={next} onBack={back} />
        )}

        {(state.step === 'confirm' || state.step === 'writing' || state.step === 'done') && (
          <ConfirmStep
            files={state.generatedFiles}
            root={root}
            onDone={done}
            onBack={back}
          />
        )}
      </Box>

      <Box borderStyle="single" borderColor={colors.border} paddingX={1} marginTop={1}>
        <Text color={colors.muted}>{STEP_HINTS[state.step]}</Text>
      </Box>
    </Box>
  );
}

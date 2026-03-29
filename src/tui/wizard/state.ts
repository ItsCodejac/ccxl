import type { ProjectAnalysis } from '../../types/index.js';
import type { GeneratedFile } from '../../generators/types.js';

export type WizardStep = 'scan' | 'review' | 'targets' | 'preview' | 'confirm' | 'writing' | 'done';

export interface WizardState {
  step: WizardStep;
  analysis: ProjectAnalysis | null;
  selectedTargets: Set<string>;
  generatedFiles: GeneratedFile[];
  expandedFile: string | null;
  scrollIndex: number;
  error: string | null;
}

export type WizardAction =
  | { type: 'SET_ANALYSIS'; analysis: ProjectAnalysis }
  | { type: 'SET_TARGETS'; targets: Set<string> }
  | { type: 'SET_FILES'; files: GeneratedFile[] }
  | { type: 'TOGGLE_EXPAND'; path: string }
  | { type: 'SCROLL'; index: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SET_STEP'; step: WizardStep }
  | { type: 'ERROR'; message: string };

const STEP_ORDER: WizardStep[] = ['scan', 'review', 'targets', 'preview', 'confirm', 'writing', 'done'];

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.analysis };
    case 'SET_TARGETS':
      return { ...state, selectedTargets: action.targets };
    case 'SET_FILES':
      return { ...state, generatedFiles: action.files };
    case 'TOGGLE_EXPAND':
      return {
        ...state,
        expandedFile: state.expandedFile === action.path ? null : action.path,
      };
    case 'SCROLL':
      return { ...state, scrollIndex: action.index };
    case 'NEXT': {
      const idx = STEP_ORDER.indexOf(state.step);
      if (idx < STEP_ORDER.length - 1) {
        return { ...state, step: STEP_ORDER[idx + 1]!, error: null };
      }
      return state;
    }
    case 'BACK': {
      const idx = STEP_ORDER.indexOf(state.step);
      if (idx > 0) {
        return { ...state, step: STEP_ORDER[idx - 1]!, error: null };
      }
      return state;
    }
    case 'SET_STEP':
      return { ...state, step: action.step, error: null };
    case 'ERROR':
      return { ...state, error: action.message };
  }
}

export const initialWizardState: WizardState = {
  step: 'scan',
  analysis: null,
  selectedTargets: new Set(['claude', 'cursor', 'copilot', 'windsurf', 'claude-md']),
  generatedFiles: [],
  expandedFile: null,
  scrollIndex: 0,
  error: null,
};

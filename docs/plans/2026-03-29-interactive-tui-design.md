# Interactive TUI Design

## Overview

ccxl's interactive TUI adapts based on project state, providing three distinct modes from a single entry point (`ccxl` or `ccxl init`).

## Dependencies

- **`@inkjs/ui`** — First-party Ink component library (Select, MultiSelect, ConfirmInput, Spinner, StatusMessage, ProgressBar). Replaces hand-rolled SelectPrompt/ConfirmPrompt.
- **`fullscreen-ink`** — Fullscreen terminal app with responsive resizing and alternate screen buffer. Used for dashboard mode.
- **`ink`** (existing) — React renderer for terminal.

Keep custom: Header, StatusBar, App shell, theme, FileList, PreviewPanel.

## Three Modes

### Mode Detection

```typescript
function detectMode(root: string): 'wizard' | 'update' | 'dashboard' {
  const hasClaudeDir = fs.existsSync(path.join(root, '.claude'));
  const hasCommand = process.argv[2] === 'init';

  if (!hasClaudeDir && hasCommand) return 'wizard';    // First run
  if (hasClaudeDir && hasCommand) return 'update';      // Re-run init
  if (!hasCommand) return 'dashboard';                   // ccxl with no args
}
```

### 1. Wizard Mode (first run)

Five-step guided setup with back navigation.

**State Machine:**

```
SCAN → REVIEW → TARGETS → PREVIEW → CONFIRM → DONE
 ↑       ↑        ↑         ↑
 └───────┴────────┴─────────┘  (Esc goes back, state preserved)
```

**Step 1 — Scan** (automatic)

```
┌─ ccxl v3.0.2 ─ init ─────────────── Step 1/5 · Scan ──┐
│                                                          │
│  ✓ Languages     TypeScript, JavaScript                  │
│  ✓ Frameworks    Next.js, React, Prisma                  │
│  ● Infrastructure...                                     │
│  ○ Existing configs                                      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Scanning...                                             │
└──────────────────────────────────────────────────────────┘
```

- Detectors run in parallel, each line updates independently
- Spinner → checkmark as each completes
- Auto-advances to Step 2 after 1s pause

**Step 2 — Review Analysis** (read-only, confirm/back)

```
┌─ ccxl v3.0.2 ─ init ──────────── Step 2/5 · Review ───┐
│                                                          │
│  Languages     TypeScript, JavaScript                    │
│  Frameworks    Next.js, React, Prisma                    │
│  Package Mgr   npm (package-lock.json)                   │
│  CI/CD         GitHub Actions                            │
│  Cloud         Vercel                                    │
│  Databases     PostgreSQL                                │
│  Docker        Dockerfile, Compose                       │
│  AI Configs    ✓ Claude Code  ✗ Cursor  ✗ Copilot       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  enter continue · esc back · q quit                      │
└──────────────────────────────────────────────────────────┘
```

**Step 3 — Choose Targets** (MultiSelect from @inkjs/ui)

```
┌─ ccxl v3.0.2 ─ init ─────────── Step 3/5 · Targets ───┐
│                                                          │
│  What to generate:                                       │
│                                                          │
│  ◉ Claude Code   settings, skills, hooks, agents, MCP   │
│  ◉ Cursor        .cursorrules + .cursor/rules/           │
│  ◉ GitHub Copilot copilot-instructions.md                │
│  ◉ Windsurf      .windsurfrules + .windsurf/rules/       │
│  ○ CLAUDE.md     already exists — uncheck to skip        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  ↑↓ navigate · space toggle · enter continue · esc back  │
└──────────────────────────────────────────────────────────┘
```

- All checked by default
- Items with existing files unchecked with explanation
- Uses `@inkjs/ui` MultiSelect

**Step 4 — Preview Files** (scrollable list with inline expand)

```
┌─ ccxl v3.0.2 ─ init ─────────── Step 4/5 · Preview ───┐
│                                                          │
│  24 files to generate:                                   │
│                                                          │
│  .claude/                                                │
│    + settings.json                                       │
│  ▼ + skills/run-tests/SKILL.md                          │
│  │ ---                                                   │
│  │ name: run-tests                                       │
│  │ description: Run the project test suite               │
│  │ ---                                                   │
│  │ Run the test suite using `npm run test`...            │
│    + skills/review-code/SKILL.md                         │
│    ~ hooks/context-loader.sh (merge)                     │
│  .cursor/                                                │
│    + rules/general.mdc                                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  ↑↓ scroll · enter expand/collapse · tab confirm · esc ← │
└──────────────────────────────────────────────────────────┘
```

- Grouped by directory
- Status icons: `+` new, `~` merge, `=` skip
- Enter expands/collapses inline preview of file content
- Tab shortcut to skip to Step 5
- Scrollable via arrow keys (manual windowing — slice array based on viewport)

**Step 5 — Confirm & Write** (ConfirmInput from @inkjs/ui)

```
┌─ ccxl v3.0.2 ─ init ──────────── Step 5/5 · Write ────┐
│                                                          │
│  Summary:                                                │
│    20 new files                                          │
│    3 merged with existing                                │
│    1 skipped (already exists)                            │
│                                                          │
│  Write 23 files? (Y/n)                                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  y confirm · n cancel · esc back to preview              │
└──────────────────────────────────────────────────────────┘
```

On confirm: progress with file-by-file checkmarks, then:

```
│  ✓ 23 files written                                      │
│                                                          │
│  Run `claude` to start using your new config.            │
│  Run `ccxl doctor` to verify everything is set up.       │
```

### 2. Update Mode (re-run, configs exist)

Not fullscreen — simple sequential output like current `ccxl update`:

```
ccxl v3.0.2

Scanning for changes...

3 configs are stale, 2 new suggestions:

  ~ .claude/settings.json — permissions changed
  ~ .claude/skills/run-tests/SKILL.md — test framework changed
  + .claude/skills/db-migrate/SKILL.md — Prisma detected
  = CLAUDE.md — unchanged
  = .cursorrules — unchanged

Apply changes? (Y/n)
```

Uses `@inkjs/ui` ConfirmInput. On confirm, writes files with progress. On decline, exits cleanly.

### 3. Dashboard Mode (ccxl with no args)

Fullscreen via `fullscreen-ink`. Main menu with subscreen navigation.

```
┌─ ccxl v3.0.2 ──────────────────────────────────────────┐
│                                                          │
│  ❯ Init          Scan & generate configs                 │
│    Generate      Generate specific layers                │
│    Doctor        Run diagnostics (4 pass, 1 warn)        │
│    Update        Check for drift                         │
│    Registry      Browse & install packages               │
│    Config        Manage base configs                     │
│                                                          │
│  Project: ccxl                                           │
│  Configs: Claude ✓  Cursor ✗  Copilot ✗  Windsurf ✗    │
│  Packages: 0 installed                                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  ↑↓ navigate · enter select · q quit                     │
└──────────────────────────────────────────────────────────┘
```

- Uses `@inkjs/ui` Select for menu
- Bottom section shows project status at a glance
- Enter opens the selected command's subscreen
- Esc returns to menu from any subscreen
- Doctor/Update show inline results without leaving the dashboard

## Keyboard Model

```
Universal:
  Ctrl+C      quit immediately
  q           quit (non-input screens)

Wizard:
  Enter       proceed / confirm / expand preview
  Esc         go back one step (preserves all state)
  Tab         skip ahead to confirm (power user)
  ↑↓          navigate lists
  Space       toggle selection (multiselect)

Dashboard:
  ↑↓          navigate menu
  Enter       open command
  Esc         back to menu
  q           quit
```

## State Management

```typescript
interface WizardState {
  step: 'scan' | 'review' | 'targets' | 'preview' | 'confirm' | 'done';
  analysis: ProjectAnalysis | null;
  selectedTargets: Set<string>;  // preserved across back-nav
  generatedFiles: GeneratedFile[];
  expandedFile: string | null;   // which file is expanded in preview
}
```

Single `useReducer` manages all wizard state. Back navigation dispatches `{ type: 'BACK' }` which decrements step without clearing other state. Forward navigation dispatches `{ type: 'NEXT', payload }`.

## Component Architecture

```
InitWizard (state machine)
├── ScanStep (auto-run detectors, show progress)
├── ReviewStep (display analysis, enter/esc)
├── TargetsStep (MultiSelect from @inkjs/ui)
├── PreviewStep (scrollable FileList with expand)
└── ConfirmStep (ConfirmInput from @inkjs/ui, write files)

Dashboard (fullscreen-ink)
├── MainMenu (Select from @inkjs/ui)
├── DoctorView (inline results)
├── UpdateView (drift report)
└── RegistryView (search/browse)

Shared:
├── Header (custom — branding + step indicator)
├── StatusBar (custom — keyboard hints)
├── FileList (custom — grouped with status icons)
└── PreviewPanel (custom — inline file content)
```

## Migration Plan

1. `npm install @inkjs/ui fullscreen-ink`
2. Replace hand-rolled SelectPrompt → `@inkjs/ui` Select
3. Replace hand-rolled ConfirmPrompt → `@inkjs/ui` ConfirmInput
4. Build InitWizard with 5 step components + useReducer state machine
5. Build Dashboard with fullscreen-ink + Select menu
6. Wire mode detection into cli.ts
7. Remove old InitView.tsx stub

## What We Keep Custom

- **Header** — ccxl branding, version, step indicator
- **StatusBar** — contextual keyboard hints per step
- **FileList** — grouped by directory with status icons, this is core UX
- **PreviewPanel** — inline file content expand/collapse
- **Theme** — cyan/blue brand colors

## What @inkjs/ui Replaces

| Our Component | @inkjs/ui Replacement |
|---|---|
| SelectPrompt | Select (built-in scrolling, highlight, keyboard) |
| ConfirmPrompt | ConfirmInput (standard Y/n, onConfirm/onCancel) |
| Spinner | Spinner (same, but consistent with other @inkjs/ui components) |
| (new) MultiSelect for targets | MultiSelect (checkbox toggle, onSubmit) |
| (new) StatusMessage | StatusMessage (success/warning/error variants) |

# ccxl

## Overview

**Languages:** TypeScript
**Frameworks:** React (Ink TUI), Vitest
**Package Manager:** npm

Full-stack AI coding assistant configurator. Scans projects, generates configs for Claude Code, Cursor, Copilot, and Windsurf.

## Architecture

### Core Modules (src/)
- **analyzer/** — 9 detectors scanning projects for languages, frameworks, infra, existing configs
- **generators/** — 7 generators producing settings.json, skills, hooks, agents, MCP, CLAUDE.md, cross-tool configs
- **registry/** — GitHub-based package registry (install, uninstall, search, list)
- **maintenance/** — Drift detection and diagnostics
- **governance/** — Team base configs with policy enforcement
- **tui/** — Ink React components (App, Header, StatusBar, Spinner, SelectPrompt, etc.)
- **commands/** — Commander CLI (init, generate, install, doctor, registry, update, config)
- **types/** — Zod schemas for all data structures

### Key Patterns
- **Detector interface:** `{ name, detect(root) }` with `DetectorRegistry` running all in parallel via `Promise.allSettled`
- **Generator interface:** `{ name, generate(analysis, root) }` with `GeneratorPipeline` dedup by path
- **Template pattern:** Declarative arrays with condition functions for skills, hooks, agents
- **Non-destructive merge:** JSON union, markdown/scripts skip if existing

## Development

```bash
npm install
npm run dev          # Run with tsx
npm run build        # Build with tsup
npm run test:run     # Run vitest
npm run lint         # ESLint
```

## Standards

- **Testing:** Vitest with temp dir mocks for detectors
- **Build:** tsup (dual entry: cli.ts + index.ts)
- **Types:** Zod schema-first with z.infer<>
- **Modules:** ESM only (type: module)

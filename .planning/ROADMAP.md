# Roadmap: ccxl (Claude Code XL)

## Overview

Transform ccxl from an outdated setup script into a unified CLI platform that generates the complete AI coding assistant configuration stack. Start with a TypeScript foundation and Ink TUI, build a deep project analyzer, generate full Claude Code configs (skills, hooks, agents, MCP, permissions), output cross-tool configs (Cursor, Copilot, Windsurf), add a community registry for sharing configs, then layer on maintenance and team governance.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - TypeScript project setup, Ink TUI scaffold, CLI entry point
- [x] **Phase 2: Project Analyzer** - Deep project scanning and detection engine
- [x] **Phase 3: Claude Code Generator** - Full Claude Code config stack generation
- [x] **Phase 3.1: Critical Improvements** - INSERTED: Force config reading hooks, non-destructive merge, global install
- [x] **Phase 4: Cross-Tool Output** - Multi-tool config generation (Cursor, Copilot, Windsurf)
- [x] **Phase 5: Community Registry** - Browse, install, share curated configs
- [ ] **Phase 6: Config Maintenance** - Drift detection, diagnostics, config evolution
- [ ] **Phase 7: Team Governance** - Shared base configs, org-wide standards

## Phase Details

### Phase 1: Foundation
**Goal**: Clean TypeScript project with Ink TUI, Commander CLI, and the scaffolding for all future phases
**Depends on**: Nothing (first phase)
**Research**: Unlikely (established patterns — TypeScript, Ink, Commander)
**Plans**: 3 plans

Plans:
- [x] 01-01: TypeScript project setup — tsconfig, build pipeline, ESLint, package.json rewrite
- [x] 01-02: CLI entry point with Commander — command structure, global flags, help text
- [x] 01-03: Ink TUI scaffold — base components, interactive prompts, progress display, preview panels

### Phase 2: Project Analyzer
**Goal**: Deep project scanning engine that detects languages, frameworks, dependencies, monorepo structure, CI/CD, cloud providers, databases, and existing AI tool configs
**Depends on**: Phase 1
**Research**: Unlikely (file parsing, pattern matching — internal logic)
**Plans**: 4 plans

Plans:
- [x] 02-01: Core analyzer architecture — plugin-based detector system, analysis result types
- [x] 02-02: Language and framework detection — package.json, pyproject.toml, go.mod, Cargo.toml, framework fingerprinting
- [x] 02-03: Infrastructure detection — CI/CD (GitHub Actions, GitLab CI), cloud providers (AWS, GCP, Azure), databases, Docker, monorepo tools
- [x] 02-04: Existing config detection — scan for .claude/, .cursorrules, copilot-instructions.md, .windsurfrules, detect what's already configured

### Phase 3: Claude Code Generator
**Goal**: Generate the complete Claude Code configuration stack — settings.json, skills, hooks, AGENTS.md, .mcp.json, permissions, keybindings, status line, CLAUDE.md — all tuned to the analyzed project
**Depends on**: Phase 2
**Research**: Likely (need current Claude Code config schemas and formats)
**Research topics**: Current settings.json schema, skill frontmatter format and trigger patterns, hook event types and matcher syntax, AGENTS.md frontmatter fields, .mcp.json format, permission rule syntax (Bash(cmd:*) patterns), keybindings.json format, status line template syntax
**Plans**: 5 plans

Plans:
- [x] 03-01: Settings and permissions generator — fine-grained permission rules matched to detected stack
- [x] 03-02: Skills generator — .claude/skills/ with proper frontmatter, triggers, tool restrictions, project-appropriate skills
- [x] 03-03: Hooks generator — PreToolUse/PostToolUse hooks using current event system, matchers, hook types
- [x] 03-04: Agents and MCP generator — AGENTS.md with project-appropriate subagents, .mcp.json with relevant MCP servers
- [x] 03-05: CLAUDE.md and extras generator — deep codebase-aware project context, keybindings, status line, output styles

### Phase 3.1: Critical Improvements (INSERTED)
**Goal**: Three must-have features before continuing: force-read hooks for CLAUDE.md/skills/memory, non-destructive merge for existing configs, and global install support
**Depends on**: Phase 3
**Research**: Unlikely
**Plans**: 3 plans

Plans:
- [x] 03.1-01: Force config reading hooks — SessionStart/PreCompact hooks that ensure agents read CLAUDE.md, skills, and memory consistently
- [x] 03.1-02: Non-destructive merge — check existing files, merge settings/permissions, skip or prompt for conflicts
- [x] 03.1-03: Global install support — --global flag writes to ~/.claude/ instead of project .claude/

### Phase 4: Cross-Tool Output
**Goal**: Generate configuration files for Cursor, GitHub Copilot, and Windsurf from the same analyzer results
**Depends on**: Phase 2 (uses analyzer, parallel with Phase 3)
**Research**: Likely (need current config formats for each tool)
**Research topics**: .cursorrules format and capabilities, copilot-instructions.md format, .windsurfrules format, what each tool supports vs Claude Code
**Plans**: 3 plans

Plans:
- [x] 04-01: All three adapters (Cursor, Copilot, Windsurf) — shared rules, legacy + modern formats, pipeline wiring
(Consolidated from 3 plans to 1 — all tools use identical YAML frontmatter + markdown pattern)

### Phase 5: Community Registry
**Goal**: Browse, install, and share curated skills, hooks, agents, and config packages from a GitHub-based registry
**Depends on**: Phase 3
**Research**: Likely (registry design patterns)
**Research topics**: GitHub-based package registry patterns, config package format design, versioning strategy, discovery/search UX
**Plans**: 2 plans (consolidated from 4)

Plans:
- [x] 05-01: Package format + install/uninstall — manifest schema, GitHub fetch, merge into local configs
- [x] 05-02: Browse, search, list, publish — TUI browser, GitHub search, list installed, publish instructions

### Phase 6: Config Maintenance
**Goal**: Detect drift between codebase state and config, evolve configs as project changes, health checks and diagnostics
**Depends on**: Phase 3
**Research**: Unlikely (internal diffing/comparison logic)
**Plans**: 1 plan (consolidated from 3)

Plans:
- [ ] 06-01: Drift detection + diagnostics — update command, doctor command with 8 checks + auto-fix

### Phase 7: Team Governance
**Goal**: Shared base configs with org-wide standards and per-project overrides
**Depends on**: Phase 5, Phase 6
**Research**: Unlikely (config merging patterns, established conventions)
**Plans**: 3 plans

Plans:
- [ ] 07-01: Base config system — shareable config packages, inheritance/override model
- [ ] 07-02: Org-wide standards — policy enforcement, required permissions, blocked patterns
- [ ] 07-03: Sync and compliance — config sync across repos, compliance reporting, drift alerts

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 3.1 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-03-28 |
| 2. Project Analyzer | 4/4 | Complete | 2026-03-29 |
| 3. Claude Code Generator | 5/5 | Complete | 2026-03-29 |
| 3.1 Critical Improvements | 3/3 | Complete | 2026-03-29 |
| 4. Cross-Tool Output | 1/1 | Complete | 2026-03-29 |
| 5. Community Registry | 2/2 | Complete | 2026-03-29 |
| 6. Config Maintenance | 0/1 | Not started | - |
| 7. Team Governance | 0/3 | Not started | - |

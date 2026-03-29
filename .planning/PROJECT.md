# ccxl (Claude Code XL)

## What This Is

A unified CLI platform that transforms any project's AI coding assistant setup from basic to fully configured. ccxl scans a project, generates the complete Claude Code configuration stack (skills, hooks, agents, MCP servers, permissions, CLAUDE.md), pulls from a community registry of curated configs, and outputs configurations for multiple AI coding tools (Claude Code, Cursor, Copilot, Windsurf) — all from a single scan.

## Core Value

One command gives you a maxed-out, project-aware AI coding assistant environment that would take hours to configure manually — and keeps it maintained as your project evolves.

## Requirements

### Validated

- v Existing npm package name `ccxl` on npm registry — existing
- v Git repository with history — existing

### Active

- [ ] Deep project analyzer — detect languages, frameworks, dependencies, monorepo structure, CI/CD, cloud providers, databases, existing Claude Code configs
- [ ] Full Claude Code stack generation — settings.json with modern fine-grained permissions, skills (.claude/skills/ with proper frontmatter and triggers), hooks (PreToolUse/PostToolUse using current event system), AGENTS.md with project-appropriate subagents, .mcp.json with relevant MCP servers, keybindings, status line templates, output styles
- [ ] Quality CLAUDE.md generation — deep codebase-aware project context, architecture decisions, non-obvious patterns, team conventions (not boilerplate)
- [ ] Community registry — browse, install, and share curated skills/hooks/agents/configs; local/GitHub-based in v1
- [ ] Cross-tool config output — one scan generates configs for Claude Code, Cursor (.cursorrules), GitHub Copilot (copilot-instructions.md), Windsurf (.windsurfrules) simultaneously
- [ ] Config maintenance — detect drift between codebase state and config, evolve configs as project changes, staleness detection
- [ ] Team governance — shared base configs, org-wide standards with per-project overrides
- [ ] Diagnostics — health checks, permission audits, config validation, conflict detection
- [ ] Interactive TUI — guided setup with smart defaults, preview before writing
- [ ] TypeScript rewrite — full type safety, modern tooling

### Out of Scope

(Nothing explicitly excluded — going for broke)

## Context

The Claude Code configuration space has 15+ fragmented tools, each doing one slice:
- `create-claude-workspace` (21.7k/mo) — scaffolding focused
- `@hopla/claude-setup` (5.4k/mo) — team-specific setup
- `claudemd-pro` — CLAUDE.md quality only
- `claude-hooks` — hooks only
- `claude-permissions-manager` — permissions only
- `aiconfig-gen` — cross-tool but v0.1.0 quality

No single tool covers the full stack + registry + cross-tool + maintenance. ccxl unifies all of it.

Claude Code itself now has 150+ user-facing features including skills with frontmatter/triggers, 16 hook event types, MCP server configs, AGENTS.md, fine-grained permissions, custom keybindings, status line templates, output styles, and agent teams. Most developers use a fraction of these because configuration is manual and fragmented.

The GSD (get-shit-done) skill system is a reference implementation for the kind of sophisticated skill/workflow architecture ccxl should generate — skills with frontmatter, templates, state tracking, phase-based execution.

### Brownfield Context

The existing ccxl v2.0.0-alpha.1 codebase is a full rewrite target. The current JavaScript code generates outdated Claude Code 2.0-era configs (old permission model, shell-script hooks, old command format, boilerplate CLAUDE.md, Jina AI doc scraping). None of the existing lib/, adapters/, templates/, or test code is architecturally worth preserving. The TypeScript rewrite starts fresh.

## Constraints

- **Package**: Must publish as `ccxl` on npm (existing listing)
- **Runtime**: Node.js >= 20.0.0
- **Language**: TypeScript (full rewrite from JavaScript)
- **TUI**: Ink (React-based terminal UI)
- **Distribution**: CLI via npx/npm install -g

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full rewrite over incremental migration | Existing code targets outdated Claude Code config formats; every module would need replacement | -- Pending |
| TypeScript over JavaScript | Type safety, better DX, modern tooling, aligns with Claude Code ecosystem (claude-hooks-sdk etc.) | -- Pending |
| All-in-one over focused tool | Competitors each do one slice; unifying is the differentiator | -- Pending |
| Community registry in v1 | Registry is core to the "XL" value prop, not a later add-on | -- Pending |
| Cross-tool output in v1 | Low marginal cost once analyzer exists; major differentiator vs every competitor | -- Pending |

---
*Last updated: 2026-03-28 after initialization*

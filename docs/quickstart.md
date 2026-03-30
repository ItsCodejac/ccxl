# ccxl Quick Start

## What is ccxl?

ccxl scans your project and generates AI coding assistant configs — for Claude Code, Cursor, Copilot, and Windsurf — all tuned to your specific codebase. One command, four tools configured.

## Install

```bash
npm install -g ccxl
```

## Run it

```bash
ccxl
```

That's it. You'll see a dashboard:

```
╭───────────────────────────────────────────╮
│ ccxl v3.1.1                               │
╰───────────────────────────────────────────╯

 ❯ Init         Scan & generate configs
   Generate     Generate specific layers
   Doctor       Run diagnostics
   Update       Check for drift
   Registry     Browse & install packages
   Config       Manage base configs

┌───────────────────────────────────────────┐
│ Project: my-app                           │
│ Configs:  ✗ Claude  ✗ Cursor  ✗ Copilot   │
└───────────────────────────────────────────┘
```

Use arrow keys to navigate. Press Enter to select. Press `q` to quit.

## First time: Init

Select **Init** (or run `ccxl init`). The wizard walks you through 5 steps:

### Step 1 — Scan

ccxl reads your project and detects everything automatically:
- Languages (TypeScript, Python, Go, Rust, Java, Swift)
- Frameworks (React, Next.js, Express, Django, FastAPI, Prisma, 20+ more)
- Package manager (npm, yarn, pnpm, bun)
- CI/CD (GitHub Actions, GitLab CI, CircleCI)
- Cloud (AWS, Vercel, Netlify, Fly)
- Databases (PostgreSQL, MongoDB, Redis, SQLite)
- Docker, monorepo tools, existing AI configs

### Step 2 — Review

See what was detected. Press Enter to continue, Esc to go back.

### Step 3 — Choose targets

Pick which tools to configure:

```
 ◉ Claude Code    settings, skills, hooks, agents, MCP
 ◉ Cursor         .cursorrules + .cursor/rules/
 ◉ GitHub Copilot copilot-instructions.md
 ◉ Windsurf       .windsurfrules + .windsurf/rules/
 ○ CLAUDE.md      already exists — uncheck to skip
```

Space to toggle, Enter to continue.

### Step 4 — Preview

See every file that will be created. Arrow keys to scroll, Enter to expand a file and see its contents.

```
 .claude/
   + settings.json
 ▼ + skills/run-tests/SKILL.md
 │ ---
 │ name: run-tests
 │ description: Run the project test suite
 │ ---
   + hooks/block-dangerous-git.sh
   + agents/code-reviewer.md
 .cursor/
   + rules/general.mdc
```

### Step 5 — Write

Confirm and ccxl writes all files. Existing configs are preserved (merged, not overwritten).

## What you get

For a typical TypeScript + React + PostgreSQL project, ccxl generates ~30 files:

**Claude Code:**
- `.claude/settings.json` — permissions tuned to your stack (npm allowed, .env blocked, git push asks)
- `.claude/skills/` — run-tests, review-code, generate-tests, explain-code, lint-fix, deploy, db-migrate
- `.claude/hooks/` — block dangerous git, block .env deletion, auto-format, context loader
- `.claude/agents/` — code-reviewer, explorer, test-runner, frontend-dev, api-developer
- `CLAUDE.md` — project context with your actual stack, commands, and architecture

**Cursor:**
- `.cursorrules` — project rules (legacy format)
- `.cursor/rules/*.mdc` — scoped rules with globs (modern format)

**GitHub Copilot:**
- `.github/copilot-instructions.md` — project instructions
- `.github/instructions/*.instructions.md` — scoped instructions

**Windsurf:**
- `.windsurfrules` — project rules (legacy format)
- `.windsurf/rules/*.md` — scoped rules with triggers (modern format)

## After init

### Check health
```bash
ccxl doctor
```
Shows if everything is set up correctly. Use `--fix` to auto-repair issues.

### Update when your project changes
```bash
ccxl update
```
Detects if your project added new frameworks, databases, or CI — suggests config updates.

### Install community packages
```bash
ccxl install user/repo
ccxl registry search react
```
Browse and install shared skills, hooks, and agents from GitHub.

## Non-interactive mode

For CI or scripting:

```bash
ccxl init --yes          # auto-approve everything
ccxl init --dry-run      # preview without writing
ccxl init --global       # install to ~/.claude/ (all projects)
ccxl init --force        # overwrite existing configs
ccxl generate settings   # generate just one layer
```

## Safe by default

- **Non-destructive** — existing configs are merged, not replaced. Your custom settings are preserved.
- **Preview everything** — `--dry-run` and `--preview` show what would change before writing.
- **.env protected** — generated configs block AI tools from reading .env files.
- **Git safety** — hooks block `git reset --hard` and other destructive commands.

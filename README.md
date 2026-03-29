# ccxl — Claude Code XL

Full-stack AI coding assistant configurator. One scan generates complete configs for **Claude Code**, **Cursor**, **GitHub Copilot**, and **Windsurf**.

## Install

```bash
npx ccxl init
```

Or install globally:

```bash
npm install -g ccxl
```

## What It Does

Run `ccxl init` in any project. ccxl scans your codebase and generates:

**Claude Code** — settings.json (project-aware permissions), skills, hooks, agents, MCP servers, CLAUDE.md
**Cursor** — .cursorrules + .cursor/rules/*.mdc
**GitHub Copilot** — copilot-instructions.md + .github/instructions/*.instructions.md
**Windsurf** — .windsurfrules + .windsurf/rules/*.md

All tuned to your specific project — detected languages, frameworks, databases, CI/CD, cloud providers, and more.

## Commands

```bash
ccxl init                    # Scan project + generate all configs
ccxl init --dry-run          # Preview what would be generated
ccxl init --yes              # Skip prompts, use smart defaults
ccxl init --global           # Install universal configs to ~/.claude/
ccxl init --force            # Overwrite existing configs

ccxl generate settings       # Generate specific config layer
ccxl generate skills         # Generate skills only
ccxl generate all             # Generate everything
ccxl generate cross-tool     # Cursor + Copilot + Windsurf only

ccxl install user/repo       # Install community config package
ccxl registry search react   # Search for packages
ccxl registry list           # List installed packages

ccxl update                  # Check for config drift
ccxl update --apply          # Apply suggested updates

ccxl doctor                  # Run diagnostics
ccxl doctor --fix            # Auto-fix issues

ccxl config show             # Show current config
ccxl config set base org/repo # Set org base config
ccxl config check            # Check compliance
```

## What Gets Detected

**Languages:** JavaScript, TypeScript, Python, Go, Rust, Java, Swift
**Frameworks:** React, Next.js, Vue, Nuxt, Svelte, Angular, Express, Fastify, Prisma, Drizzle, Django, Flask, FastAPI, and 10+ more
**Package Managers:** npm, yarn, pnpm, bun
**CI/CD:** GitHub Actions, GitLab CI, CircleCI, Jenkins, Travis
**Cloud:** AWS, GCP, Azure, Vercel, Netlify, Fly
**Databases:** PostgreSQL, MySQL, SQLite, MongoDB, Redis, Elasticsearch
**Infrastructure:** Docker, Docker Compose, monorepos (Turborepo, Nx, pnpm, Lerna)

## What Gets Generated

### Claude Code
- **settings.json** — Fine-grained permissions matched to your stack
- **Skills** — run-tests, review-code, generate-tests, explain-code, deploy, db-migrate, lint-fix, docker-build, ci-check
- **Hooks** — Safety (block dangerous git, block .env deletion), auto-format, session context loading, pre-compaction context preservation
- **Agents** — code-reviewer, explorer, test-runner, frontend-dev, api-developer, db-specialist, devops
- **MCP servers** — PostgreSQL, SQLite, GitHub (auto-detected from project)
- **CLAUDE.md** — Project-specific context (not boilerplate)

### Cross-Tool (Cursor, Copilot, Windsurf)
Both legacy flat files and modern directory formats with proper YAML frontmatter:
- Project overview rules (always on)
- Code style rules (always on)
- Testing rules (glob-matched to test files)
- API rules (glob-matched to route files)
- Component rules (glob-matched to component files)

## Non-Destructive

ccxl can be added to any project at any stage. It merges with existing configs:
- JSON files: permissions union, existing values preserved
- Markdown, scripts, skills, agents: skipped if they already exist
- Use `--force` to overwrite everything

## Community Registry

Share and install config packages via GitHub:

```bash
# Install a package
ccxl install user/repo

# Search for packages
ccxl registry search security

# Publish your own
# 1. Create ccxl-package.json in your repo
# 2. Add topic "ccxl-package" on GitHub
# 3. Push — immediately installable
```

## Team Governance

Set org-wide standards with base configs:

```bash
ccxl config set base my-org/standards
ccxl config check    # Verify compliance
ccxl doctor          # Includes governance check
```

Base configs enforce policies: required deny rules, disallowed permissions, mandatory hooks.

## Requirements

- Node.js >= 20.0.0

## License

MIT

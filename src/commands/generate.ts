import type { Command } from 'commander';
import chalk from 'chalk';

export function registerGenerateCommand(program: Command): void {
  const generate = program
    .command('generate')
    .description('Generate specific config layers')
    .option('-n, --dry-run', 'Show what would be generated without writing')
    .option('-p, --preview', 'Preview generated content before writing')
    .option('-t, --target <tool>', 'Target tool (claude|cursor|copilot|windsurf|all)', 'all');

  const layers = ['settings', 'skills', 'hooks', 'agents', 'mcp', 'claude-md', 'keybindings', 'all'];

  for (const layer of layers) {
    generate
      .command(layer)
      .description(`Generate ${layer === 'all' ? 'all config layers' : layer} config`)
      .action(() => {
        console.log(chalk.yellow(`⏳ generate ${layer} — coming in Phase 3 (Claude Code Generator)`));
      });
  }

  generate.action(() => {
    console.log(chalk.yellow('⏳ Not implemented yet — coming in Phase 3 (Claude Code Generator)'));
    console.log(chalk.dim('  Use a subcommand: ccxl generate [settings|skills|hooks|agents|mcp|claude-md|keybindings|all]'));
  });
}

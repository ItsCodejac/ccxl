import type { Command } from 'commander';
import chalk from 'chalk';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Scan project and generate full AI assistant config')
    .option('-n, --dry-run', 'Show what would be generated without writing files')
    .option('-y, --yes', 'Skip all prompts, use smart defaults')
    .option('-q, --quiet', 'Minimal output')
    .option('-v, --verbose', 'Detailed output')
    .option('-f, --force', 'Overwrite existing configs')
    .action((options) => {
      if (options.dryRun) {
        console.log(chalk.dim('Dry run mode — no files will be written\n'));
      }
      console.log(chalk.yellow('⏳ Not implemented yet — coming in Phase 2 (Project Analyzer) + Phase 3 (Generator)'));
      console.log(chalk.dim('  This will scan your project and generate the full config stack.'));
    });
}

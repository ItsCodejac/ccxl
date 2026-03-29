import type { Command } from 'commander';
import chalk from 'chalk';

export function registerUpdateCommand(program: Command): void {
  program
    .command('update')
    .description('Check for config drift and suggest updates')
    .option('--apply', 'Apply suggested updates automatically')
    .option('-n, --dry-run', 'Show what would change without applying')
    .action(() => {
      console.log(chalk.yellow('⏳ Not implemented yet — coming in Phase 6 (Config Maintenance)'));
    });
}

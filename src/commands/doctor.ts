import type { Command } from 'commander';
import chalk from 'chalk';

export function registerDoctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('Run diagnostics and health checks on your AI assistant configs')
    .option('--fix', 'Auto-fix detected issues')
    .option('-v, --verbose', 'Show detailed diagnostic output')
    .action(() => {
      console.log(chalk.yellow('⏳ Not implemented yet — coming in Phase 6 (Config Maintenance)'));
    });
}

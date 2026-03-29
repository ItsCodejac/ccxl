import type { Command } from 'commander';
import chalk from 'chalk';

export function registerConfigCommand(program: Command): void {
  const config = program
    .command('config')
    .description("Manage ccxl's own configuration");

  config
    .command('show')
    .description('Show current ccxl configuration')
    .action(() => {
      console.log(chalk.yellow('⏳ config show — coming in Phase 6 (Config Maintenance)'));
    });

  config
    .command('set <key> <value>')
    .description('Set a configuration value')
    .action((key, value) => {
      console.log(chalk.yellow(`⏳ config set ${key}=${value} — coming in Phase 6 (Config Maintenance)`));
    });

  config
    .command('reset')
    .description('Reset ccxl configuration to defaults')
    .action(() => {
      console.log(chalk.yellow('⏳ config reset — coming in Phase 6 (Config Maintenance)'));
    });

  config.action(() => {
    console.log(chalk.yellow('⏳ Not implemented yet — coming in Phase 6 (Config Maintenance)'));
    console.log(chalk.dim('  Use a subcommand: ccxl config [show|set|reset]'));
  });
}

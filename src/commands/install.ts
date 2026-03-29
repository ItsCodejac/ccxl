import type { Command } from 'commander';
import chalk from 'chalk';

export function registerInstallCommand(program: Command): void {
  program
    .command('install <package>')
    .description('Install a config package from the community registry')
    .option('-g, --global', 'Install globally (applies to all projects)')
    .option('-p, --preview', 'Preview package contents before installing')
    .action((pkg) => {
      console.log(chalk.yellow(`⏳ install "${pkg}" — coming in Phase 5 (Community Registry)`));
    });
}

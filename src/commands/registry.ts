import type { Command } from 'commander';
import chalk from 'chalk';

export function registerRegistryCommand(program: Command): void {
  const registry = program
    .command('registry')
    .description('Browse and manage the community config registry');

  registry
    .command('search <query>')
    .description('Search for config packages')
    .action((query) => {
      console.log(chalk.yellow(`⏳ registry search "${query}" — coming in Phase 5 (Community Registry)`));
    });

  registry
    .command('browse')
    .description('Browse available config packages in TUI')
    .action(() => {
      console.log(chalk.yellow('⏳ registry browse — coming in Phase 5 (Community Registry)'));
    });

  registry
    .command('publish')
    .description('Publish a config package to the registry')
    .action(() => {
      console.log(chalk.yellow('⏳ registry publish — coming in Phase 5 (Community Registry)'));
    });

  registry
    .command('list')
    .description('List installed config packages')
    .action(() => {
      console.log(chalk.yellow('⏳ registry list — coming in Phase 5 (Community Registry)'));
    });

  registry.action(() => {
    console.log(chalk.yellow('⏳ Not implemented yet — coming in Phase 5 (Community Registry)'));
    console.log(chalk.dim('  Use a subcommand: ccxl registry [search|browse|publish|list]'));
  });
}

import { Command } from 'commander';
import chalk from 'chalk';
import { version } from './index.js';
import { registerInitCommand } from './commands/init.js';
import { registerGenerateCommand } from './commands/generate.js';
import { registerInstallCommand } from './commands/install.js';
import { registerDoctorCommand } from './commands/doctor.js';
import { registerRegistryCommand } from './commands/registry.js';
import { registerUpdateCommand } from './commands/update.js';
import { registerConfigCommand } from './commands/config.js';

const program = new Command();

program
  .name('ccxl')
  .description('ccxl (Claude Code XL) — Full-stack AI coding assistant configurator.\nGenerate complete Claude Code, Cursor, Copilot, and Windsurf configs from a single scan.')
  .version(version)
  .option('--no-color', 'Disable colored output')
  .option('--debug', 'Enable debug logging')
  .hook('preAction', () => {
    if (program.opts().color === false) {
      chalk.level = 0;
    }
  });

registerInitCommand(program);
registerGenerateCommand(program);
registerInstallCommand(program);
registerDoctorCommand(program);
registerRegistryCommand(program);
registerUpdateCommand(program);
registerConfigCommand(program);

// Default action: show dashboard when no command given
program.action(async () => {
  const React = await import('react');
  const { render } = await import('ink');
  const path = await import('node:path');
  const fs = await import('fs-extra');

  const root = process.cwd();
  const projectName = path.default.basename(root);

  const configStatus = {
    claude: await fs.default.pathExists(path.default.join(root, '.claude', 'settings.json')),
    cursor: await fs.default.pathExists(path.default.join(root, '.cursorrules')) || await fs.default.pathExists(path.default.join(root, '.cursor', 'rules')),
    copilot: await fs.default.pathExists(path.default.join(root, '.github', 'copilot-instructions.md')),
    windsurf: await fs.default.pathExists(path.default.join(root, '.windsurfrules')) || await fs.default.pathExists(path.default.join(root, '.windsurf', 'rules')),
  };

  let packageCount = 0;
  const pkgPath = path.default.join(root, '.claude', 'ccxl-packages.json');
  if (await fs.default.pathExists(pkgPath)) {
    const data = await fs.default.readJson(pkgPath) as { packages: unknown[] };
    packageCount = data.packages.length;
  }

  try {
    const { Dashboard } = await import('./tui/dashboard/Dashboard.js');
    render(React.createElement(Dashboard, { version, projectName, configStatus, packageCount }));
  } catch {
    // Fallback if terminal doesn't support raw mode (e.g., piped, CI)
    program.help();
  }
});

program.parseAsync().catch((err: Error) => {
  console.error(chalk.red(`Error: ${err.message}`));
  if (program.opts().debug) {
    console.error(err.stack);
  }
  process.exit(1);
});

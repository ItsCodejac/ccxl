import { Command } from 'commander';
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
  .option('--debug', 'Enable debug logging');

registerInitCommand(program);
registerGenerateCommand(program);
registerInstallCommand(program);
registerDoctorCommand(program);
registerRegistryCommand(program);
registerUpdateCommand(program);
registerConfigCommand(program);

program.parse();

import type { Command } from 'commander';
import { style } from '../tui/theme.js';
import { installPackage } from '../registry/install.js';

export function registerInstallCommand(program: Command): void {
  program
    .command('install <package>')
    .description('Install a config package from the community registry')
    .option('-g, --global', 'Install globally (applies to all projects)')
    .option('-p, --preview', 'Preview package contents before installing')
    .action(async (source: string, options) => {
      if (!source.includes('/')) {
        console.log(style.error(`Invalid source: "${source}". Use format: user/repo`));
        process.exit(1);
      }

      const root = process.cwd();

      try {
        if (options.preview) {
          console.log(style.highlight(`Previewing ${source}...`));
          const pkg = await installPackage(source, root, { global: options.global, preview: true });
          console.log(style.bold(`\n${pkg.name}@${pkg.version}`));
          console.log(style.heading('\nFiles to install:'));
          for (const file of pkg.files) {
            console.log(`  ${style.success('+')} ${file}`);
          }
          console.log(style.muted('\nRun without --preview to install.'));
          return;
        }

        console.log(style.highlight(`Installing ${source}...`));
        const pkg = await installPackage(source, root, { global: options.global });
        console.log(`${style.success('✓')} Installed ${style.bold(`${pkg.name}@${pkg.version}`)} (${pkg.files.length} files)`);
      } catch (err) {
        console.log(style.error(`Failed to install: ${(err as Error).message}`));
        process.exit(1);
      }
    });
}

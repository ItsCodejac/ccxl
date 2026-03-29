import path from 'node:path';
import type { Command } from 'commander';
import fs from 'fs-extra';
import { style } from '../tui/theme.js';
import { loadBaseConfig, checkCompliance } from '../governance/index.js';
import { installPackage } from '../registry/install.js';

export function registerConfigCommand(program: Command): void {
  const config = program
    .command('config')
    .description("Manage ccxl's own configuration");

  config
    .command('show')
    .description('Show current ccxl configuration')
    .action(async () => {
      const root = process.cwd();

      console.log(style.heading('ccxl Configuration\n'));

      // Check for base config
      const baseConfig = await loadBaseConfig(root);
      if (baseConfig) {
        console.log(style.bold('Base Config:'));
        console.log(`  Name: ${baseConfig.name}`);
        console.log(`  Source: ${baseConfig.source}`);
        console.log(`  Version: ${baseConfig.version}`);
        console.log(`  Policies: ${baseConfig.policies.length}`);
        console.log();
      } else {
        console.log(style.muted('No base config set.'));
        console.log(style.muted('Set one with: ccxl config set base user/repo\n'));
      }

      // Show installed packages count
      const pkgPath = path.join(root, '.claude', 'ccxl-packages.json');
      if (await fs.pathExists(pkgPath)) {
        const registry = await fs.readJson(pkgPath) as { packages: unknown[] };
        console.log(`Installed packages: ${registry.packages.length}`);
      }

      // Show detected configs
      const configDirs = ['.claude', '.cursor', '.windsurf', '.github'];
      console.log(style.heading('\nConfig directories:'));
      for (const dir of configDirs) {
        const exists = await fs.pathExists(path.join(root, dir));
        console.log(`  ${exists ? style.success('✓') : style.muted('✗')} ${dir}/`);
      }
    });

  config
    .command('set <key> <value>')
    .description('Set a configuration value (e.g., "base user/repo")')
    .action(async (key: string, value: string) => {
      const root = process.cwd();

      if (key === 'base') {
        try {
          console.log(style.highlight(`Fetching base config from ${value}...`));
          const pkg = await installPackage(value, root, { preview: true });
          // The package should contain a base-config.json
          console.log(`${style.success('✓')} Base config "${pkg.name}" ready`);
          console.log(style.muted('Run `ccxl config check` to verify compliance.'));
        } catch (err) {
          console.log(style.error(`Failed: ${(err as Error).message}`));
        }
        return;
      }

      console.log(style.muted(`Unknown config key: ${key}`));
      console.log(style.muted('Available keys: base'));
    });

  config
    .command('check')
    .description('Check compliance with base config policies')
    .action(async () => {
      const root = process.cwd();
      const baseConfig = await loadBaseConfig(root);

      if (!baseConfig) {
        console.log(style.muted('No base config set. Nothing to check.'));
        return;
      }

      console.log(style.highlight(`Checking compliance with "${baseConfig.name}"...\n`));
      const report = await checkCompliance(root, baseConfig);

      if (report.compliant) {
        console.log(`${style.success('✓')} Fully compliant with all ${report.policies} policies.`);
      } else {
        console.log(`${style.error('✗')} ${report.violations.length} violation(s) found:\n`);
        for (const v of report.violations) {
          console.log(`  ${style.error('✗')} ${v.message}`);
        }
      }
    });

  config
    .command('reset')
    .description('Remove base config')
    .action(async () => {
      const root = process.cwd();
      const configPath = path.join(root, '.claude', 'base-config.json');
      if (await fs.pathExists(configPath)) {
        await fs.remove(configPath);
        console.log(`${style.success('✓')} Base config removed.`);
      } else {
        console.log(style.muted('No base config to remove.'));
      }
    });

  config.action(() => {
    console.log(style.heading('ccxl config\n'));
    console.log('Commands:');
    console.log(`  ${style.bold('show')}              Show current configuration`);
    console.log(`  ${style.bold('set base <repo>')}   Set base config from GitHub repo`);
    console.log(`  ${style.bold('check')}             Check compliance with base config`);
    console.log(`  ${style.bold('reset')}             Remove base config`);
  });
}

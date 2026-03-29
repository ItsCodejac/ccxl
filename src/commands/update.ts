import path from 'node:path';
import type { Command } from 'commander';
import fs from 'fs-extra';
import { style } from '../tui/theme.js';
import { detectDrift } from '../maintenance/drift.js';

export function registerUpdateCommand(program: Command): void {
  program
    .command('update')
    .description('Check for config drift and suggest updates')
    .option('--apply', 'Apply suggested updates automatically')
    .option('-n, --dry-run', 'Show what would change without applying')
    .action(async (options) => {
      const root = process.cwd();

      console.log(style.highlight('Checking for config drift...'));
      const report = await detectDrift(root);

      console.log(style.heading('\nDrift Report:'));
      console.log(`  ${style.success(`${report.current.length} current`)} — configs match generated output`);
      console.log(`  ${style.warning(`${report.stale.length} stale`)} — configs differ from what ccxl would generate`);
      console.log(`  ${style.highlight(`${report.missing.length} missing`)} — new configs available`);

      if (report.stale.length === 0 && report.missing.length === 0) {
        console.log(`\n${style.success('✓')} All configs are up to date.`);
        return;
      }

      if (report.stale.length > 0) {
        console.log(style.heading('\nStale configs:'));
        for (const file of report.stale) {
          console.log(`  ${style.warning('~')} ${file.path}`);
        }
      }

      if (report.missing.length > 0) {
        console.log(style.heading('\nNew configs available:'));
        for (const file of report.missing) {
          console.log(`  ${style.success('+')} ${file.path}`);
        }
      }

      if (!options.apply) {
        console.log(`\n${style.muted('Run `ccxl update --apply` to apply changes.')}`);
        return;
      }

      // Apply changes
      const toWrite = [...report.missing, ...report.stale];
      for (const file of toWrite) {
        const fullPath = path.join(root, file.path);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, file.content);
      }

      console.log(`\n${style.success('✓')} Applied ${toWrite.length} updates.`);
    });
}

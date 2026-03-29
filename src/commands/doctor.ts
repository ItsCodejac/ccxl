import type { Command } from 'commander';
import { style } from '../tui/theme.js';
import { runDiagnostics } from '../maintenance/diagnostics.js';

export function registerDoctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('Run diagnostics and health checks on your AI assistant configs')
    .option('--fix', 'Auto-fix detected issues')
    .option('-v, --verbose', 'Show detailed diagnostic output')
    .action(async (options) => {
      const root = process.cwd();

      console.log(style.highlight('Running diagnostics...\n'));
      const results = await runDiagnostics(root, { fix: options.fix });

      const statusIcon = { pass: style.success('✓'), warn: style.warning('!'), fail: style.error('✗') };

      for (const r of results) {
        console.log(`  ${statusIcon[r.status]} ${style.bold(r.name)} — ${r.message}`);
      }

      const passes = results.filter((r) => r.status === 'pass').length;
      const warns = results.filter((r) => r.status === 'warn').length;
      const fails = results.filter((r) => r.status === 'fail').length;

      console.log(`\n${passes} passed, ${warns} warnings, ${fails} failures`);

      if (fails > 0) {
        console.log(style.muted('\nRun `ccxl init` to fix critical issues.'));
      }
      if (warns > 0 && !options.fix) {
        const fixable = results.filter((r) => r.fixable).length;
        if (fixable > 0) {
          console.log(style.muted(`Run \`ccxl doctor --fix\` to auto-fix ${fixable} issues.`));
        }
      }
    });
}

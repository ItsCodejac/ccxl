import type { Command } from 'commander';
import { style } from '../tui/theme.js';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Scan project and generate full AI assistant config')
    .option('-n, --dry-run', 'Show what would be generated without writing files')
    .option('-y, --yes', 'Skip all prompts, use smart defaults')
    .option('-q, --quiet', 'Minimal output')
    .option('-v, --verbose', 'Detailed output')
    .option('-f, --force', 'Overwrite existing configs')
    .action(async (options) => {
      if (options.yes) {
        console.log(style.muted('Auto mode — using smart defaults'));
        console.log(style.warning('⏳ Not implemented yet — coming in Phase 2+3'));
        return;
      }

      // Dynamic import to keep JSX in .tsx files
      const React = await import('react');
      const { render } = await import('ink');
      const { version } = await import('../index.js');
      const { InitView } = await import('../tui/views/InitView.js');

      render(React.createElement(InitView, { version }));
    });
}

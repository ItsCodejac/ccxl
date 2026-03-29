import chalk from 'chalk';

export const colors = {
  primary: '#06b6d4',    // cyan-500
  secondary: '#3b82f6',  // blue-500
  success: '#22c55e',    // green-500
  warning: '#eab308',    // yellow-500
  error: '#ef4444',      // red-500
  muted: '#6b7280',      // gray-500
  border: '#374151',     // gray-700
  accent: '#a78bfa',     // violet-400
} as const;

export const style = {
  brand: chalk.hex(colors.primary).bold,
  heading: chalk.hex(colors.secondary).bold,
  success: chalk.hex(colors.success),
  warning: chalk.hex(colors.warning),
  error: chalk.hex(colors.error),
  muted: chalk.hex(colors.muted),
  accent: chalk.hex(colors.accent),
  bold: chalk.bold,
  dim: chalk.dim,
  highlight: chalk.hex(colors.primary),
} as const;

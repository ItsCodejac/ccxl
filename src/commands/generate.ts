import path from 'node:path';
import type { Command } from 'commander';
import fs from 'fs-extra';
import { style } from '../tui/theme.js';
import { analyzeProject } from '../analyzer/index.js';
import {
  runPipeline,
  settingsGenerator,
  skillsGenerator,
  hooksGenerator,
  agentsGenerator,
  mcpGenerator,
  claudeMdGenerator,
  crossToolGenerator,
} from '../generators/index.js';
import type { Generator, GeneratedFile } from '../generators/index.js';

const generatorMap: Record<string, Generator> = {
  settings: settingsGenerator,
  skills: skillsGenerator,
  hooks: hooksGenerator,
  agents: agentsGenerator,
  mcp: mcpGenerator,
  'claude-md': claudeMdGenerator,
  'cross-tool': crossToolGenerator,
};

async function runAndOutput(
  generators: Generator[] | 'all',
  options: { dryRun?: boolean; preview?: boolean },
): Promise<void> {
  const root = process.cwd();

  console.log(style.highlight('Scanning project...'));
  const analysis = await analyzeProject(root);

  let files: GeneratedFile[];
  if (generators === 'all') {
    files = await runPipeline(analysis, root);
  } else {
    files = [];
    for (const gen of generators) {
      const result = await gen.generate(analysis, root);
      files.push(...result.files);
    }
  }

  if (files.length === 0) {
    console.log(style.muted('No files to generate.'));
    return;
  }

  console.log(style.heading(`\nFiles (${files.length}):`));
  for (const file of files) {
    console.log(`  ${style.success('+')} ${file.path}`);
  }

  if (options.preview) {
    console.log();
    for (const file of files) {
      console.log(style.heading(`--- ${file.path} ---`));
      console.log(style.muted(file.content));
      console.log();
    }
  }

  if (options.dryRun) {
    console.log(`\n${style.muted('Dry run — no files written')}`);
    return;
  }

  for (const file of files) {
    const fullPath = path.join(root, file.path);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, file.content);
  }

  console.log(`\n${style.success('✓')} ${style.bold(`${files.length} files written`)}`);
}

export function registerGenerateCommand(program: Command): void {
  const generate = program
    .command('generate')
    .description('Generate specific config layers')
    .option('-n, --dry-run', 'Show what would be generated without writing')
    .option('-p, --preview', 'Preview generated content before writing')
    .option('-t, --target <tool>', 'Target tool (claude|cursor|copilot|windsurf|all)', 'all');

  for (const [name, generator] of Object.entries(generatorMap)) {
    generate
      .command(name)
      .description(`Generate ${name} config`)
      .action(async (_, cmd) => {
        const opts = cmd.parent?.opts() ?? {};
        await runAndOutput([generator], opts);
      });
  }

  generate
    .command('all')
    .description('Generate all config layers')
    .action(async (_, cmd) => {
      const opts = cmd.parent?.opts() ?? {};
      await runAndOutput('all', opts);
    });

  generate.action(async (options) => {
    await runAndOutput('all', options);
  });
}

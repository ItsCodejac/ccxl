import path from 'node:path';
import type { Command } from 'commander';
import fs from 'fs-extra';
import { style } from '../tui/theme.js';
import { analyzeProject } from '../analyzer/index.js';
import { runPipeline, createGlobalAnalysis, getTargetRoot } from '../generators/pipeline.js';
import type { ProjectAnalysis } from '../types/index.js';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Scan project and generate full AI assistant config')
    .option('-n, --dry-run', 'Show what would be generated without writing files')
    .option('-y, --yes', 'Skip all prompts, use smart defaults')
    .option('-q, --quiet', 'Minimal output')
    .option('-v, --verbose', 'Detailed output')
    .option('-f, --force', 'Overwrite existing configs')
    .option('-g, --global', 'Install universal configs to ~/.claude/')
    .action(async (options) => {
      const scope = options.global ? 'global' as const : 'project' as const;
      const projectRoot = process.cwd();

      if (options.yes || options.dryRun || options.global) {
        let analysis: ProjectAnalysis;

        if (options.global) {
          console.log(style.highlight('Installing global config to ~/.claude/'));
          analysis = createGlobalAnalysis();
        } else {
          console.log(style.highlight('Scanning project...'));
          analysis = await analyzeProject(projectRoot);
          printAnalysis(analysis);
        }

        console.log(style.highlight('\nGenerating configs...'));
        const targetRoot = getTargetRoot(scope, projectRoot);
        const files = await runPipeline(analysis, projectRoot, { merge: !options.force, scope });

        const newFiles = files.filter((f) => f.status === 'new');
        const modifiedFiles = files.filter((f) => f.status === 'modified');
        const unchangedFiles = files.filter((f) => f.status === 'unchanged');

        console.log(style.heading(`\nFiles (${newFiles.length} new, ${modifiedFiles.length} merged, ${unchangedFiles.length} skipped):`));
        for (const file of files) {
          const icon = file.status === 'new' ? style.success('+')
            : file.status === 'modified' ? style.warning('~')
            : style.muted('=');
          console.log(`  ${icon} ${file.path} ${style.muted(`(${file.status})`)}`);
        }

        if (options.dryRun) {
          console.log(`\n${style.muted('Dry run — no files written')}`);
          return;
        }

        const toWrite = files.filter((f) => f.status !== 'unchanged');
        for (const file of toWrite) {
          const fullPath = path.join(targetRoot, file.path);
          await fs.ensureDir(path.dirname(fullPath));
          await fs.writeFile(fullPath, file.content);
        }

        console.log(`\n${style.success('✓')} ${style.bold(`${toWrite.length} files written`)}${unchangedFiles.length > 0 ? ` (${unchangedFiles.length} existing preserved)` : ''}`);
        console.log(style.muted(options.global ? 'Global config installed.' : 'Run `claude` to start using your new config.'));
        return;
      }

      // Interactive mode: render TUI
      const React = await import('react');
      const { render } = await import('ink');
      const { version } = await import('../index.js');
      const { InitView } = await import('../tui/views/InitView.js');

      render(React.createElement(InitView, { version }));
    });
}

function printAnalysis(analysis: ProjectAnalysis): void {
  console.log();
  console.log(style.bold(`Project: ${analysis.name}`));
  console.log(style.muted(analysis.root));
  console.log();

  if (analysis.languages.length > 0) {
    console.log(style.heading('Languages'));
    for (const l of analysis.languages) {
      console.log(`  ${style.success(l.name)} ${style.muted(`(${l.configFiles.join(', ')})`)}`);
    }
    console.log();
  }

  if (analysis.frameworks.length > 0) {
    console.log(style.heading('Frameworks'));
    for (const f of analysis.frameworks) {
      console.log(`  ${style.success(f.name)} ${style.muted(`[${f.category}]`)}${f.version ? ` ${style.muted(f.version)}` : ''}`);
    }
    console.log();
  }

  if (analysis.packageManager) {
    console.log(style.heading('Package Manager'));
    console.log(`  ${style.success(analysis.packageManager.name)} ${style.muted(`(${analysis.packageManager.lockfile})`)}`);
    console.log();
  }

  if (analysis.ci.length > 0) {
    console.log(style.heading('CI/CD'));
    for (const c of analysis.ci) console.log(`  ${style.success(c.name)}`);
    console.log();
  }

  if (analysis.cloud.length > 0) {
    console.log(style.heading('Cloud'));
    for (const c of analysis.cloud) console.log(`  ${style.success(c.name)}${c.services.length ? ` ${style.muted(`(${c.services.join(', ')})`)}` : ''}`);
    console.log();
  }

  if (analysis.databases.length > 0) {
    console.log(style.heading('Databases'));
    for (const d of analysis.databases) console.log(`  ${style.success(d.name)} ${style.muted(`[${d.type}]`)}`);
    console.log();
  }

  if (analysis.docker) {
    console.log(style.heading('Docker'));
    if (analysis.docker.hasDockerfile) console.log(`  ${style.success('Dockerfile')}`);
    if (analysis.docker.hasCompose) console.log(`  ${style.success('Docker Compose')}`);
    console.log();
  }

  console.log(style.heading('AI Tool Configs'));
  for (const c of analysis.existingConfigs) {
    const icon = c.exists ? style.success('✓') : style.muted('✗');
    const features = c.exists && c.features.length > 0 ? ` ${style.muted(`(${c.features.join(', ')})`)}` : '';
    console.log(`  ${icon} ${c.tool}${features}`);
  }
}

import type { Command } from 'commander';
import { style } from '../tui/theme.js';
import { searchPackages } from '../registry/search.js';
import { listInstalled } from '../registry/list.js';
import { installPackage } from '../registry/install.js';
import { uninstallPackage } from '../registry/uninstall.js';

export function registerRegistryCommand(program: Command): void {
  const registry = program
    .command('registry')
    .description('Browse and manage the community config registry');

  registry
    .command('search <query>')
    .description('Search for config packages on GitHub')
    .action(async (query: string) => {
      try {
        console.log(style.highlight(`Searching for "${query}"...`));
        const results = await searchPackages(query);

        if (results.length === 0) {
          console.log(style.muted('No packages found.'));
          console.log(style.muted('Tip: Packages need the "ccxl-package" topic on GitHub to be discoverable.'));
          return;
        }

        console.log(style.heading(`\nFound ${results.length} packages:\n`));
        for (const r of results) {
          console.log(`  ${style.bold(r.fullName)} ${style.muted(`★ ${r.stars}`)}`);
          if (r.description) console.log(`    ${style.muted(r.description)}`);
          console.log(`    ${style.highlight(`ccxl install ${r.fullName}`)}`);
          console.log();
        }
      } catch (err) {
        console.log(style.error((err as Error).message));
      }
    });

  registry
    .command('list')
    .description('List installed config packages')
    .action(async () => {
      const root = process.cwd();
      const packages = await listInstalled(root);

      if (packages.length === 0) {
        console.log(style.muted('No packages installed.'));
        console.log(style.muted('Install one with: ccxl install user/repo'));
        return;
      }

      console.log(style.heading(`Installed packages (${packages.length}):\n`));
      for (const pkg of packages) {
        console.log(`  ${style.bold(pkg.name)} ${style.muted(`v${pkg.version}`)} from ${style.muted(pkg.source)}`);
        console.log(`    ${pkg.files.length} files installed`);
      }
    });

  registry
    .command('browse')
    .description('Browse available config packages in TUI')
    .action(async () => {
      // Interactive browse — for now, prompt and search
      console.log(style.highlight('Browse ccxl packages\n'));
      console.log(style.muted('Use `ccxl registry search <query>` to find packages.'));
      console.log(style.muted('Popular categories: skills, hooks, agents, security, react, python\n'));
      console.log('Example searches:');
      console.log(`  ${style.highlight('ccxl registry search react')}`);
      console.log(`  ${style.highlight('ccxl registry search security')}`);
      console.log(`  ${style.highlight('ccxl registry search python')}`);
    });

  registry
    .command('publish')
    .description('Publish a config package to the registry')
    .action(() => {
      console.log(style.heading('How to publish a ccxl package:\n'));
      console.log('1. Create a ccxl-package.json in your repo root:');
      console.log(style.muted(`   {
     "name": "my-package",
     "version": "1.0.0",
     "description": "What it does",
     "type": "skill",
     "files": ["skills/my-skill/SKILL.md"],
     "keywords": ["react", "testing"]
   }`));
      console.log();
      console.log('2. Add the topic "ccxl-package" to your GitHub repo');
      console.log('   (Settings → Topics → add "ccxl-package")');
      console.log();
      console.log('3. Push to GitHub — immediately installable:');
      console.log(style.highlight('   ccxl install your-username/your-repo'));
    });

  registry
    .command('uninstall <name>')
    .description('Uninstall a config package')
    .action(async (name: string) => {
      const root = process.cwd();
      try {
        await uninstallPackage(name, root);
        console.log(`${style.success('✓')} Uninstalled ${style.bold(name)}`);
      } catch (err) {
        console.log(style.error((err as Error).message));
      }
    });

  registry.action(() => {
    console.log(style.heading('ccxl registry\n'));
    console.log('Commands:');
    console.log(`  ${style.bold('search <query>')}  Search for packages on GitHub`);
    console.log(`  ${style.bold('list')}            List installed packages`);
    console.log(`  ${style.bold('browse')}          Browse packages`);
    console.log(`  ${style.bold('publish')}         How to publish a package`);
    console.log(`  ${style.bold('uninstall <name>')} Remove an installed package`);
  });
}

import path from 'node:path';
import fs from 'fs-extra';
import { execSync } from 'node:child_process';

export interface DiagnosticResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  fixable?: boolean;
}

export async function runDiagnostics(
  root: string,
  options: { fix?: boolean } = {},
): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  // 1. settings.json exists and is valid
  const settingsPath = path.join(root, '.claude', 'settings.json');
  if (await fs.pathExists(settingsPath)) {
    try {
      const content = await fs.readFile(settingsPath, 'utf-8');
      JSON.parse(content);
      results.push({ name: 'settings.json', status: 'pass', message: 'Valid JSON' });
    } catch {
      results.push({ name: 'settings.json', status: 'fail', message: 'Invalid JSON' });
    }
  } else {
    results.push({ name: 'settings.json', status: 'fail', message: 'Not found — run `ccxl init`' });
  }

  // 2. Permissions defined
  if (await fs.pathExists(settingsPath)) {
    try {
      const settings = await fs.readJson(settingsPath);
      if (settings.permissions?.allow?.length > 0 || settings.permissions?.deny?.length > 0) {
        results.push({ name: 'Permissions', status: 'pass', message: `${settings.permissions.allow?.length ?? 0} allow, ${settings.permissions.deny?.length ?? 0} deny rules` });
      } else {
        results.push({ name: 'Permissions', status: 'warn', message: 'No permission rules defined' });
      }
    } catch {
      results.push({ name: 'Permissions', status: 'warn', message: 'Could not read settings' });
    }
  }

  // 3. CLAUDE.md exists
  if (await fs.pathExists(path.join(root, 'CLAUDE.md'))) {
    results.push({ name: 'CLAUDE.md', status: 'pass', message: 'Present' });
  } else {
    results.push({ name: 'CLAUDE.md', status: 'warn', message: 'Not found — run `ccxl init` or `ccxl generate claude-md`' });
  }

  // 4. Skills directory
  const skillsDir = path.join(root, '.claude', 'skills');
  if (await fs.pathExists(skillsDir)) {
    const skills = await fs.readdir(skillsDir);
    results.push({ name: 'Skills', status: 'pass', message: `${skills.length} skills installed` });
  } else {
    results.push({ name: 'Skills', status: 'warn', message: 'No skills directory' });
  }

  // 5. Hook scripts executable
  const hooksDir = path.join(root, '.claude', 'hooks');
  if (await fs.pathExists(hooksDir)) {
    const hooks = (await fs.readdir(hooksDir)).filter((f) => f.endsWith('.sh'));
    let nonExecutable = 0;
    for (const hook of hooks) {
      const hookPath = path.join(hooksDir, hook);
      try {
        await fs.access(hookPath, fs.constants.X_OK);
      } catch {
        nonExecutable++;
        if (options.fix) {
          execSync(`chmod +x "${hookPath}"`);
        }
      }
    }
    if (nonExecutable > 0 && !options.fix) {
      results.push({ name: 'Hook permissions', status: 'warn', message: `${nonExecutable} scripts not executable — run with --fix`, fixable: true });
    } else if (nonExecutable > 0 && options.fix) {
      results.push({ name: 'Hook permissions', status: 'pass', message: `Fixed ${nonExecutable} scripts` });
    } else {
      results.push({ name: 'Hook permissions', status: 'pass', message: `${hooks.length} scripts executable` });
    }
  }

  // 6. ccxl-packages.json valid if present
  const pkgRegistry = path.join(root, '.claude', 'ccxl-packages.json');
  if (await fs.pathExists(pkgRegistry)) {
    try {
      const data = await fs.readJson(pkgRegistry);
      if (Array.isArray(data.packages)) {
        results.push({ name: 'Package registry', status: 'pass', message: `${data.packages.length} packages tracked` });
      } else {
        results.push({ name: 'Package registry', status: 'fail', message: 'Invalid format — missing packages array' });
      }
    } catch {
      results.push({ name: 'Package registry', status: 'fail', message: 'Invalid JSON' });
    }
  }

  // 7. No conflicting configs
  const hasLegacyCursor = await fs.pathExists(path.join(root, '.cursorrules'));
  const hasModernCursor = await fs.pathExists(path.join(root, '.cursor', 'rules'));
  if (hasLegacyCursor && hasModernCursor) {
    results.push({ name: 'Config conflicts', status: 'warn', message: 'Both .cursorrules and .cursor/rules/ exist — modern format takes priority' });
  } else {
    results.push({ name: 'Config conflicts', status: 'pass', message: 'No conflicts detected' });
  }

  return results;
}

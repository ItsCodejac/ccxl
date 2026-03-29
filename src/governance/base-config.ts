import path from 'node:path';
import fs from 'fs-extra';
import { BaseConfigSchema } from './types.js';
import type { BaseConfig, GovernanceReport, PolicyViolation, PolicyRule } from './types.js';

export async function loadBaseConfig(root: string): Promise<BaseConfig | null> {
  const configPath = path.join(root, '.claude', 'base-config.json');
  if (!await fs.pathExists(configPath)) return null;
  const data = await fs.readJson(configPath);
  return BaseConfigSchema.parse(data);
}

export async function checkCompliance(
  root: string,
  baseConfig: BaseConfig,
): Promise<GovernanceReport> {
  const settingsPath = path.join(root, '.claude', 'settings.json');
  const violations: PolicyViolation[] = [];

  let settings: Record<string, unknown> = {};
  if (await fs.pathExists(settingsPath)) {
    settings = await fs.readJson(settingsPath) as Record<string, unknown>;
  }

  const permissions = (settings['permissions'] ?? {}) as {
    allow?: string[];
    ask?: string[];
    deny?: string[];
  };

  for (const rule of baseConfig.policies) {
    const violation = checkRule(rule, permissions, root);
    if (violation) violations.push(violation);
  }

  return {
    compliant: violations.length === 0,
    violations,
    policies: baseConfig.policies.length,
  };
}

function checkRule(
  rule: PolicyRule,
  permissions: { allow?: string[]; ask?: string[]; deny?: string[] },
  _root: string,
): PolicyViolation | null {
  const [category, key] = rule.target.split(':') as [string, string];

  if (rule.type === 'require') {
    if (category === 'permission') {
      const list = permissions[key as 'allow' | 'ask' | 'deny'] ?? [];
      if (!list.includes(rule.value)) {
        return {
          rule,
          message: rule.message ?? `Required ${key} rule missing: ${rule.value}`,
        };
      }
    }
  }

  if (rule.type === 'deny') {
    if (category === 'permission') {
      const list = permissions[key as 'allow' | 'ask' | 'deny'] ?? [];
      if (list.includes(rule.value)) {
        return {
          rule,
          message: rule.message ?? `Disallowed ${key} rule found: ${rule.value}`,
        };
      }
    }
  }

  if (rule.type === 'enforce') {
    // Hook enforcement — check hooks config
    if (category === 'hook') {
      // Simplified: check if hook script exists
      // Full implementation would check settings.json hooks config
    }
  }

  return null;
}

export async function applyBaseConfig(root: string, baseConfig: BaseConfig): Promise<void> {
  const configPath = path.join(root, '.claude', 'base-config.json');
  await fs.ensureDir(path.dirname(configPath));
  await fs.writeJson(configPath, baseConfig, { spaces: 2 });
}

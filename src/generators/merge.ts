import path from 'node:path';
import fs from 'fs-extra';
import type { GeneratedFile } from './types.js';

export async function mergeWithExisting(
  root: string,
  files: GeneratedFile[],
): Promise<GeneratedFile[]> {
  const result: GeneratedFile[] = [];

  for (const file of files) {
    const fullPath = path.join(root, file.path);
    const exists = await fs.pathExists(fullPath);

    if (!exists) {
      result.push({ ...file, status: 'new' });
      continue;
    }

    // Determine merge strategy by file type
    if (file.path.endsWith('.json')) {
      const merged = await mergeJsonFile(fullPath, file);
      result.push(merged);
    } else {
      // Markdown, shell scripts, agent files — skip if exists
      result.push({ ...file, status: 'unchanged' });
    }
  }

  return result;
}

async function mergeJsonFile(
  existingPath: string,
  generated: GeneratedFile,
): Promise<GeneratedFile> {
  const existingContent = await fs.readFile(existingPath, 'utf-8');
  let existing: Record<string, unknown>;
  try {
    existing = JSON.parse(existingContent) as Record<string, unknown>;
  } catch {
    // Existing file is invalid JSON — overwrite
    return { ...generated, status: 'modified' };
  }

  const incoming = JSON.parse(generated.content) as Record<string, unknown>;

  if (generated.path.includes('settings.json')) {
    const merged = mergeSettings(existing, incoming);
    return {
      ...generated,
      content: JSON.stringify(merged, null, 2),
      status: 'modified',
    };
  }

  // Generic JSON merge — existing keys take precedence
  const merged = { ...incoming, ...existing };
  const mergedStr = JSON.stringify(merged, null, 2);
  if (mergedStr === existingContent.trim()) {
    return { ...generated, status: 'unchanged' };
  }
  return { ...generated, content: mergedStr, status: 'modified' };
}

function mergeSettings(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...existing };

  // Merge permissions (union arrays)
  const existingPerms = (existing['permissions'] ?? {}) as Record<string, unknown>;
  const incomingPerms = (incoming['permissions'] ?? {}) as Record<string, unknown>;

  if (incomingPerms) {
    const mergedPerms: Record<string, unknown> = { ...existingPerms };
    for (const key of ['allow', 'ask', 'deny'] as const) {
      const existArr = (existingPerms[key] ?? []) as string[];
      const incomArr = (incomingPerms[key] ?? []) as string[];
      mergedPerms[key] = [...new Set([...existArr, ...incomArr])];
    }
    result['permissions'] = mergedPerms;
  }

  // Merge env (existing values take precedence)
  const existingEnv = (existing['env'] ?? {}) as Record<string, string>;
  const incomingEnv = (incoming['env'] ?? {}) as Record<string, string>;
  if (Object.keys(incomingEnv).length > 0) {
    result['env'] = { ...incomingEnv, ...existingEnv };
  }

  // Merge hooks (concatenate arrays per event)
  const existingHooks = (existing['hooks'] ?? {}) as Record<string, unknown[]>;
  const incomingHooks = (incoming['hooks'] ?? {}) as Record<string, unknown[]>;
  if (Object.keys(incomingHooks).length > 0) {
    const mergedHooks: Record<string, unknown[]> = { ...existingHooks };
    for (const [event, hooks] of Object.entries(incomingHooks)) {
      mergedHooks[event] = [...(existingHooks[event] ?? []), ...hooks];
    }
    result['hooks'] = mergedHooks;
  }

  return result;
}

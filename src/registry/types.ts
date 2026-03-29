import { z } from 'zod';

export const PackageManifestSchema = z.object({
  name: z.string().min(1).max(64),
  version: z.string().regex(/^\d+\.\d+\.\d+/),
  description: z.string().max(250),
  author: z.string().optional(),
  type: z.enum(['skill', 'hook', 'agent', 'config', 'bundle']),
  files: z.array(z.string()).min(1),
  keywords: z.array(z.string()).default([]),
  compatibility: z.object({
    languages: z.array(z.string()).optional(),
    frameworks: z.array(z.string()).optional(),
  }).optional(),
});

export const InstalledPackageSchema = z.object({
  name: z.string(),
  version: z.string(),
  source: z.string(),
  installedAt: z.string(),
  files: z.array(z.string()),
});

export const PackageRegistrySchema = z.object({
  packages: z.array(InstalledPackageSchema),
});

export type PackageManifest = z.infer<typeof PackageManifestSchema>;
export type InstalledPackage = z.infer<typeof InstalledPackageSchema>;
export type PackageRegistry = z.infer<typeof PackageRegistrySchema>;

export interface SearchResult {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  url: string;
}

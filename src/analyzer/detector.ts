import type {
  LanguageInfo,
  FrameworkInfo,
  PackageManagerInfo,
  MonorepoInfo,
  CIProviderInfo,
  CloudProviderInfo,
  DatabaseInfo,
  DockerInfo,
  ExistingConfigInfo,
} from '../types/index.js';

export type DetectorResult =
  | { type: 'languages'; data: LanguageInfo[] }
  | { type: 'frameworks'; data: FrameworkInfo[] }
  | { type: 'packageManager'; data: PackageManagerInfo | null }
  | { type: 'monorepo'; data: MonorepoInfo | null }
  | { type: 'ci'; data: CIProviderInfo[] }
  | { type: 'cloud'; data: CloudProviderInfo[] }
  | { type: 'databases'; data: DatabaseInfo[] }
  | { type: 'docker'; data: DockerInfo | null }
  | { type: 'existingConfigs'; data: ExistingConfigInfo[] };

export interface Detector {
  name: string;
  detect(root: string): Promise<DetectorResult>;
}

export class DetectorRegistry {
  private detectors: Detector[] = [];

  register(detector: Detector): void {
    this.detectors.push(detector);
  }

  async runAll(root: string): Promise<DetectorResult[]> {
    const results = await Promise.allSettled(
      this.detectors.map((d) => d.detect(root)),
    );

    const successful: DetectorResult[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i]!;
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        console.warn(
          `Detector "${this.detectors[i]!.name}" failed: ${result.reason}`,
        );
      }
    }

    return successful;
  }
}

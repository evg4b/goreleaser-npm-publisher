import { join } from 'node:path';

export class Context {
  constructor(private readonly projectPath: string) {}

  public get artifactsPath(): string {
    return join(this.projectPath, 'dist', 'artifacts.json');
  }

  public get metadataPath(): string {
    return join(this.projectPath, 'dist', 'metadata.json');
  }

  public get distPath(): string {
    return join(this.projectPath, 'dist', 'npm');
  }

  public pathToDist(...path: string[]): string {
    return join(this.distPath, ...path);
  }

  public packageJson(folder: string): string {
    return join(this.projectPath, 'dist', 'npm', folder, 'package.json');
  }
}

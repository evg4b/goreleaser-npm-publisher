import { kebabCase } from 'lodash';
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

  public packageFolder(...[packageName, ...other]: string[]): string {
    return join(this.distPath, kebabCase(packageName), ...other);
  }

  public packageJson(packageName: string): string {
    return join(this.projectPath, 'dist', 'npm', kebabCase(packageName), 'package.json');
  }
}

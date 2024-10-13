import { kebabCase } from 'lodash';
import { join, resolve } from 'node:path';
import { cwd } from 'node:process';

export class Context {
  private readonly projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = resolve(cwd(), projectPath);
  }

  public get artifactsPath(): string {
    return join(this.projectPath, 'dist', 'artifacts.json');
  }

  public get metadataPath(): string {
    return join(this.projectPath, 'dist', 'metadata.json');
  }

  public get distPath(): string {
    return join(this.projectPath, 'dist', 'npm');
  }

  public project(...parts: string[]): string {
    return join(this.projectPath, ...parts);
  }

  public packageFolder(...[packageName, ...other]: string[]): string {
    return join(this.distPath, kebabCase(packageName), ...other);
  }

  public packageJson(packageName: string): string {
    return join(this.projectPath, 'dist', 'npm', kebabCase(packageName), 'package.json');
  }
}

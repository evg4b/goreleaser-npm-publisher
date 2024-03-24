import * as console from 'console';
import { readFile, mkdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';

const projectPath = '/Users/evg4b/Desktop/go-package';
const buildName = 'go-package';

(async () => {
  const configPath = join(projectPath, 'dist', 'config.yaml');

  const file = await readFile(configPath, 'utf8');
  const { project_name, builds } = parse(file) as GoReleaserConfiguration;
  const targetBuild = builds?.find((build: any) => build.id === buildName);
  await unlink(join(projectPath, 'dist', 'npm')).catch(() => {});
  await mkdir(join(projectPath, 'dist', 'npm'), { recursive: true });

  console.log(project_name, targetBuild);
})();

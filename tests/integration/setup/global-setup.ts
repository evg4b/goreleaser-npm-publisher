import { exportEnvironment, cliPath, createUser, writeNpmrc, startVerdaccio, createWorkspace } from '../support';
import { access } from 'node:fs/promises';
import { rememberSetup } from './state';
import { join } from 'node:path';

export default async (): Promise<void> => {
  await assertCliIsBuilt();

  const workspacePath = await createWorkspace();
  const server = await startVerdaccio(workspacePath);
  const token = await createUser(server.url, {
    name: 'integration',
    password: 'integration-password',
    email: 'integration@example.com',
  });
  const npmrcPath = join(workspacePath, '.npmrc');
  await writeNpmrc(npmrcPath, server.url, token);

  exportEnvironment({
    registryUrl: server.url,
    npmrcPath,
    npmCachePath: join(workspacePath, 'npm-cache'),
    workspacePath,
  });
  rememberSetup({ server, workspacePath });

  console.log(`\nIntegration registry: ${server.url} (workspace: ${workspacePath})`);
};

const assertCliIsBuilt = async (): Promise<void> => {
  try {
    await access(cliPath);
  } catch {
    throw new Error(`${cliPath} is missing. Run "yarn build" before the integration tests.`);
  }
};

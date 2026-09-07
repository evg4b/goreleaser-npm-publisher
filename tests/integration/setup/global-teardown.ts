import { env } from 'node:process';
import { removeWorkspace } from '../support/workspace';
import { takeSetup } from './state';

const KEEP_WORKSPACE = 'INTEGRATION_KEEP_WORKSPACE';

export default async (): Promise<void> => {
  const state = takeSetup();
  if (!state) {
    return;
  }

  await state.server.stop();

  if (env[KEEP_WORKSPACE]) {
    console.log(`\nKeeping integration workspace: ${state.workspacePath}`);
    return;
  }

  await removeWorkspace(state.workspacePath);
};

import type { VerdaccioServer } from '../support/verdaccio';

export interface SetupState {
  server: VerdaccioServer;
  workspacePath: string;
}

interface IntegrationGlobals {
  __integrationSetup__?: SetupState;
}

const globals = globalThis as typeof globalThis & IntegrationGlobals;

export const rememberSetup = (state: SetupState): void => {
  globals.__integrationSetup__ = state;
};

export const takeSetup = (): SetupState | undefined => {
  const state = globals.__integrationSetup__;
  delete globals.__integrationSetup__;

  return state;
};

jest.mock('./execve', () => ({
  isExecveSupported: jest.fn().mockName('isExecveSupported'),
  runWithExecve: jest.fn().mockName('runWithExecve'),
}));

jest.mock('./spawn', () => ({
  runWithSpawn: jest.fn().mockName('runWithSpawn'),
}));

import { isExecveSupported, runWithExecve } from './execve';
import { run } from './run';
import { runWithSpawn } from './spawn';

describe('run', () => {
  const env = { PATH: '/usr/bin' };

  it('replaces the shim with the binary when execve is supported', () => {
    jest.mocked(isExecveSupported).mockReturnValue(true);

    run('/bin/tool', ['--flag'], env);

    expect(runWithExecve).toHaveBeenCalledWith('/bin/tool', ['--flag'], env);
    expect(runWithSpawn).not.toHaveBeenCalled();
  });

  it('falls back to a child process when execve is not supported', () => {
    jest.mocked(isExecveSupported).mockReturnValue(false);

    run('/bin/tool', ['--flag'], env);

    expect(runWithSpawn).toHaveBeenCalledWith('/bin/tool', ['--flag'], env);
    expect(runWithExecve).not.toHaveBeenCalled();
  });
});

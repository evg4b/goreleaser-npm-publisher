jest.mock('./execve', () => ({
  canExecve: jest.fn().mockName('canExecve'),
  runWithExecve: jest.fn().mockName('runWithExecve'),
}));

jest.mock('./spawn', () => ({
  runWithSpawn: jest.fn().mockName('runWithSpawn'),
}));

import { canExecve, runWithExecve } from './execve';
import { run } from './run';
import { runWithSpawn } from './spawn';

describe('run', () => {
  const env = { PATH: '/usr/bin' };

  it('replaces the shim with the binary when execve can run it', () => {
    jest.mocked(canExecve).mockReturnValue(true);

    run('/bin/tool', ['--flag'], env);

    expect(runWithExecve).toHaveBeenCalledWith('/bin/tool', ['--flag'], env);
    expect(runWithSpawn).not.toHaveBeenCalled();
  });

  it('falls back to a child process when execve cannot', () => {
    jest.mocked(canExecve).mockReturnValue(false);

    run('/bin/tool', ['--flag'], env);

    expect(runWithSpawn).toHaveBeenCalledWith('/bin/tool', ['--flag'], env);
    expect(runWithExecve).not.toHaveBeenCalled();
  });
});

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

  it('runs the binary with execve when it can', async () => {
    jest.mocked(canExecve).mockResolvedValue(true);

    await run('/bin/tool', ['--flag'], env);

    expect(canExecve).toHaveBeenCalledWith('/bin/tool');
    expect(runWithExecve).toHaveBeenCalledWith('/bin/tool', ['--flag'], env);
    expect(runWithSpawn).not.toHaveBeenCalled();
  });

  it('runs the binary as a child process otherwise', async () => {
    jest.mocked(canExecve).mockResolvedValue(false);

    await run('/bin/tool', ['--flag'], env);

    expect(runWithSpawn).toHaveBeenCalledWith('/bin/tool', ['--flag'], env);
    expect(runWithExecve).not.toHaveBeenCalled();
  });
});

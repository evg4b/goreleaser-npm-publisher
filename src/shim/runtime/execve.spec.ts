import '@mocks/fs/access';
import { mockExecve, withoutExecve } from '@mocks/execve';

import { access, constants } from 'node:fs/promises';
import { canExecve, runWithExecve } from './execve';

describe('canExecve', () => {
  beforeEach(() => mockExecve());

  it('is true when node exposes process.execve and the binary is executable', async () => {
    await expect(canExecve('/bin/tool')).resolves.toBe(true);

    expect(access).toHaveBeenCalledWith('/bin/tool', constants.X_OK);
  });

  it('asks for the executable bit with the value node gives it', () => {
    expect(constants.X_OK).toBe(1);
  });

  it('is false on node versions and platforms without process.execve', async () => {
    withoutExecve();

    await expect(canExecve('/bin/tool')).resolves.toBe(false);
  });

  it('is false when the binary is not executable, which would abort the shim', async () => {
    jest.mocked(access).mockRejectedValue(new Error('EACCES'));

    await expect(canExecve('/bin/tool')).resolves.toBe(false);
  });
});

describe('runWithExecve', () => {
  const env = { PATH: '/usr/bin' };

  it('replaces the current process with the binary, keeping it as argv[0]', () => {
    const execve = mockExecve();

    runWithExecve('/bin/tool', ['--flag'], env);

    expect(execve).toHaveBeenCalledWith('/bin/tool', ['/bin/tool', '--flag'], env);
  });

  it('fails when process.execve is not available', () => {
    withoutExecve();

    expect(() => runWithExecve('/bin/tool', [], env)).toThrow('process.execve is not available on this platform');
  });
});

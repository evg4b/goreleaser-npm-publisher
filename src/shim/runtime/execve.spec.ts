import '@mocks/fs';
import { mockExecve, withoutExecve } from '@mocks/execve';

import { accessSync, constants } from 'node:fs';
import { canExecve, runWithExecve } from './execve';

describe('canExecve', () => {
  beforeEach(() => mockExecve());

  it('is true when node exposes process.execve and the binary is executable', () => {
    expect(canExecve('/bin/tool')).toBe(true);
    expect(accessSync).toHaveBeenCalledWith('/bin/tool', constants.X_OK);
  });

  it('is false on node versions and platforms without process.execve', () => {
    withoutExecve();

    expect(canExecve('/bin/tool')).toBe(false);
  });

  it('is false when the binary is not executable, which would abort the shim', () => {
    jest.mocked(accessSync).mockImplementation(() => {
      throw new Error('EACCES');
    });

    expect(canExecve('/bin/tool')).toBe(false);
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

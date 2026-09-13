import { mockExecve, withoutExecve } from '@mocks/execve';

import { isExecveSupported, runWithExecve } from './execve';

describe('isExecveSupported', () => {
  it('is true when the node build exposes process.execve', () => {
    mockExecve();

    expect(isExecveSupported()).toBe(true);
  });

  it('is false on node versions and platforms without process.execve', () => {
    withoutExecve();

    expect(isExecveSupported()).toBe(false);
  });
});

describe('runWithExecve', () => {
  const env = { PATH: '/usr/bin' };

  it('replaces the current process with the binary', () => {
    const execve = mockExecve();

    runWithExecve('/bin/tool', ['--flag'], env);

    expect(execve).toHaveBeenCalledWith('/bin/tool', ['/bin/tool', '--flag'], env);
  });

  it('fails when process.execve is not available', () => {
    withoutExecve();

    expect(() => runWithExecve('/bin/tool', [], env)).toThrow('process.execve is not available on this platform');
  });
});

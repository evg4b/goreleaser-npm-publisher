jest.mock('./helpers', () => ({
  isExecutable: jest.fn().mockName('isExecutable').mockResolvedValue(true),
  isWindows: jest.fn().mockName('isWindows').mockReturnValue(false),
}));

import { mockExecve, withoutExecve } from '@mocks/execve';

import { canExecve, runWithExecve } from './execve';
import { isExecutable, isWindows } from './helpers';

describe('canExecve', () => {
  beforeEach(() => mockExecve());

  it('is true when process.execve exists and the binary is executable', async () => {
    await expect(canExecve('/bin/tool')).resolves.toBe(true);

    expect(isExecutable).toHaveBeenCalledWith('/bin/tool');
  });

  it('is false without process.execve', async () => {
    withoutExecve();

    await expect(canExecve('/bin/tool')).resolves.toBe(false);
  });

  it('is false on windows', async () => {
    jest.mocked(isWindows).mockReturnValueOnce(true);

    await expect(canExecve('/bin/tool')).resolves.toBe(false);
  });

  it('is false when the binary is not executable', async () => {
    jest.mocked(isExecutable).mockResolvedValueOnce(false);

    await expect(canExecve('/bin/tool')).resolves.toBe(false);
  });
});

describe('runWithExecve', () => {
  it('replaces the process with the binary, keeping it as argv[0]', () => {
    const execve = mockExecve();
    const env = { PATH: '/usr/bin' };

    runWithExecve('/bin/tool', ['--flag'], env);

    expect(execve).toHaveBeenCalledWith('/bin/tool', ['/bin/tool', '--flag'], env);
  });
});

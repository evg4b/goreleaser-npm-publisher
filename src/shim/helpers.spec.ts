import '@mocks/os';
import '@mocks/fs/access';
import { mockExit, ProcessExited } from '@mocks/exit';

import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { platform } from 'node:os';
import { fail, isExecutable, isWindows } from './helpers';

describe('isWindows', () => {
  it('is true on windows', () => {
    jest.mocked(platform).mockReturnValueOnce('win32');

    expect(isWindows()).toBe(true);
  });

  it('is false elsewhere', () => {
    expect(isWindows()).toBe(false);
  });
});

describe('isExecutable', () => {
  it('is true when the file can be executed', async () => {
    await expect(isExecutable('/bin/tool')).resolves.toBe(true);

    expect(access).toHaveBeenCalledWith('/bin/tool', constants.X_OK);
  });

  it('is false when the file cannot be executed', async () => {
    jest.mocked(access).mockRejectedValueOnce(new Error('EACCES'));

    await expect(isExecutable('/bin/tool')).resolves.toBe(false);
  });
});

describe('fail', () => {
  let error: jest.SpyInstance;

  beforeEach(() => (error = jest.spyOn(console, 'error').mockImplementation(() => undefined)));

  afterEach(() => error.mockRestore());

  it('reports the message and exits with 1', () => {
    const exit = mockExit();

    expect(() => fail('boom')).toThrow(ProcessExited);

    expect(error).toHaveBeenCalledWith('boom');
    expect(exit).toHaveBeenCalledWith(1);
  });
});

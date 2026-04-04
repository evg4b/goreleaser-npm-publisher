const npmExecMock = jest.fn();
jest.mock('./exec', () => ({ npmExec: npmExecMock }));

import { whoami } from './whoami';

describe('whoami', () => {
  it('should call npmExec with whoami args', async () => {
    npmExecMock.mockResolvedValue('evg4b');

    await whoami('/tmp/pkg', { token: 'abc' });

    expect(npmExecMock).toHaveBeenCalledWith(['whoami'], {
      pwd: '/tmp/pkg',
      token: 'abc',
    });
  });

  it('should work without arguments', async () => {
    npmExecMock.mockResolvedValue('evg4b');

    await whoami();

    expect(npmExecMock).toHaveBeenCalledWith(['whoami'], {
      pwd: undefined,
      token: undefined,
    });
  });

  it('should return the username', async () => {
    npmExecMock.mockResolvedValue('evg4b');

    const result = await whoami();

    expect(result).toBe('evg4b');
  });
});

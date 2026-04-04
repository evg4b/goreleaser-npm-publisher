const npmExecMock = jest.fn();
jest.mock('./exec', () => ({ npmExec: npmExecMock }));

import { publish } from './publish';

describe('publish', () => {
  it('should call npmExec with publish args', async () => {
    npmExecMock.mockResolvedValue({ id: 'pkg@1.0.0' });

    await publish('/tmp/pkg', { token: 'abc' });

    expect(npmExecMock).toHaveBeenCalledWith(['publish', '--access', 'public'], {
      pwd: '/tmp/pkg',
      token: 'abc',
    });
  });

  it('should work without arguments', async () => {
    npmExecMock.mockResolvedValue({ id: 'pkg@1.0.0' });

    await publish();

    expect(npmExecMock).toHaveBeenCalledWith(['publish', '--access', 'public'], {
      pwd: undefined,
      token: undefined,
    });
  });
});

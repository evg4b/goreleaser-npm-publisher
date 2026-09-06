import '@mocks/npm/exec';

import { npmExec } from '@npm/exec';
import { whoami } from './whoami';

describe('whoami', () => {
  it('should call npmExec with whoami args', async () => {
    jest.mocked(npmExec).mockResolvedValue('evg4b');

    await whoami('/tmp/pkg', { token: 'abc' });

    expect(npmExec).toHaveBeenCalledWith(['whoami'], {
      pwd: '/tmp/pkg',
      token: 'abc',
    });
  });

  it('should work without arguments', async () => {
    jest.mocked(npmExec).mockResolvedValue('evg4b');

    await whoami();

    expect(npmExec).toHaveBeenCalledWith(['whoami'], {
      pwd: undefined,
      token: undefined,
    });
  });

  it('should return the username', async () => {
    jest.mocked(npmExec).mockResolvedValue('evg4b');

    const result = await whoami();

    expect(result).toBe('evg4b');
  });
});

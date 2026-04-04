/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const npmExecMock = jest.fn();
jest.mock('./exec', () => ({ npmExec: npmExecMock }));

import { publish } from './publish';

const mockResponse = {
  id: 'pkg@1.0.0',
  name: 'pkg',
  version: '1.0.0',
  size: 100,
  unpackedSize: 200,
  shasum: 'abc',
  integrity: 'sha512-abc',
  filename: 'pkg-1.0.0.tgz',
  files: [],
  entryCount: 0,
  bundled: [],
};

beforeEach(() => {
  npmExecMock.mockResolvedValue(mockResponse);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('publish', () => {
  it('should publish with --access public', async () => {
    await publish('/some/path');
    const args = npmExecMock.mock.calls[0][0] as string[];
    expect(args).toContain('--access');
    expect(args).toContain('public');
  });

  it('should pass token to exec context', async () => {
    await publish('/some/path', { token: 'mytoken' });
    const context = npmExecMock.mock.calls[0][1] as { token?: string };
    expect(context.token).toBe('mytoken');
  });

  it('should not include --otp flag when otp is not provided', async () => {
    await publish('/some/path');
    const args = npmExecMock.mock.calls[0][0] as string[];
    expect(args).not.toContain('--otp');
  });

  it('should include --otp flag when otp is provided', async () => {
    await publish('/some/path', { otp: '123456' });
    const args = npmExecMock.mock.calls[0][0] as string[];
    expect(args).toContain('--otp');
    expect(args).toContain('123456');
  });

  it('should pass otp to exec context', async () => {
    await publish('/some/path', { otp: '123456' });
    const context = npmExecMock.mock.calls[0][1] as { otp?: string };
    expect(context.otp).toBe('123456');
  });

  it('should pass pwd to exec context', async () => {
    await publish('/some/path');
    const context = npmExecMock.mock.calls[0][1] as { pwd?: string };
    expect(context.pwd).toBe('/some/path');
  });

  it('should work without arguments', async () => {
    await publish();
    const context = npmExecMock.mock.calls[0][1] as { pwd?: string; token?: string };
    expect(context.pwd).toBeUndefined();
    expect(context.token).toBeUndefined();
  });
});

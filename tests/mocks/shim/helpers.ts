import { isExecutable, isWindows } from '@shim/helpers';

jest.mock('@shim/helpers', () => ({
  fail: jest.fn().mockName('fail'),
  isExecutable: jest.fn().mockName('isExecutable'),
  isWindows: jest.fn().mockName('isWindows'),
}));

beforeEach(() => {
  jest.mocked(isExecutable).mockResolvedValue(true);
  jest.mocked(isWindows).mockReturnValue(false);
});

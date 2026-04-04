const mockError = jest.fn();

jest.mock('./core/logger', () => ({
  logger: {
    error: mockError,
  },
}));

import { NpmExecError } from './npm';
import { handleCliError } from './cli-error-handler';

describe('handleCliError', () => {
  beforeEach(() => {
    mockError.mockClear();
    jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('EOTP error', () => {
    it('should log OTP-specific message with ERROR prefix', () => {
      const err = new NpmExecError({
        code: 'EOTP',
        summary: 'This operation requires a one-time password.',
        detail: 'Open this URL...',
      });

      handleCliError('fallback message', err);

      expect(mockError).toHaveBeenCalledWith(
        'ERROR: NPM requires a one-time password (OTP). Provide it with --otp <code>.',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jest.mocked(process.exit)).toHaveBeenCalledWith(1);
    });
  });

  describe('other NPM errors', () => {
    it('should fall back to provided message for unknown error codes', () => {
      const err = new NpmExecError({
        code: 'E403',
        summary: 'Forbidden',
        detail: 'You are not allowed to publish this package',
      });

      handleCliError('Custom error message', err);

      expect(mockError).toHaveBeenCalledWith('ERROR: Custom error message');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jest.mocked(process.exit)).toHaveBeenCalledWith(1);
    });
  });

  describe('non-npm error', () => {
    it('should log provided message with ERROR prefix', () => {
      const err = new Error('Network timeout');

      handleCliError('Connection failed', err);

      expect(mockError).toHaveBeenCalledWith('ERROR: Connection failed');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jest.mocked(process.exit)).toHaveBeenCalledWith(1);
    });
  });

  describe('message without error', () => {
    it('should log message with ERROR prefix', () => {
      handleCliError('Command failed');

      expect(mockError).toHaveBeenCalledWith('ERROR: Command failed');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jest.mocked(process.exit)).toHaveBeenCalledWith(1);
    });
  });
});

import { NpmExecError } from './npm';

const mockError = jest.fn();

jest.mock('./core/logger', () => ({
  logger: {
    error: mockError,
  },
}));

import { handleCliError } from './cli-error-handler';

describe('handleCliError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
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

      expect(() => handleCliError('fallback message', err)).toThrow('process.exit');

      expect(mockError).toHaveBeenCalledWith(
        'ERROR: NPM requires a one-time password (OTP). Provide it with --otp <code>.',
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('other NPM errors', () => {
    it('should fall back to provided message for unknown error codes', () => {
      const err = new NpmExecError({
        code: 'E403',
        summary: 'Forbidden',
        detail: 'You are not allowed to publish this package',
      });

      expect(() => handleCliError('Custom error message', err)).toThrow('process.exit');

      expect(mockError).toHaveBeenCalledWith('ERROR: Custom error message');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('non-npm error', () => {
    it('should log provided message with ERROR prefix', () => {
      const err = new Error('Network timeout');

      expect(() => handleCliError('Connection failed', err)).toThrow('process.exit');

      expect(mockError).toHaveBeenCalledWith('ERROR: Connection failed');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('message without error', () => {
    it('should log message with ERROR prefix', () => {
      expect(() => handleCliError('Command failed')).toThrow('process.exit');

      expect(mockError).toHaveBeenCalledWith('ERROR: Command failed');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});

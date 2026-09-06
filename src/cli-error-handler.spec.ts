import '@mocks/core/logger';

import { logger } from '@core/logger';
import { NpmExecError } from './npm';
import { handleCliError } from './cli-error-handler';

// eslint-disable-next-line @typescript-eslint/unbound-method
const mockError = jest.mocked(logger.error);

describe('handleCliError', () => {
  beforeEach(() => {
    mockError.mockClear();
    jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('with an error', () => {
    it.each([
      [
        'EOTP error logs an OTP-specific message',
        new NpmExecError({
          code: 'EOTP',
          summary: 'This operation requires a one-time password.',
          detail: 'Open this URL...',
        }),
        'fallback message',
        'ERROR: NPM requires a one-time password (OTP). Provide it with --otp <code>.',
      ],
      [
        'other NPM errors fall back to the provided message',
        new NpmExecError({
          code: 'E403',
          summary: 'Forbidden',
          detail: 'You are not allowed to publish this package',
        }),
        'Custom error message',
        'ERROR: Custom error message',
      ],
      [
        'non-npm errors log the provided message',
        new Error('Network timeout'),
        'Connection failed',
        'ERROR: Connection failed',
      ],
    ] as const)('%s', (_name, err, message, expectedLog) => {
      handleCliError(message, err);

      expect(mockError).toHaveBeenCalledWith(expectedLog);
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

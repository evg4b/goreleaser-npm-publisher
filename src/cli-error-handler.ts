import { logger } from './core/logger';
import { NpmExecError } from './npm';

export const handleCliError = (msg?: string, err?: Error): void => {
  const message = getMessage(err);
  if (message) {
    logger.error(`ERROR: ${message}`);
  } else {
    logger.error(`ERROR: ${msg ?? err?.message}`);
  }

  process.exit(1);
};

const getMessage = (err?: Error): string | null => {
  if (err instanceof NpmExecError) {
    if (err.code === 'EOTP') {
      return 'NPM requires a one-time password (OTP). Provide it with --otp <code>.';
    }
    return null;
  }

  return null;
};

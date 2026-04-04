import { logger } from './core/logger';
import { NpmExecError } from './npm';

export const handleCliError = (msg: string, err?: Error): void => {
  if (err instanceof NpmExecError) {
    logger.error(`ERROR: ${handleNpmExecError(err) ?? msg}`);
  } else {
    logger.error(`ERROR: ${msg}`);
  }

  process.exit(1);
};

const handleNpmExecError = (err: NpmExecError): string | null => {
  switch (err.code) {
    case 'EOTP':
      return 'NPM requires a one-time password (OTP). Provide it with --otp <code>.';
    default:
      return null;
  }
};

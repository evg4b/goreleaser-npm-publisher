import { ConsoleLogger, setLogger } from '../core/logger';

type InitLoggerParams = Pick<DefaultParams, 'verbose'>;

export const initLogger = (argv: InitLoggerParams) => {
  setLogger(new ConsoleLogger(console, !!argv.verbose));
};

import { ConsoleLogger } from './console';
import { Logger } from './logger';

export let logger: Logger = new ConsoleLogger(console, false);
export const setLogger = (newLogger: Logger): void => {
  logger = newLogger;
};

import { ConsoleLogger } from './console';

export let logger: Logger = new ConsoleLogger(console, false);
export const setLogger = (newLogger: Logger): void => {
  logger = newLogger;
};

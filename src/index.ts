import { type ArgumentsCamelCase } from 'yargs';
import { publishHandler } from './commands';
import { type Logger } from './core/logger';

export * from './core/logger';

export default async (ctx: Logger, options: ArgumentsCamelCase<Omit<DefaultParams, 'clear'>>) => {
  await publishHandler(ctx)({ ...options, clear: true });
};

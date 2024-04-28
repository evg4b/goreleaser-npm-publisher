import { type ArgumentsCamelCase } from 'yargs';
import { publishHandler } from './commands';
import { type ExecContext } from './core/logger';

export * from './core/logger';

export default async (ctx: ExecContext, options: ArgumentsCamelCase<Omit<DefaultParams, 'clear'>>) => {
  await publishHandler(ctx)({ ...options, clear: true });
};

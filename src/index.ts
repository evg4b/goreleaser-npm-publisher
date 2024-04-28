import { type ArgumentsCamelCase } from 'yargs';
import { publishHandler } from './commands';
import { type ExecContext } from './core/logger';

type Params = ArgumentsCamelCase<Omit<DefaultParams, 'clear'>>;
export default async (ctx: ExecContext, options: Params) => {
  await publishHandler(ctx)({ ...options, clear: true });
};

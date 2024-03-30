import { mkdir, rm } from 'node:fs/promises';
import { MiddlewareFunction } from 'yargs';
import { Context } from '../gorealiser';

export const createDistFolder: MiddlewareFunction<DefaultParams> = async (args): Promise<void> => {
  const context = new Context(args.project);
  if (args.clear) {
    await rm(context.distPath, { recursive: true, force: true });
  }

  await mkdir(context.distPath, { recursive: true });
};

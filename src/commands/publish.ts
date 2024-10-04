import { exec as execOriginal } from 'child_process';
import { readdir } from 'fs/promises';
import { sortBy } from 'lodash';
import { promisify } from 'util';
import { Context } from '../core/gorealiser';
import { type Logger } from '../core/logger';
import { buildHandler } from './build';

const exec = promisify(execOriginal);

export const publishHandler = (ctx: Logger): ActionType =>
  async args => {
    await buildHandler(ctx)(args);
    const context = new Context(args.project);

    const packageFolders = sortBy(await readdir(context.distPath), p => -p.length);
    for (const packageFolder of packageFolders) {
      ctx.info(context.packageFolder(packageFolder));
      const { stdout } = await exec('npm publish --access public', {
        env: process.env,
        cwd: context.packageFolder(packageFolder),
      });
      ctx.info(stdout);
    }
  };

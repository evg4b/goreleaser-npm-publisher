import { exec as execOriginal } from 'child_process';
import { readdir } from 'fs/promises';
import { sortBy } from 'lodash';
import { promisify } from 'util';
import { Context } from '../core/gorealiser';
import { logger } from '../core/logger';
import { buildHandler } from './build';

const exec = promisify(execOriginal);

export const publishHandler: ActionType<{ clear: boolean }> = async args => {
  await buildHandler(args);
  const context = new Context(args.project);

  const packageFolders = sortBy(await readdir(context.distPath), p => -p.length);
  for (const packageFolder of packageFolders) {
    logger.info(context.packageFolder(packageFolder));
    const { stdout } = await exec('npm publish --access public', {
      env: process.env,
      cwd: context.packageFolder(packageFolder),
    });
    logger.info(stdout);
  }
};

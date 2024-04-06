import { exec as execOrignial } from 'child_process';
import { readdir } from 'fs/promises';
import { sortBy } from 'lodash';
import { promisify } from 'util';
import type { ArgumentsCamelCase } from 'yargs';
import { Context } from '../core/gorealiser';
import { buildHandler } from './build';

const exec = promisify(execOrignial);

export const publishHandler: ((args: ArgumentsCamelCase<DefaultParams>) => (void | Promise<void>)) = async (args) => {
  await buildHandler(args);
  const context = new Context(args.project);

  const packageFolders = sortBy(await readdir(context.distPath), p => -p.length);
  for (const packageFolder of packageFolders) {
    console.log(context.packageFolder(packageFolder));
    const { stdout } = await exec('npm publish --access public', {
      env: process.env,
      cwd: context.packageFolder(packageFolder),
    });
    console.log(stdout);
  }
};

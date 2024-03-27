import { readdir, stat } from 'fs/promises';
import { Arguments } from 'yargs';
import { Context } from '../gorealiser/context';

export const isDistEmptyCheck = async (argv: Arguments<DefaultParams>) => {
  if (argv.clear) {
    return true;
  }

  const context = new Context(argv.project);
  try {
    const folderStats = await stat(context.distPath);
    if (!folderStats.isDirectory()) {
      return new Error('The dist folder is not a directory, check the path and try again');
    }

    const folderContents = await readdir(context.distPath);
    if (folderContents.length === 0) {
      return true;
    }

    return new Error('The dist folder is not empty, use --clear to clear it before building the project');
  } catch (error) {
    // @ts-expect-error error in fs/promises is not typed
    if ('code' in error && error.code === 'ENOENT') {
      return true;
    } else {
      throw error;
    }
  }
};

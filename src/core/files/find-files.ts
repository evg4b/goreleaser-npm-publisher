import { glob } from 'glob';
import { tap } from '../../helpers';
import { logger } from '../logger';

export const findFiles = (cwd: string, files: string[]) =>
  glob(files, { cwd, nocase: true, ignore: ['node_modules/**', 'dist/'] }).then(
    tap(actual => {
      logger.debug('Lookup files by globs');
      files.forEach(p => logger.debug(p));
      logger.debug(`In folder ${cwd}`);
      logger.debug('Founded:');
      actual.forEach(p => logger.debug(p));
    }),
  );

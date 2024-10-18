import { EOL } from 'node:os';
import { resolve } from 'node:path';
import { cwd, env } from 'node:process';
import { logger } from '../core/logger';
import { rm, writeFile } from '../helpers/fs';
import { NpmExecAction, NpmExecContext } from './models';

export const execInContext = async <T>(context: NpmExecContext, action: NpmExecAction<T>): Promise<T> => {
  if (!context.token) {
    logger.debug('No token provided');
    return await action({ ...env } as Record<string, string>);
  }

  logger.debug(`Founded token: *****[len:${context.token.length}]`);
  const rcFilePath = resolve(context.pwd ?? cwd(), '.npmrc');
  try {
    await writeFile(rcFilePath, rcFileContent(context.token).join(EOL));

    return await action({ ...env, NPM_TOKEN: context.token });
  } finally {
    await rm(rcFilePath, { force: true });
  }
};

const rcFileContent = (token: string) => {
  return [
    '; THIS_FILE_WAS_GENERATED_BY GORELEASER_NPM_PUBLISHER',
    '; PLEASE_DO_NOT_TOUCH_IT!',
    `//registry.npmjs.org/:_authToken=${token}`,
  ];
};

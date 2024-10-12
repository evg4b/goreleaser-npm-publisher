import { rm, writeFile } from 'node:fs/promises';
import { EOL } from 'node:os';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { env } from 'process';

export interface NpmExecContext {
  pwd?: string;
  token?: string;
}

type Action<T> = (env: Record<string, string>) => Promise<T>

export const execInContext = async <T>(context: NpmExecContext, action: Action<T>): Promise<T> => {
  if (!context.token) {
    return await action({ ...env } as Record<string, string>);
  }

  const rcFilePath = resolve(context.pwd ?? cwd(), '.npmrc');
  try {
    const lines = [
      '; THIS_FILE_WAS_GENERATED_BY GORELEASER_NPM_PUBLISHER',
      '; PLEASE_DO_NOT_TOUCH_IT!',
      `//registry.npmjs.org/:_authToken=${ context.token }`,
    ];
    await writeFile(rcFilePath, lines.join(EOL), 'utf-8');
    return await action({
      ...env,
      NPM_TOKEN: context.token ?? '',
    });
  } finally {
    await rm(rcFilePath, { force: true });
  }
};

import { readdir } from 'fs/promises';
import { sortBy } from 'lodash';
import { Context } from '../core/gorealiser';
import { logger } from '../core/logger';
import { publish } from '../npm';
import { buildHandler } from './build';
import { ActionType } from './models';

export const publishHandler: ActionType<PublishParams> = async args => {
  await buildHandler(args);
  const context = new Context(args.project);

  const packageFolders = sortBy(await readdir(context.distPath), p => -p.length);
  for (const packageFolder of packageFolders) {
    logger.info(context.packageFolder(packageFolder));
    const packageInfo = await publish(context.packageFolder(packageFolder), { token: args.token });
    await logger.group(`Successfully published ${packageInfo.id}`, async () => {
      logger.info(`Name: ${packageInfo.name}`);
      logger.info(`Version: ${packageInfo.version}`);
      logger.info(`Size: ${packageInfo.size}`);
      logger.info(`Unpacked size: ${packageInfo.unpackedSize}`);
      logger.info(`SHA sum: ${packageInfo.shasum}`);
      logger.info(`Integrity: ${packageInfo.integrity}`);
      for (const file of packageInfo.files) {
        await logger.group(`Filename: ${file.path}`, () => {
          logger.info(`Size: ${file.size}`);
          logger.info(`Mode: ${file.mode}`);

          return Promise.resolve();
        });
      }
      logger.info(`Entry count: ${packageInfo.entryCount}`);
    });
  }
};

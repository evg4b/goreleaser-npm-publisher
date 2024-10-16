import { RmOptions } from 'node:fs';
import {
  copyFile as copyFileFn,
  mkdir as mkdirFn,
  readFile as readFileFn,
  writeFile as writeFileFn,
  rm as rmFn,
} from 'node:fs/promises';
import { logger } from '../core/logger';
import { tap } from './promise';

export const writeFile = (path: string, content: string): Promise<void> =>
  writeFileFn(path, content, 'utf-8')
    .then(tap(() => logger.debug(`File ${path} written`)))
    .catch(tap(() => logger.error(`Error while writing file ${path}`)));

export const copyFile = (sourceFile: string, destFile: string): Promise<void> =>
  copyFileFn(sourceFile, destFile)
    .then(tap(() => logger.debug(`Copied file ${sourceFile} to ${destFile}`)))
    .catch(tap(() => logger.error(`Error while writing file ${sourceFile}`)));

export const mkdir = (path: string): Promise<void> =>
  mkdirFn(path, { recursive: true })
    .then(() => logger.debug(`Created directory ${path}`))
    .catch(tap(() => logger.error(`Error while writing file ${path}`)));

export const readFile = (path: string): Promise<string> =>
  readFileFn(path, 'utf8')
    .then(tap(() => logger.debug(`Read file ${path}`)))
    .catch(tap(() => logger.error(`Error while reading file ${path}`)));

export const rm = (path: string, options: RmOptions): Promise<void> =>
  rmFn(path, options)
    .then(tap(() => logger.debug(`Removed ${path}`)))
    .catch(tap(() => logger.error(`Error while removing ${path}`)));

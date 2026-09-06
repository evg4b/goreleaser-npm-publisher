import '@mocks/fs-promises';
import '@mocks/core/logger';

import * as nodeFs from 'node:fs/promises';
import { logger } from '@core/logger';
import { copyFile, mkdir, readFile, rm, writeFile } from './fs';

const copyFileFn = jest.mocked(nodeFs.copyFile);
const mkdirFn = jest.mocked(nodeFs.mkdir);
const readFileFn = jest.mocked(nodeFs.readFile) as unknown as jest.Mock;
const rmFn = jest.mocked(nodeFs.rm);
const writeFileFn = jest.mocked(nodeFs.writeFile);
// eslint-disable-next-line @typescript-eslint/unbound-method
const errorMock = jest.mocked(logger.error);

describe('writeFile', () => {
  it('should write file with utf-8 encoding', async () => {
    writeFileFn.mockResolvedValue(undefined);

    await writeFile('/tmp/file.txt', 'content');

    expect(writeFileFn).toHaveBeenCalledWith('/tmp/file.txt', 'content', 'utf-8');
  });

  it('should log error when write fails', async () => {
    writeFileFn.mockRejectedValue(new Error('disk full'));

    await writeFile('/tmp/file.txt', 'content');

    expect(errorMock).toHaveBeenCalled();
  });
});

describe('copyFile', () => {
  it('should copy the file', async () => {
    copyFileFn.mockResolvedValue(undefined);

    await copyFile('/src/file.txt', '/dst/file.txt');

    expect(copyFileFn).toHaveBeenCalledWith('/src/file.txt', '/dst/file.txt');
  });

  it('should log error when copy fails', async () => {
    copyFileFn.mockRejectedValue(new Error('no such file'));

    await copyFile('/src/file.txt', '/dst/file.txt');

    expect(errorMock).toHaveBeenCalled();
  });
});

describe('mkdir', () => {
  it('should create directory recursively', async () => {
    mkdirFn.mockResolvedValue(undefined);

    await mkdir('/tmp/new-dir');

    expect(mkdirFn).toHaveBeenCalledWith('/tmp/new-dir', { recursive: true });
  });

  it('should log error when mkdir fails', async () => {
    mkdirFn.mockRejectedValue(new Error('permission denied'));

    await mkdir('/tmp/new-dir');

    expect(errorMock).toHaveBeenCalled();
  });
});

describe('readFile', () => {
  it('should read file with utf8 encoding', async () => {
    readFileFn.mockResolvedValue('file content');

    const result = await readFile('/tmp/file.txt');

    expect(readFileFn).toHaveBeenCalledWith('/tmp/file.txt', 'utf8');
    expect(result).toBe('file content');
  });

  it('should log error when read fails', async () => {
    readFileFn.mockRejectedValue(new Error('not found'));

    await readFile('/tmp/file.txt');

    expect(errorMock).toHaveBeenCalled();
  });
});

describe('rm', () => {
  it('should remove file with given options', async () => {
    rmFn.mockResolvedValue(undefined);

    await rm('/tmp/file.txt', { force: true });

    expect(rmFn).toHaveBeenCalledWith('/tmp/file.txt', { force: true });
  });

  it('should log error when rm fails', async () => {
    rmFn.mockRejectedValue(new Error('busy'));

    await rm('/tmp/file.txt', { force: false });

    expect(errorMock).toHaveBeenCalled();
  });
});

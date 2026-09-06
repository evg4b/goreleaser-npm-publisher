import '@mocks/fs-promises';
import '@mocks/core/logger';

import * as nodeFs from 'node:fs/promises';
import { logger } from '@core/logger';
import { copyFile, mkdir, readFile, rm, writeFile } from './fs';

describe('writeFile', () => {
  it('should write file with utf-8 encoding', async () => {
    jest.mocked(nodeFs.writeFile).mockResolvedValue(undefined);

    await writeFile('/tmp/file.txt', 'content');

    expect(nodeFs.writeFile).toHaveBeenCalledWith('/tmp/file.txt', 'content', 'utf-8');
  });

  it('should log error when write fails', async () => {
    jest.mocked(nodeFs.writeFile).mockRejectedValue(new Error('disk full'));

    await writeFile('/tmp/file.txt', 'content');

    expect(logger.error).toHaveBeenCalled();
  });
});

describe('copyFile', () => {
  it('should copy the file', async () => {
    jest.mocked(nodeFs.copyFile).mockResolvedValue(undefined);

    await copyFile('/src/file.txt', '/dst/file.txt');

    expect(nodeFs.copyFile).toHaveBeenCalledWith('/src/file.txt', '/dst/file.txt');
  });

  it('should log error when copy fails', async () => {
    jest.mocked(nodeFs.copyFile).mockRejectedValue(new Error('no such file'));

    await copyFile('/src/file.txt', '/dst/file.txt');

    expect(logger.error).toHaveBeenCalled();
  });
});

describe('mkdir', () => {
  it('should create directory recursively', async () => {
    jest.mocked(nodeFs.mkdir).mockResolvedValue(undefined);

    await mkdir('/tmp/new-dir');

    expect(nodeFs.mkdir).toHaveBeenCalledWith('/tmp/new-dir', { recursive: true });
  });

  it('should log error when mkdir fails', async () => {
    jest.mocked(nodeFs.mkdir).mockRejectedValue(new Error('permission denied'));

    await mkdir('/tmp/new-dir');

    expect(logger.error).toHaveBeenCalled();
  });
});

describe('readFile', () => {
  it('should read file with utf8 encoding', async () => {
    jest.mocked(nodeFs.readFile).mockResolvedValue('file content');

    const result = await readFile('/tmp/file.txt');

    expect(nodeFs.readFile).toHaveBeenCalledWith('/tmp/file.txt', 'utf8');
    expect(result).toBe('file content');
  });

  it('should log error when read fails', async () => {
    jest.mocked(nodeFs.readFile).mockRejectedValue(new Error('not found'));

    await readFile('/tmp/file.txt');

    expect(logger.error).toHaveBeenCalled();
  });
});

describe('rm', () => {
  it('should remove file with given options', async () => {
    jest.mocked(nodeFs.rm).mockResolvedValue(undefined);

    await rm('/tmp/file.txt', { force: true });

    expect(nodeFs.rm).toHaveBeenCalledWith('/tmp/file.txt', { force: true });
  });

  it('should log error when rm fails', async () => {
    jest.mocked(nodeFs.rm).mockRejectedValue(new Error('busy'));

    await rm('/tmp/file.txt', { force: false });

    expect(logger.error).toHaveBeenCalled();
  });
});

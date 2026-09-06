import '@mocks/fs-promises';
import '@mocks/process';

import { mkdir, rm } from 'node:fs/promises';
import { createDistFolder } from './clear-dist';

const mkdirMock = jest.mocked(mkdir);
const rmMock = jest.mocked(rm);

describe('createDistFolder', () => {
  beforeEach(() => {
    mkdirMock.mockResolvedValue(undefined);
    rmMock.mockResolvedValue(undefined);
  });

  it('should create the dist folder', async () => {
    await createDistFolder({ project: '.', clear: false, _: [], $0: '' });

    expect(mkdirMock).toHaveBeenCalledWith('/project/dist/npm', { recursive: true });
  });

  it('should remove dist folder first when clear is true', async () => {
    await createDistFolder({ project: '.', clear: true, _: [], $0: '' });

    expect(rmMock).toHaveBeenCalledWith('/project/dist/npm', { recursive: true, force: true });
    expect(mkdirMock).toHaveBeenCalledWith('/project/dist/npm', { recursive: true });
  });

  it('should not remove dist folder when clear is false', async () => {
    await createDistFolder({ project: '.', clear: false, _: [], $0: '' });

    expect(rmMock).not.toHaveBeenCalled();
  });
});

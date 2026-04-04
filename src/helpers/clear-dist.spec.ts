const mkdirMock = jest.fn();
const rmMock = jest.fn();

jest.mock('node:fs/promises', () => ({
  mkdir: mkdirMock,
  rm: rmMock,
}));

jest.mock('node:process', () => ({
  cwd: () => '/project',
}));

import { createDistFolder } from './clear-dist';

describe('createDistFolder', () => {
  beforeEach(() => {
    mkdirMock.mockResolvedValue(undefined);
    rmMock.mockResolvedValue(undefined);
  });

  it('should create the dist folder', async () => {
    await createDistFolder({ project: '.', clear: false, _: [], $0: '' } as never);

    expect(mkdirMock).toHaveBeenCalledWith('/project/dist/npm', { recursive: true });
  });

  it('should remove dist folder first when clear is true', async () => {
    await createDistFolder({ project: '.', clear: true, _: [], $0: '' } as never);

    expect(rmMock).toHaveBeenCalledWith('/project/dist/npm', { recursive: true, force: true });
    expect(mkdirMock).toHaveBeenCalledWith('/project/dist/npm', { recursive: true });
  });

  it('should not remove dist folder when clear is false', async () => {
    await createDistFolder({ project: '.', clear: false, _: [], $0: '' } as never);

    expect(rmMock).not.toHaveBeenCalled();
  });
});

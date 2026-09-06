import '@mocks/fs-promises';
import '@mocks/process';

import { mkdir, rm } from 'node:fs/promises';
import { createDistFolder } from './clear-dist';

describe('createDistFolder', () => {
  beforeEach(() => {
    jest.mocked(mkdir).mockResolvedValue(undefined);
    jest.mocked(rm).mockResolvedValue(undefined);
  });

  it('should create the dist folder', async () => {
    await createDistFolder({ project: '.', clear: false, _: [], $0: '' });

    expect(jest.mocked(mkdir)).toHaveBeenCalledWith('/project/dist/npm', { recursive: true });
  });

  it('should remove dist folder first when clear is true', async () => {
    await createDistFolder({ project: '.', clear: true, _: [], $0: '' });

    expect(rm).toHaveBeenCalledWith('/project/dist/npm', { recursive: true, force: true });
    expect(mkdir).toHaveBeenCalledWith('/project/dist/npm', { recursive: true });
  });

  it('should not remove dist folder when clear is false', async () => {
    await createDistFolder({ project: '.', clear: false, _: [], $0: '' });

    expect(rm).not.toHaveBeenCalled();
  });
});

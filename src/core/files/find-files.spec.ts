const globMock = jest.fn();
jest.mock('glob', () => ({ glob: globMock }));

const debugMock = jest.fn();
jest.mock('../logger', () => ({
  logger: { debug: debugMock },
}));

import { findFiles } from './find-files';

describe('findFiles', () => {
  it('should call glob with correct options', async () => {
    globMock.mockResolvedValue(['LICENSE', 'README.md']);

    await findFiles('/project', ['LICENSE', 'README.md']);

    expect(globMock).toHaveBeenCalledWith(['LICENSE', 'README.md'], {
      cwd: '/project',
      nocase: true,
      ignore: ['node_modules/**', 'dist/'],
    });
  });

  it('should return the list of matched files', async () => {
    globMock.mockResolvedValue(['LICENSE']);

    const result = await findFiles('/project', ['LICENSE']);

    expect(result).toEqual(['LICENSE']);
  });

  it('should return empty array when no files matched', async () => {
    globMock.mockResolvedValue([]);

    const result = await findFiles('/project', ['*.xyz']);

    expect(result).toEqual([]);
  });
});

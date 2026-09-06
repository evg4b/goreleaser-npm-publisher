import '@mocks/helpers/fs';

import { writeFile } from '@helpers/fs';
import { writePackage } from './package';

const writeFileMock = jest.mocked(writeFile);

describe('writePackage', () => {
  it('should write serialized JSON to the given path', async () => {
    writeFileMock.mockResolvedValue(undefined);

    const pkg: PackageJson = {
      name: 'my-pkg',
      version: '1.0.0',
      bin: { 'my-pkg': 'bin/my-pkg' },
      os: ['linux'],
      cpu: ['x64'],
      files: [],
      keywords: [],
    };

    await writePackage('/dist/npm/my-pkg/package.json', pkg);

    expect(writeFileMock).toHaveBeenCalledWith('/dist/npm/my-pkg/package.json', JSON.stringify(pkg, null, 2));
  });
});

import '@mocks/core/files';
import '@mocks/helpers/fs';
import '@mocks/core/logger';
import '@mocks/core/gorealiser';

const mockTransformPackage = jest.fn();
const mockFormatPackageJson = jest.fn();
const mockFormatMainPackageJson = jest.fn();

jest.mock('@core/package', () => ({
  ...jest.requireActual<object>('@core/package'),
  transformPackage: mockTransformPackage,
  formatPackageJson: mockFormatPackageJson,
  formatMainPackageJson: mockFormatMainPackageJson,
}));

import { Context } from '@core/gorealiser';
import { buildHandler } from './build';
import { findFiles, parseArtifactsFile, parseMetadata, validateBinaryArtifact, writePackage } from '@core/files';
import { copyFile, mkdir, writeFile } from '@helpers/fs';
import { logger } from '@core/logger';

jest.mocked(Context).mockImplementation(() => ({
  artifactsPath: '/project/dist/artifacts.json',
    metadataPath: '/project/dist/metadata.json',
    distPath: '/project/dist/npm',
    project: jest.fn().mockReturnValue('/project'),
    packageFolder: jest.fn().mockReturnValue('/project/dist/npm/tool-linux-amd64'),
    packageJson: jest.fn().mockReturnValue('/project/dist/npm/tool-linux-amd64/package.json'),
}) as unknown as Context);



const makeArtifact = (overrides: Partial<BinaryArtifact> = {}): BinaryArtifact => ({
  name: 'tool_linux_amd64',
  path: 'dist/tool_linux_amd64/tool',
  type: 'Binary',
  internal_type: 4,
  goos: 'linux',
  goarch: 'amd64',
  extra: { Binary: 'tool', Builder: 'default', Ext: '', ID: 'default' },
  ...overrides,
});

const makeMetadata = (): Metadata => ({
  project_name: 'tool',
  tag: 'v1.0.0',
  previous_tag: 'v0.9.0',
  version: '1.0.0',
  commit: 'abc123',
  date: '2024-01-01',
  runtime: { goos: 'linux', goarch: 'amd64' },
});

const makePackageDef = (): PackageDefinition => ({
  name: 'tool-linux-x64',
  version: '1.0.0',
  sourceBinary: 'tool',
  destinationBinary: 'tool',
  bin: 'tool',
  os: 'linux',
  cpu: 'x64',
  files: [],
  keywords: [],
  license: undefined,
});

const makeArgs = (overrides: Partial<BuildParams> = {}): BuildParams => ({
  project: '/project',
  builder: 'default',
  clear: false,
  files: [],
  description: 'A test tool',
  prefix: undefined,
  verbose: false,
  license: 'MIT',
  keywords: [],
  ...overrides,
});

describe('buildHandler', () => {
  beforeEach(() => {
    jest.mocked(parseArtifactsFile).mockResolvedValue([makeArtifact()]);
    jest.mocked(parseMetadata).mockResolvedValue(makeMetadata());
    jest.mocked(findFiles).mockResolvedValue([]);
    jest.mocked(validateBinaryArtifact).mockReturnValue(true);
    jest.mocked(writePackage).mockResolvedValue(undefined);
    jest.mocked(copyFile).mockResolvedValue(undefined);
    jest.mocked(mkdir).mockResolvedValue(undefined);
    jest.mocked(writeFile).mockResolvedValue(undefined);
    mockTransformPackage.mockReturnValue(makePackageDef());
    mockFormatPackageJson.mockReturnValue({});
    mockFormatMainPackageJson.mockReturnValue({});
    // eslint-disable-next-line @typescript-eslint/unbound-method
    jest.mocked(logger.group).mockImplementation(async (_name: string, fn: () => Promise<unknown>) => fn());
  });

  it('builds packages successfully', async () => {
    await buildHandler(makeArgs());

    expect(jest.mocked(parseArtifactsFile)).toHaveBeenCalled();
    expect(jest.mocked(parseMetadata)).toHaveBeenCalled();
    expect(jest.mocked(mkdir)).toHaveBeenCalled();
    expect(jest.mocked(writePackage)).toHaveBeenCalled();
    expect(jest.mocked(writeFile)).toHaveBeenCalled();
  });

  it('uses project_name as builder when builder arg is not provided', async () => {
    jest.mocked(parseArtifactsFile).mockResolvedValue([
      makeArtifact({ extra: { Binary: 'tool', Builder: 'tool', Ext: '', ID: 'tool' } }),
    ]);

    await buildHandler(makeArgs({ builder: undefined }));

    expect(mockTransformPackage).toHaveBeenCalled();
  });

  it('copies source artifact to package folder', async () => {
    await buildHandler(makeArgs());

    expect(jest.mocked(copyFile)).toHaveBeenCalled();
  });

  it('passes prefix to formatPackageJson', async () => {
    await buildHandler(makeArgs({ prefix: '@scope' }));

    expect(mockFormatPackageJson).toHaveBeenCalledWith(expect.objectContaining({ prefix: '@scope' }));
  });

  it('passes description to formatPackageJson', async () => {
    await buildHandler(makeArgs({ description: 'My tool' }));

    expect(mockFormatPackageJson).toHaveBeenCalledWith(expect.objectContaining({ description: 'My tool' }));
  });

  it('passes keywords to transformPackage', async () => {
    await buildHandler(makeArgs({ keywords: ['cli', 'tool'] }));

    expect(mockTransformPackage).toHaveBeenCalledWith(expect.objectContaining({ keywords: ['cli', 'tool'] }));
  });

  it('writes index.js shim script for main package', async () => {
    await buildHandler(makeArgs());

    expect(jest.mocked(writeFile)).toHaveBeenCalledWith(
      expect.stringContaining('index.js'),
      expect.stringContaining('mapping = {"linux_x64":{"name":["tool-linux-x64"],"bin":"tool"}}'),
    );
  });

  it('copies extra files to each platform package folder', async () => {
    jest.mocked(findFiles).mockResolvedValue(['readme.md', 'license']);
    await buildHandler(makeArgs());

    expect(jest.mocked(copyFile)).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  });

  it('throws when no artifacts are found', async () => {
    jest.mocked(parseArtifactsFile).mockResolvedValue([]);

    await expect(buildHandler(makeArgs())).rejects.toThrow();
  });

  it('throws when no binary artifacts match the builder', async () => {
    jest.mocked(parseArtifactsFile).mockResolvedValue([
      makeArtifact({ extra: { Binary: 'other', Builder: 'other', Ext: '', ID: 'other' } }),
    ]);

    await expect(buildHandler(makeArgs({ builder: 'default' }))).rejects.toThrow();
  });

  it('throws when validateBinaryArtifact fails', async () => {
    jest.mocked(validateBinaryArtifact).mockReturnValue(false);
    Object.assign(jest.mocked(validateBinaryArtifact), { errors: [{ message: 'validation error' }] });

    await expect(buildHandler(makeArgs())).rejects.toThrow('Invalid binary artifacts');

    expect(jest.mocked(logger.error)).toHaveBeenCalled();
  });

  it.each(['artifact(s)', 'project_name'])('logs details containing "%s" in verbose mode', async substring => {
    await buildHandler(makeArgs({ verbose: true }));

    expect(jest.mocked(logger.debug)).toHaveBeenCalledWith(expect.stringContaining(substring));
  });

  it('logs file details in verbose mode', async () => {
    jest.mocked(findFiles).mockResolvedValue(['readme.md']);
    await buildHandler(makeArgs({ verbose: true }));

    expect(jest.mocked(logger.debug)).toHaveBeenCalledWith(expect.stringContaining('file'));
  });

  it('builds main package with formatMainPackageJson', async () => {
    await buildHandler(makeArgs());

    expect(mockFormatMainPackageJson).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: makeMetadata(),
      }),
    );
  });
});

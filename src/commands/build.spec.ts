import '@mocks/core/files';
import '@mocks/core/package';
import '@mocks/helpers/fs';
import '@mocks/core/logger';
import '@mocks/core/gorealiser';

import { Context } from '@core/gorealiser';
import { formatMainPackageJson, formatPackageJson, transformPackage } from '@core/package';
import { buildHandler } from './build';
import { findFiles, parseArtifactsFile, parseMetadata, validateBinaryArtifact, writePackage } from '@core/files';
import { copyFile, mkdir, writeFile } from '@helpers/fs';
import { logger } from '@core/logger';

describe('buildHandler', () => {
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

  beforeEach(() => {
    jest.mocked(parseArtifactsFile).mockResolvedValue([makeArtifact()]);
    jest.mocked(parseMetadata).mockResolvedValue(makeMetadata());
    jest.mocked(findFiles).mockResolvedValue([]);
    jest.mocked(validateBinaryArtifact).mockReturnValue(true);
    jest.mocked(writePackage).mockResolvedValue(undefined);
    jest.mocked(copyFile).mockResolvedValue(undefined);
    jest.mocked(mkdir).mockResolvedValue(undefined);
    jest.mocked(writeFile).mockResolvedValue(undefined);
    jest.mocked(transformPackage).mockReturnValue(makePackageDef());
    jest.mocked(formatPackageJson).mockReturnValue({} as PackageJson);
    jest.mocked(formatMainPackageJson).mockReturnValue({} as PackageJson);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    jest.mocked(logger.group).mockImplementation(async (_name: string, fn: () => Promise<unknown>) => fn());

    jest.mocked(Context).mockImplementation(
      () =>
        ({
          artifactsPath: '/project/dist/artifacts.json',
          metadataPath: '/project/dist/metadata.json',
          distPath: '/project/dist/npm',
          project: jest.fn().mockReturnValue('/project'),
          packageFolder: jest.fn().mockReturnValue('/project/dist/npm/tool-linux-amd64'),
          packageJson: jest.fn().mockReturnValue('/project/dist/npm/tool-linux-amd64/package.json'),
        }) as unknown as Context,
    );
  });

  it('builds packages successfully', async () => {
    await buildHandler(makeArgs());

    expect(parseArtifactsFile).toHaveBeenCalled();
    expect(parseMetadata).toHaveBeenCalled();
    expect(mkdir).toHaveBeenCalled();
    expect(writePackage).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
  });

  it('uses project_name as builder when builder arg is not provided', async () => {
    jest
      .mocked(parseArtifactsFile)
      .mockResolvedValue([makeArtifact({ extra: { Binary: 'tool', Builder: 'tool', Ext: '', ID: 'tool' } })]);

    await buildHandler(makeArgs({ builder: undefined }));

    expect(transformPackage).toHaveBeenCalled();
  });

  it('copies source artifact to package folder', async () => {
    await buildHandler(makeArgs());

    expect(copyFile).toHaveBeenCalled();
  });

  it('passes prefix to formatPackageJson', async () => {
    await buildHandler(makeArgs({ prefix: '@scope' }));

    expect(formatPackageJson).toHaveBeenCalledWith(expect.objectContaining({ prefix: '@scope' }));
  });

  it('passes description to formatPackageJson', async () => {
    await buildHandler(makeArgs({ description: 'My tool' }));

    expect(formatPackageJson).toHaveBeenCalledWith(expect.objectContaining({ description: 'My tool' }));
  });

  it('passes keywords to transformPackage', async () => {
    await buildHandler(makeArgs({ keywords: ['cli', 'tool'] }));

    expect(transformPackage).toHaveBeenCalledWith(expect.objectContaining({ keywords: ['cli', 'tool'] }));
  });

  it('writes index.js shim script for main package', async () => {
    await buildHandler(makeArgs());

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('index.js'),
      expect.stringContaining('mapping = {"linux_x64":{"name":["tool-linux-x64"],"bin":"tool"}}'),
    );
  });

  it('copies extra files to each platform package folder', async () => {
    jest.mocked(findFiles).mockResolvedValue(['readme.md', 'license']);
    await buildHandler(makeArgs());

    expect(copyFile).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  });

  it('throws when no artifacts are found', async () => {
    jest.mocked(parseArtifactsFile).mockResolvedValue([]);

    await expect(buildHandler(makeArgs())).rejects.toThrow();
  });

  it('throws when no binary artifacts match the builder', async () => {
    jest
      .mocked(parseArtifactsFile)
      .mockResolvedValue([makeArtifact({ extra: { Binary: 'other', Builder: 'other', Ext: '', ID: 'other' } })]);

    await expect(buildHandler(makeArgs({ builder: 'default' }))).rejects.toThrow();
  });

  it('throws when validateBinaryArtifact fails', async () => {
    jest.mocked(validateBinaryArtifact).mockReturnValue(false);
    Object.assign(jest.mocked(validateBinaryArtifact), { errors: [{ message: 'validation error' }] });

    await expect(buildHandler(makeArgs())).rejects.toThrow('Invalid binary artifacts');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(logger.error).toHaveBeenCalled();
  });

  it.each(['artifact(s)', 'project_name'])('logs details containing "%s" in verbose mode', async substring => {
    await buildHandler(makeArgs({ verbose: true }));

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining(substring));
  });

  it('logs file details in verbose mode', async () => {
    jest.mocked(findFiles).mockResolvedValue(['readme.md']);
    await buildHandler(makeArgs({ verbose: true }));

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('file'));
  });

  it('builds main package with formatMainPackageJson', async () => {
    await buildHandler(makeArgs());

    expect(formatMainPackageJson).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: makeMetadata(),
      }),
    );
  });
});

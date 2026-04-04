const mockParseArtifactsFile = jest.fn();
const mockParseMetadata = jest.fn();
const mockFindFiles = jest.fn();
const mockValidateBinaryArtifact = jest.fn();
const mockWritePackage = jest.fn();
jest.mock('../core/files', () => ({
  parseArtifactsFile: mockParseArtifactsFile,
  parseMetadata: mockParseMetadata,
  findFiles: mockFindFiles,
  validateBinaryArtifact: mockValidateBinaryArtifact,
  writePackage: mockWritePackage,
}));

const mockCopyFile = jest.fn();
const mockMkdir = jest.fn();
const mockWriteFile = jest.fn();
jest.mock('../helpers/fs', () => ({
  copyFile: mockCopyFile,
  mkdir: mockMkdir,
  writeFile: mockWriteFile,
}));

const mockLoggerDebug = jest.fn();
const mockLoggerError = jest.fn();
const mockLoggerGroup = jest.fn();
jest.mock('../core/logger', () => ({
  logger: {
    debug: mockLoggerDebug,
    info: jest.fn(),
    error: mockLoggerError,
    warning: jest.fn(),
    group: mockLoggerGroup,
  },
}));

const mockTransformPackage = jest.fn();
const mockFormatPackageJson = jest.fn();
const mockFormatMainPackageJson = jest.fn();
jest.mock('../core/package', () => ({
  transformPackage: mockTransformPackage,
  formatPackageJson: mockFormatPackageJson,
  formatMainPackageJson: mockFormatMainPackageJson,
}));

const mockContextInstance = {
  artifactsPath: '/project/dist/artifacts.json',
  metadataPath: '/project/dist/metadata.json',
  distPath: '/project/dist/npm',
  project: jest.fn().mockReturnValue('/project'),
  packageFolder: jest.fn().mockReturnValue('/project/dist/npm/tool-linux-amd64'),
  packageJson: jest.fn().mockReturnValue('/project/dist/npm/tool-linux-amd64/package.json'),
};
jest.mock('../core/gorealiser', () => ({
  Context: jest.fn().mockImplementation(() => mockContextInstance),
}));

import { buildHandler } from './build';

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
    mockParseArtifactsFile.mockResolvedValue([makeArtifact()]);
    mockParseMetadata.mockResolvedValue(makeMetadata());
    mockFindFiles.mockResolvedValue([]);
    mockValidateBinaryArtifact.mockReturnValue(true);
    mockWritePackage.mockResolvedValue(undefined);
    mockCopyFile.mockResolvedValue(undefined);
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
    mockTransformPackage.mockReturnValue(makePackageDef());
    mockFormatPackageJson.mockReturnValue({});
    mockFormatMainPackageJson.mockReturnValue({});
    mockLoggerGroup.mockImplementation(async (_name: string, fn: () => Promise<unknown>) => fn());
  });

  it('builds packages successfully', async () => {
    await buildHandler(makeArgs());

    expect(mockParseArtifactsFile).toHaveBeenCalled();
    expect(mockParseMetadata).toHaveBeenCalled();
    expect(mockMkdir).toHaveBeenCalled();
    expect(mockWritePackage).toHaveBeenCalled();
    expect(mockWriteFile).toHaveBeenCalled();
  });

  it('uses project_name as builder when builder arg is not provided', async () => {
    mockParseArtifactsFile.mockResolvedValue([
      makeArtifact({ extra: { Binary: 'tool', Builder: 'tool', Ext: '', ID: 'tool' } }),
    ]);

    await buildHandler(makeArgs({ builder: undefined }));

    expect(mockTransformPackage).toHaveBeenCalled();
  });

  it('copies source artifact to package folder', async () => {
    await buildHandler(makeArgs());

    expect(mockCopyFile).toHaveBeenCalled();
  });

  it('passes prefix to formatPackageJson', async () => {
    await buildHandler(makeArgs({ prefix: '@scope' }));

    expect(mockFormatPackageJson).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: '@scope' }),
    );
  });

  it('passes description to formatPackageJson', async () => {
    await buildHandler(makeArgs({ description: 'My tool' }));

    expect(mockFormatPackageJson).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'My tool' }),
    );
  });

  it('passes keywords to transformPackage', async () => {
    await buildHandler(makeArgs({ keywords: ['cli', 'tool'] }));

    expect(mockTransformPackage).toHaveBeenCalledWith(
      expect.objectContaining({ keywords: ['cli', 'tool'] }),
    );
  });

  it('writes index.js exec script for main package', async () => {
    await buildHandler(makeArgs());

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('index.js'),
      expect.any(String),
    );
  });

  it('copies extra files to each platform package folder', async () => {
    mockFindFiles.mockResolvedValue(['readme.md', 'license']);
    await buildHandler(makeArgs());

    expect(mockCopyFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
    );
  });

  it('throws when no artifacts are found', async () => {
    mockParseArtifactsFile.mockResolvedValue([]);

    await expect(buildHandler(makeArgs())).rejects.toThrow();
  });

  it('throws when no binary artifacts match the builder', async () => {
    mockParseArtifactsFile.mockResolvedValue([
      makeArtifact({ extra: { Binary: 'other', Builder: 'other', Ext: '', ID: 'other' } }),
    ]);

    await expect(buildHandler(makeArgs({ builder: 'default' }))).rejects.toThrow();
  });

  it('throws when validateBinaryArtifact fails', async () => {
    mockValidateBinaryArtifact.mockReturnValue(false);
    Object.assign(mockValidateBinaryArtifact, { errors: [{ message: 'validation error' }] });

    await expect(buildHandler(makeArgs())).rejects.toThrow('Invalid binary artifacts');

    expect(mockLoggerError).toHaveBeenCalled();
  });

  it('logs artifact details in verbose mode', async () => {
    await buildHandler(makeArgs({ verbose: true }));

    expect(mockLoggerDebug).toHaveBeenCalledWith(expect.stringContaining('artifact(s)'));
  });

  it('logs metadata details in verbose mode', async () => {
    await buildHandler(makeArgs({ verbose: true }));

    expect(mockLoggerDebug).toHaveBeenCalledWith(expect.stringContaining('project_name'));
  });

  it('logs file details in verbose mode', async () => {
    mockFindFiles.mockResolvedValue(['readme.md']);
    await buildHandler(makeArgs({ verbose: true }));

    expect(mockLoggerDebug).toHaveBeenCalledWith(expect.stringContaining('file'));
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

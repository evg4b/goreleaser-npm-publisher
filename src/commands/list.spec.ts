const mockParseArtifactsFile = jest.fn();
const mockParseMetadata = jest.fn();
jest.mock('../core/files', () => ({
  parseArtifactsFile: mockParseArtifactsFile,
  parseMetadata: mockParseMetadata,
}));

const mockLoggerInfo = jest.fn();
const mockLoggerDebug = jest.fn();
const mockLoggerGroup = jest.fn();
jest.mock('../core/logger', () => ({
  logger: {
    info: mockLoggerInfo,
    debug: mockLoggerDebug,
    error: jest.fn(),
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

import { listHandler } from './list';

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

const makePackageJson = (overrides: Partial<PackageJson> = {}): PackageJson => ({
  name: 'tool-linux-x64',
  version: '1.0.0',
  os: ['linux'],
  cpu: ['x64'],
  bin: { tool: 'tool' },
  files: [],
  keywords: [],
  ...overrides,
});

const makeArgs = (overrides: Partial<ListParams> = {}): ListParams => ({
  project: '/project',
  builder: 'default',
  description: undefined,
  prefix: undefined,
  verbose: false,
  keywords: [],
  ...overrides,
});

describe('listHandler', () => {
  beforeEach(() => {
    mockParseArtifactsFile.mockResolvedValue([makeArtifact()]);
    mockParseMetadata.mockResolvedValue(makeMetadata());
    mockTransformPackage.mockReturnValue(makePackageDef());
    mockFormatPackageJson.mockReturnValue(makePackageJson());
    mockFormatMainPackageJson.mockReturnValue(makePackageJson({ name: 'tool', optionalDependencies: { 'tool-linux-x64': '1.0.0' } }));
    mockLoggerGroup.mockImplementation(async (_name: string, fn: () => Promise<unknown>) => fn());
  });

  it('loads metadata and artifacts', async () => {
    await listHandler(makeArgs());

    expect(mockParseMetadata).toHaveBeenCalled();
    expect(mockParseArtifactsFile).toHaveBeenCalled();
  });

  it('transforms artifacts into package definitions', async () => {
    await listHandler(makeArgs());

    expect(mockTransformPackage).toHaveBeenCalledWith(
      expect.objectContaining({ artifact: makeArtifact(), metadata: makeMetadata() }),
    );
  });

  it('uses project_name as builder when builder is not provided', async () => {
    mockParseArtifactsFile.mockResolvedValue([
      makeArtifact({ extra: { Binary: 'tool', Builder: 'tool', Ext: '', ID: 'tool' } }),
    ]);

    await listHandler(makeArgs({ builder: undefined }));

    expect(mockTransformPackage).toHaveBeenCalled();
  });

  it('filters artifacts by builder', async () => {
    mockParseArtifactsFile.mockResolvedValue([
      makeArtifact({ extra: { Binary: 'other', Ext: '', ID: 'other' } }),
      makeArtifact(),
    ]);

    await listHandler(makeArgs({ builder: 'default' }));

    expect(mockTransformPackage).toHaveBeenCalledTimes(1);
  });

  it('passes description option to formatPackageJson', async () => {
    await listHandler(makeArgs({ description: 'My tool' }));

    expect(mockFormatPackageJson).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'My tool' }),
    );
  });

  it('passes prefix option to formatPackageJson', async () => {
    await listHandler(makeArgs({ prefix: '@scope' }));

    expect(mockFormatPackageJson).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: '@scope' }),
    );
  });

  it('passes keywords to formatMainPackageJson', async () => {
    await listHandler(makeArgs({ keywords: ['cli'] }));

    expect(mockFormatMainPackageJson).toHaveBeenCalledWith(
      expect.objectContaining({ keywords: ['cli'] }),
    );
  });

  it('logs version info for each package', async () => {
    await listHandler(makeArgs());

    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('version'));
  });

  it('logs optional dependencies when present', async () => {
    mockFormatMainPackageJson.mockReturnValue(
      makePackageJson({ optionalDependencies: { 'tool-linux-x64': '1.0.0' } }),
    );

    await listHandler(makeArgs());

    expect(mockLoggerDebug).toHaveBeenCalledWith(
      expect.stringContaining('optionalDependencies'),
    );
  });

  it('logs description when present', async () => {
    mockFormatPackageJson.mockReturnValue(makePackageJson({ description: 'A tool' }));

    await listHandler(makeArgs());

    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('description'));
  });

  it('logs keywords when present', async () => {
    mockFormatPackageJson.mockReturnValue(makePackageJson({ keywords: ['cli', 'tool'] }));

    await listHandler(makeArgs());

    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('keywords'));
  });

  it('logs bin path for platform packages', async () => {
    await listHandler(makeArgs());

    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('bin'));
  });
});

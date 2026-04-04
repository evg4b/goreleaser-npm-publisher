import { formatMainPackageJson, formatPackageJson, formatPackageName, transformPackage } from './transform';

const artifact: BinaryArtifact = {
  name: 'myapp',
  path: 'dist/myapp_linux_amd64/myapp',
  goos: 'linux',
  goarch: 'amd64',
  internal_type: 4,
  type: 'Binary',
  extra: {
    Binary: 'myapp',
    Builder: 'go',
    Ext: '',
    ID: 'myapp',
  },
};

const metadata: Metadata = {
  project_name: 'myapp',
  version: '1.2.3',
  tag: 'v1.2.3',
  previous_tag: 'v1.2.2',
  commit: 'abc123',
  date: '2024-01-01',
  runtime: { goos: 'linux', goarch: 'amd64' },
};

describe('transformPackage', () => {
  it('should map artifact and metadata to package definition', () => {
    const result = transformPackage({ artifact, metadata, files: ['LICENSE'], keywords: ['cli'], license: 'MIT' });

    expect(result).toEqual({
      name: 'myapp_linux_amd64',
      version: '1.2.3',
      os: 'linux',
      cpu: 'x64',
      bin: 'myapp',
      sourceBinary: 'dist/myapp_linux_amd64/myapp',
      destinationBinary: 'dist/myapp_linux_amd64/myapp',
      files: ['LICENSE'],
      keywords: ['cli'],
      license: 'MIT',
    });
  });

  it('should include ext in bin when present', () => {
    const winArtifact: BinaryArtifact = {
      ...artifact,
      goos: 'windows',
      goarch: 'amd64',
      extra: { ...artifact.extra, Ext: '.exe' },
    };

    const result = transformPackage({ artifact: winArtifact, metadata, files: [], keywords: [] });

    expect(result.bin).toBe('myapp.exe');
  });
});

describe('formatPackageName', () => {
  const pkg: PackageDefinition = {
    name: 'myapp_linux_amd64',
    version: '1.2.3',
    os: 'linux',
    cpu: 'x64',
    bin: 'myapp',
    sourceBinary: 'dist/myapp_linux_amd64/myapp',
    destinationBinary: 'dist/myapp_linux_amd64/myapp',
    files: [],
    keywords: [],
  };

  it('should return plain name when no prefix', () => {
    expect(formatPackageName(pkg, undefined)).toBe('myapp_linux_amd64');
  });

  it('should return prefixed name when prefix given', () => {
    expect(formatPackageName(pkg, '@scope')).toBe('@scope/myapp_linux_amd64');
  });

  it('should return project_name when metadata provided without prefix', () => {
    expect(formatPackageName(metadata, undefined)).toBe('myapp');
  });

  it('should return prefixed project_name when metadata provided with prefix', () => {
    expect(formatPackageName(metadata, '@scope')).toBe('@scope/myapp');
  });
});

describe('formatPackageJson', () => {
  const pkg: PackageDefinition = {
    name: 'myapp_linux_amd64',
    version: '1.2.3',
    os: 'linux',
    cpu: 'x64',
    bin: 'myapp',
    sourceBinary: 'dist/myapp_linux_amd64/myapp',
    destinationBinary: 'dist/myapp_linux_amd64/myapp',
    files: ['LICENSE'],
    keywords: ['cli'],
    license: 'MIT',
  };

  it('should format package.json correctly', () => {
    const result = formatPackageJson({ pkg, description: 'A CLI tool', prefix: '@scope', files: ['LICENSE'], keywords: ['cli'] });

    expect(result).toEqual({
      name: '@scope/myapp_linux_amd64',
      description: 'A CLI tool',
      version: '1.2.3',
      bin: { myapp_linux_amd64: 'myapp' },
      os: ['linux'],
      cpu: ['x64'],
      files: ['LICENSE'],
      keywords: ['cli'],
      license: 'MIT',
    });
  });

  it('should omit description when undefined', () => {
    const result = formatPackageJson({ pkg, description: undefined, prefix: undefined, files: [], keywords: [] });

    expect(result).not.toHaveProperty('description');
  });
});

describe('formatMainPackageJson', () => {
  const packages: PackageDefinition[] = [
    {
      name: 'myapp_linux_amd64',
      version: '1.2.3',
      os: 'linux',
      cpu: 'x64',
      bin: 'myapp',
      sourceBinary: '',
      destinationBinary: '',
      files: [],
      keywords: [],
    },
    {
      name: 'myapp_darwin_arm64',
      version: '1.2.3',
      os: 'darwin',
      cpu: 'arm64',
      bin: 'myapp',
      sourceBinary: '',
      destinationBinary: '',
      files: [],
      keywords: [],
    },
  ];

  it('should format main package.json with optional dependencies', () => {
    const result = formatMainPackageJson({
      packages,
      metadata,
      description: 'Main package',
      prefix: '@scope',
      files: ['index.js'],
      keywords: ['cli'],
      license: 'MIT',
    });

    expect(result).toEqual({
      name: '@scope/myapp',
      description: 'Main package',
      version: '1.2.3',
      bin: { myapp: 'index.js' },
      optionalDependencies: {
        '@scope/myapp_linux_amd64': '1.2.3',
        '@scope/myapp_darwin_arm64': '1.2.3',
      },
      os: ['linux', 'darwin'],
      cpu: ['x64', 'arm64'],
      files: ['index.js'],
      keywords: ['cli'],
      license: 'MIT',
    });
  });

  it('should deduplicate os and cpu', () => {
    const dupePackages: PackageDefinition[] = [
      { ...packages[0] },
      { ...packages[0], name: 'myapp_linux_arm64', cpu: 'arm64' },
    ];

    const result = formatMainPackageJson({
      packages: dupePackages,
      metadata,
      description: undefined,
      prefix: undefined,
      files: [],
      keywords: [],
    });

    expect(result.os).toEqual(['linux']);
    expect(result.cpu).toEqual(['x64', 'arm64']);
  });

  it('should omit description when undefined', () => {
    const result = formatMainPackageJson({
      packages,
      metadata,
      description: undefined,
      prefix: undefined,
      files: [],
      keywords: [],
    });

    expect(result).not.toHaveProperty('description');
  });
});

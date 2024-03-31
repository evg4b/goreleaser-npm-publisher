type GOOS = 'aix'
  | 'android'
  | 'darwin'
  | 'dragonfly'
  | 'freebsd'
  | 'hurd'
  | 'illumos'
  | 'ios'
  | 'js'
  | 'linux'
  | 'nacl'
  | 'netbsd'
  | 'openbsd'
  | 'plan9'
  | 'solaris'
  | 'windows'
  | 'zos';

type GOARCH = '386'
  | 'amd64'
  | 'amd64p32'
  | 'arm'
  | 'arm64'
  | 'arm64be'
  | 'armbe'
  | 'loong64'
  | 'mips'
  | 'mips64'
  | 'mips64le'
  | 'mips64p32'
  | 'mips64p32le'
  | 'mipsle'
  | 'ppc'
  | 'ppc64'
  | 'ppc64le'
  | 'riscv'
  | 'riscv64'
  | 's390'
  | 's390x'
  | 'sparc'
  | 'sparc64'
  | 'wasm'

interface BinaryArtifact {
  name: string;
  path: string;
  goos: GOOS;
  goarch: GOARCH;
  goamd64?: string;
  internal_type: 4,
  type: 'Binary',
  extra: {
    Binary: string;
    Ext: string;
    ID: string;
  }
}

interface ArchiveArtifact {
  name: string;
  path: string;
  goos: GOOS;
  goarch: GOARCH;
  goamd64?: string;
  internal_type: 1,
  type: 'Archive',
  extra: {
    Binaries: string[],
    Checksum: string;
    Format: string;
    ID: string;
    Replaces: string | null,
    WrappedIn: string
  }
}

interface ChecksumArtifact {
  name: string,
  path: string,
  internal_type: 12,
  type: 'Checksum',
  extra: NonNullable<unknown>,
}

type Artifact = BinaryArtifact | ArchiveArtifact | ChecksumArtifact;

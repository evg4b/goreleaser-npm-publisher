type CPU = 'arm'
  | 'arm64'
  | 'ia32'
  | 'loong64'
  | 'mips'
  | 'mipsel'
  | 'ppc'
  | 'ppc64'
  | 'riscv64'
  | 's390'
  | 's390x'
  | 'x64';
type OS = 'aix'
  | 'android'
  | 'darwin'
  | 'freebsd'
  | 'haiku'
  | 'linux'
  | 'openbsd'
  | 'sunos'
  | 'win32'
  | 'cygwin'
  | 'netbsd';

interface PackageDefinition {
  name: string;
  version: string;
  sourceBinary: string;
  bin: string;
  destinationBinary: string;
  os: OS;
  cpu: CPU;
  files: string[];
  keywords: string[];
  license?: string;
}

interface PackageJson {
  name: string;
  description?: string;
  version: string;
  optionalDependencies?: Record<string, string>;
  bin: Record<string, string>;
  os: OS[];
  cpu: CPU[];
  files: string[];
  keywords: string[];
  license?: string;
}

type CPU = typeof process.arch;
type OS = typeof process.platform;

interface PackageDefinition {
  name: string;
  version: string;
  sourceBinary: string;
  bin: string;
  destinationBinary: string;
  os: OS;
  cpu: CPU;
  files: string[];
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
}

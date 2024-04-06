type CPU = typeof process.arch;
type OS = typeof process.platform;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PackageDefinition {
  name: string;
  version: string;
  sourceBinary: string;
  bin: string;
  destinationBinary: string;
  os: OS;
  cpu: CPU;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PackageJson {
  name: string;
  description: string;
  version: string;
  optionalDependencies?: Record<string, string>;
  bin: string;
  os: OS[],
  cpu: CPU[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PackageDefinition {
  name: string;
  version: string;
  sourceBinary: string;
  bin: string;
  destinationBinary: string;
  os: string;
  cpu: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PackageJson {
  name: string;
  description: string;
  version: string;
  bin: string;
  os: string[],
  cpu: string[];
}

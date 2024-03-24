interface PackageDefinition {
  name: string;
  version: string;
  sourceBinary: string;
  bin: string;
  destinationBinary: string;
  os: string[],
  cpu: string[];
}

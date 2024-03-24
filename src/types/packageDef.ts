interface PackageDefinition {
  name: string;
  version: string;
  sourceBinary: string;
  destinationBinary: string;
  os: string[],
  cpu: string[];
}

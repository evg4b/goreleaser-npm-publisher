export const transformPackage = (artifact: Artifact, metadata: Metadata): PackageDefinition => ({
  name: metadata.project_name,
  version: `v${ metadata.version }`,
  os: [artifact.goos ?? ''],
  cpu: [artifact.goarch ?? ''],
  bin: `${ artifact.extra.Binary ?? '' }${ artifact.extra.Ext ?? '' }`,
  sourceBinary: artifact.path,
  destinationBinary: artifact.path,
});

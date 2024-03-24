export const transformPackage = (artifact: Artifact, metadata: Metadata): PackageDefinition => ({
    name: metadata.project_name,
    version: `v${ metadata.version }`,
    os: [artifact.goos ?? ''],
    cpu: [artifact.goarch ?? ''],
    sourceBinary: artifact.path,
    destinationBinary: artifact.path,
});

jest.mock('@core/files', () => ({
  parseArtifactsFile: jest.fn().mockName('parseArtifactsFile'),
  parseMetadata: jest.fn().mockName('parseMetadata'),
  findFiles: jest.fn().mockName('findFiles'),
  validateBinaryArtifact: jest.fn().mockName('validateBinaryArtifact'),
  writePackage: jest.fn().mockName('writePackage'),
}));

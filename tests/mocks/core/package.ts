jest.mock('@core/package', () => ({
  ...jest.requireActual<object>('@core/package'),
  transformPackage: jest.fn().mockName('transformPackage'),
  formatPackageJson: jest.fn().mockName('formatPackageJson'),
  formatMainPackageJson: jest.fn().mockName('formatMainPackageJson'),
}));

const mockTransformPackage = jest.fn();
const mockFormatPackageJson = jest.fn();
const mockFormatMainPackageJson = jest.fn();

jest.mock('@core/package', () => ({
  ...jest.requireActual<object>('@core/package'),
  transformPackage: mockTransformPackage,
  formatPackageJson: mockFormatPackageJson,
  formatMainPackageJson: mockFormatMainPackageJson,
}));

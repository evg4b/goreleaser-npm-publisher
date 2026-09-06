jest.mock('@helpers/fs', () => ({
  copyFile: jest.fn().mockName('copyFile'),
  mkdir: jest.fn().mockName('mkdir'),
  writeFile: jest.fn().mockName('writeFile'),
}));

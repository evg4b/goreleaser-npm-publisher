jest.mock('@helpers/fs', () => ({
  copyFile: jest.fn().mockName('copyFile'),
  mkdir: jest.fn().mockName('mkdir'),
  readFile: jest.fn().mockName('readFile'),
  rm: jest.fn().mockName('rm'),
  writeFile: jest.fn().mockName('writeFile'),
}));

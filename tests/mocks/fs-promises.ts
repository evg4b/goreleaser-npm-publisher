jest.mock('node:fs/promises', () => ({
  copyFile: jest.fn().mockName('copyFile'),
  mkdir: jest.fn().mockName('mkdir'),
  readFile: jest.fn().mockName('readFile'),
  readdir: jest.fn().mockName('readdir'),
  rm: jest.fn().mockName('rm'),
  stat: jest.fn().mockName('stat'),
  writeFile: jest.fn().mockName('writeFile'),
}));

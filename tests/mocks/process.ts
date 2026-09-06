jest.mock('node:process', () => ({
  cwd: jest.fn(() => '/project').mockName('cwd'),
}));

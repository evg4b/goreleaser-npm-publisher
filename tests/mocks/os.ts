jest.mock('node:os', () => ({
  platform: jest.fn(() => 'linux').mockName('platform'),
  EOL: '\n',
}));

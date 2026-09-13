jest.mock('node:os', () => ({
  ...jest.requireActual<typeof import('node:os')>('node:os'),
  platform: jest.fn(() => 'linux').mockName('platform'),
}));

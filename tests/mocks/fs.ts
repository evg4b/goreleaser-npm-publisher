jest.mock('node:fs', () => ({
  ...jest.requireActual<typeof import('node:fs')>('node:fs'),
  accessSync: jest.fn().mockName('accessSync'),
}));

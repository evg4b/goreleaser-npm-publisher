jest.mock('node:fs/promises', () => ({
  ...jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises'),
  access: jest.fn().mockName('access'),
}));

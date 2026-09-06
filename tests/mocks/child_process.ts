jest.mock('node:child_process', () => ({
  spawn: jest.fn().mockName('spawn'),
}));

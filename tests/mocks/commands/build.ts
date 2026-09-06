jest.mock('@commands/build', () => ({
  buildHandler: jest.fn().mockName('buildHandler'),
}));

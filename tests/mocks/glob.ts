jest.mock('glob', () => ({
  glob: jest.fn().mockName('glob'),
}));

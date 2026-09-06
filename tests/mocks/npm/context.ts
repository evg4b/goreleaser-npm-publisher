jest.mock('@npm/context', () => ({
  execInContext: jest.fn().mockName('execInContext'),
}));

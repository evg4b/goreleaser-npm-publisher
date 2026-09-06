jest.mock('@npm', () => ({
  ...jest.requireActual<object>('@npm'),
  publish: jest.fn().mockName('publish'),
  whoami: jest.fn().mockName('whoami'),
}));

jest.mock('@npm/exec', () => ({
  npmExec: jest.fn().mockName('npmExec'),
}));

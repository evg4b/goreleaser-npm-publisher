jest.mock('@core/gorealiser', () => ({
  Context: jest.fn().mockName('Context'),
}));

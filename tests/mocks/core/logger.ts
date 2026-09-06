jest.mock('@core/logger', () => ({
  logger: {
    debug: jest.fn().mockName('logger.debug'),
    info: jest.fn().mockName('logger.info'),
    error: jest.fn().mockName('logger.error'),
    warning: jest.fn().mockName('logger.warning'),
    group: jest.fn().mockName('logger.group'),
  },
}));

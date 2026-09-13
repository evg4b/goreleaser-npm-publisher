import { mockExit, ProcessExited } from '@mocks/exit';

import { fail } from './fail';

describe('fail', () => {
  let error: jest.SpyInstance;

  beforeEach(() => (error = jest.spyOn(console, 'error').mockImplementation(() => undefined)));

  afterEach(() => error.mockRestore());

  it('reports the message and exits with 1', () => {
    const exit = mockExit();

    expect(() => fail('boom')).toThrow(ProcessExited);

    expect(error).toHaveBeenCalledWith('boom');
    expect(exit).toHaveBeenCalledWith(1);
  });
});

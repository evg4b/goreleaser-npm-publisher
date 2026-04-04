import { NpmExecError } from './error';

describe('NpmExecError', () => {
  const errorData = {
    code: 'E404',
    summary: 'Package not found',
    detail: 'The package does not exist in the registry',
  };

  let error: NpmExecError;

  beforeEach(() => {
    error = new NpmExecError(errorData);
  });

  it('should be an instance of Error', () => {
    expect(error).toBeInstanceOf(Error);
  });

  it('should set code', () => {
    expect(error.code).toBe('E404');
  });

  it('should set summary', () => {
    expect(error.summary).toBe('Package not found');
  });

  it('should set detail', () => {
    expect(error.detail).toBe('The package does not exist in the registry');
  });

  it('should format message with code and summary', () => {
    expect(error.message).toBe('[E404]: Package not found');
  });
});

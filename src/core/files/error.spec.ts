import { FileFormatError } from './error';

describe('FileFormatError', () => {
  it('should join error messages into the message', () => {
    const error = new FileFormatError([{ message: 'field required' }, { message: 'wrong type' }] as never);

    expect(error.message).toBe('field required\nwrong type');
  });

  it('should fall back to Unknown error when errors is null', () => {
    const error = new FileFormatError(null);

    expect(error.message).toBe('Unknown error');
  });

  it('should fall back to Unknown error when errors is undefined', () => {
    const error = new FileFormatError(undefined);

    expect(error.message).toBe('Unknown error');
  });

  it('should be an instance of Error', () => {
    expect(new FileFormatError(null)).toBeInstanceOf(Error);
  });
});

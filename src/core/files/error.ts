import { ErrorObject } from 'ajv/dist/types';

export class FileFormatError extends Error {
  constructor(errors: undefined | null | ErrorObject[]) {
    const errorList = errors ?? [{ message: 'Unknown error' }];
    super(errorList.map(p => p.message).join('\n'));
  }
}

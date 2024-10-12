import { npmExec } from './exec';
import { BaseOptions } from './models';

export const whoami = (path?: string, options?: BaseOptions) => {
  return npmExec<string>(['whoami'], {
    pwd: path,
    token: options?.token,
  });
};

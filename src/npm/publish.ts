import { npmExec } from './exec';
import { BaseOptions, PublishResponse } from './models';

export const publish = async (path?: string, options?: BaseOptions) => {
  return npmExec<PublishResponse>(['publish', '--access', 'public'], {
    pwd: path,
    token: options?.token,
  });
};

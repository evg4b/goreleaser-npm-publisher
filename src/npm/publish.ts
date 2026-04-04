import { npmExec } from './exec';
import { BaseOptions, PublishResponse } from './models';

export const publish = async (path?: string, options?: BaseOptions) => {
  const args = ['publish', '--access', 'public'];
  if (options?.otp) {
    args.push('--otp', options.otp);
  }

  return npmExec<PublishResponse>(args, {
    pwd: path,
    token: options?.token,
    otp: options?.otp,
  });
};

import { npmExec } from './exec';
import { BaseOptions, PublishResponse } from './models';
import { first } from 'lodash';

export const publish = async (path?: string, options?: BaseOptions): Promise<PublishResponse> => {
  const args = ['publish', '--access', 'public'];
  if (options?.otp) {
    args.push('--otp', options.otp);
  }

  const result = await npmExec<PublishResponse | Record<string, PublishResponse>>(args, {
    pwd: path,
    token: options?.token,
    otp: options?.otp,
  });

  if (isPublishResponse(result)) {
    return result;
  }

  const extracted = first(Object.values(result));
  if (extracted) {
    return extracted;
  }

  throw new Error('Unexpected response from npm publish');
};

const isPublishResponse = (value: PublishResponse | Record<string, PublishResponse>): value is PublishResponse => {
  return 'id' in value && 'name' in value && 'version' in value && 'shasum' in value;
};

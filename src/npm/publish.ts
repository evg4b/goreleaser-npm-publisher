import { npmExec } from './exec';
import { BaseOptions } from './models';

export interface PublishResponse {
  id: string;
  name: string;
  version: string;
  size: number;
  unpackedSize: number;
  shasum: string;
  integrity: string;
  filename: string;
  files: File[];
  entryCount: number;
  bundled: unknown[];
}

export interface File {
  path: string;
  size: number;
  mode: number;
}

export const publish = async (path?: string, options?: BaseOptions) => {
  return npmExec<PublishResponse>(['publish', '--access', 'public'], {
    pwd: path,
    token: options?.token ?? '',
  });
};

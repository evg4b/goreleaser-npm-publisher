import { ArgumentsCamelCase } from 'yargs';

export const publishHandler: ((args: ArgumentsCamelCase<DefaultParams>) => (void | Promise<void>)) = async () => {
  throw new Error('Not implemented');
};

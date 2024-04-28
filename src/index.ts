import { type ArgumentsCamelCase } from 'yargs';
import { publishHandler } from './commands';

type Params = ArgumentsCamelCase<Omit<DefaultParams, 'clear'>>;
export default async (options: Params) => {
  await publishHandler({ ...options, clear: true });
};

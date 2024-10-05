import { buildHandler, listHandler, publishHandler } from './commands';

export { setLogger } from './core/logger';

export const publish = publishHandler;
export const list = listHandler;
export const build = buildHandler;

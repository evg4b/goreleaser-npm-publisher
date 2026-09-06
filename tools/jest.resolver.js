'use strict';

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { compile, PREFIX } from './inline-compiled.js';

const CACHE_DIR = join(__dirname, '..', 'node_modules', '.cache', 'inline-compiled');

/**
 * Jest counterpart of the `inline-compiled` tsup plugin: resolves
 * `inline-compiled:<path>` to a generated module exporting the compiled source
 * of `<path>` as a string.
 */
module.exports = (request, options) => {
  if (!request.startsWith(PREFIX)) {
    return options.defaultResolver(request, options);
  }

  const entryPoint = options.defaultResolver(request.slice(PREFIX.length), options);
  const { code } = compile(entryPoint);

  mkdirSync(CACHE_DIR, { recursive: true });
  const generated = join(CACHE_DIR, `${ createHash('sha256').update(entryPoint).digest('hex') }.js`);
  writeFileSync(
    generated,
    `'use strict';\nObject.defineProperty(exports, '__esModule', { value: true });\nexports.default = ${ JSON.stringify(code) };\n`,
  );

  return generated;
};

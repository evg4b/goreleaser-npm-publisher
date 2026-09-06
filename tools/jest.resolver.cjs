'use strict';

// CommonJS on purpose: Jest loads a custom resolver synchronously, so this file
// cannot be ESM. It reaches the ESM core through Node's `require(esm)` support.
const { createHash } = require('node:crypto');
const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { compile, PREFIX } = require('./inline-compiled.js');

const CACHE_DIR = join(__dirname, '..', 'node_modules', '.cache', 'inline-compiled');

// Mirrors the `paths` aliases from tsconfig.json / moduleNameMapper in
// jest.config.js. `options.defaultResolver` does not apply those, so the inner
// path of an `inline-compiled:<path>` request has to be de-aliased by hand.
const ROOT = join(__dirname, '..');
const ALIASES = [
  [/^@core\/(.*)$/, 'src/core/$1'],
  [/^@helpers\/(.*)$/, 'src/helpers/$1'],
  [/^@helpers$/, 'src/helpers'],
  [/^@npm$/, 'src/npm'],
  [/^@npm\/(.*)$/, 'src/npm/$1'],
  [/^@commands\/(.*)$/, 'src/commands/$1'],
  [/^@shim$/, 'src/shim'],
  [/^@mocks\/(.*)$/, 'tests/mocks/$1'],
];

const dealias = request => {
  for (const [pattern, replacement] of ALIASES) {
    if (pattern.test(request)) {
      return join(ROOT, request.replace(pattern, replacement));
    }
  }
  return request;
};

/**
 * Jest counterpart of the `inline-compiled` tsup plugin: resolves
 * `inline-compiled:<path>` to a generated module exporting the compiled source
 * of `<path>` as a string.
 */
module.exports = (request, options) => {
  if (!request.startsWith(PREFIX)) {
    return options.defaultResolver(request, options);
  }

  const entryPoint = options.defaultResolver(dealias(request.slice(PREFIX.length)), options);
  const { code } = compile(entryPoint);

  mkdirSync(CACHE_DIR, { recursive: true });
  const generated = join(CACHE_DIR, `${createHash('sha256').update(entryPoint).digest('hex')}.js`);
  writeFileSync(
    generated,
    `'use strict';\nObject.defineProperty(exports, '__esModule', { value: true });\nexports.default = ${JSON.stringify(code)};\n`,
  );

  return generated;
};

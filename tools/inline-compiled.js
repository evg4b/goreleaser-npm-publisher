import { buildSync } from 'esbuild';
import { resolve } from 'node:path';

/** Import prefix that marks a module to be inlined as its compiled source. */
export const PREFIX = 'inline-compiled:';

/**
 * Bundles `entryPoint` into a standalone CJS script and returns its source
 * together with every file that went into it (for watch mode invalidation).
 *
 * `options` may not override the settings that make the result inlineable: a
 * single in-memory node script with no sourcemap alongside it.
 */
export const compile = (entryPoint, options = {}) => {
  const result = buildSync({
    platform: 'node',
    ...options,
    format: 'cjs',
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    metafile: true,
    sourcemap: false,
    // buildSync rejects plugins outright, and re-running them here would recurse.
    plugins: undefined,
  });

  return {
    code: result.outputFiles[0].text,
    // metafile paths are relative to cwd; esbuild's `watchFiles` wants absolute.
    inputs: Object.keys(result.metafile.inputs).map(input => resolve(input)),
  };
};

'use strict';

import { buildSync } from 'esbuild';
import { resolve } from 'node:path';

export const PREFIX = 'inline-compiled:';

export const compile = (entryPoint, options = {}) => {
  const result = buildSync({
    format: 'cjs',
    platform: 'node',
    target: 'node16',
    ...options,
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    metafile: true,
    sourcemap: false,
    plugins: undefined,
  });

  return {
    code: result.outputFiles[0].text,
    inputs: Object.keys(result.metafile.inputs)
      .map(input => resolve(input)),
  };
};

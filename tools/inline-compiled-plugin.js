'use strict';

import { dirname } from 'node:path';
import { PREFIX, compile } from './inline-compiled.js';

const NAMESPACE = 'inline-compiled';

const inlineCompiledPlugin = {
  name: NAMESPACE,
  setup(build) {
    const options = JSON.parse(JSON.stringify(build.initialOptions));

    build.onResolve({ filter: new RegExp(`^${PREFIX}`) }, async args => {
      const resolved = await build.resolve(args.path.slice(PREFIX.length), {
        kind: 'import-statement',
        importer: args.importer,
        resolveDir: args.resolveDir || dirname(args.importer),
      });

      if (resolved.errors.length > 0) {
        return { errors: resolved.errors };
      }

      return { path: resolved.path, namespace: NAMESPACE };
    });

    build.onLoad({ filter: /.*/, namespace: NAMESPACE }, args => {
      const { code, inputs } = compile(args.path, options);

      return {
        contents: `export default ${ JSON.stringify(code) };`,
        loader: 'js',
        watchFiles: inputs,
      };
    });
  },
};

export default { inlineCompiledPlugin };

import { dirname } from 'node:path';
import { compile, PREFIX } from './inline-compiled.js';

const NAMESPACE = 'inline-compiled';

/**
 * Options worth carrying over from the host build. The rest of `initialOptions`
 * describes how to emit *that* bundle (entry points, out dir, sourcemaps,
 * banners, plugins) and would either be overwritten or break the nested build.
 *
 * `target` is deliberately not inherited: the inlined script runs on the end
 * user's machine under the published package's `engines`, not on whatever the
 * host bundle targets. Inheriting it also made the built shim differ from the
 * one the tests compile.
 */
const INHERITED_OPTIONS = [
  'define',
  'minify',
  'minifyIdentifiers',
  'minifySyntax',
  'minifyWhitespace',
  'tsconfig',
  'tsconfigRaw',
];

const inheritedOptions = initialOptions =>
  Object.fromEntries(
    INHERITED_OPTIONS.filter(key => initialOptions[key] !== undefined).map(key => [key, initialOptions[key]]),
  );

/**
 * Resolves `inline-compiled:<path>` imports by bundling the target module into a
 * standalone script and inlining it as a default-exported string.
 */
export const inlineCompiledPlugin = {
  name: NAMESPACE,
  setup(build) {
    const options = inheritedOptions(build.initialOptions);

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
        contents: `export default ${JSON.stringify(code)};`,
        loader: 'js',
        watchFiles: inputs,
      };
    });
  },
};

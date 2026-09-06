import { defineConfig } from 'tsup';
import { createRequire } from 'node:module';
import pkg from './package.json' with { type: 'json' };

// Loaded through `require` so tsup's config bundler leaves the CommonJS tools
// (and their own `require('esbuild')`) alone instead of inlining them into ESM.
const { inlineCompiledPlugin } = createRequire(import.meta.url)('./tools/inline-compiled-plugin.js');

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig(options => ({
  ...options,
  entry: {
    cli: 'src/cli.ts',
    index: 'src/index.ts',
  },
  splitting: false,
  sourcemap: !isProd,
  target: 'node14',
  minify: isProd,
  outDir: 'dist',
  format: 'cjs',
  dts: {
    entry: 'src/index.ts',
  },
  platform: 'node',
  treeshake: true,
  bundle: true,
  clean: true,
  minifySyntax: isProd,
  minifyIdentifiers: isProd,
  minifyWhitespace: isProd,
  external: ['./mapping.json'],
  noExternal: ['es-toolkit', 'picocolors', 'glob'],
  define: {
    __DEV__: JSON.stringify(!isProd),
    __VERSION__: JSON.stringify(pkg.version),
  },
  esbuildPlugins: [inlineCompiledPlugin],
}));

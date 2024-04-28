import { defineConfig } from 'tsup';
import { readFile } from 'node:fs/promises';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig(async options => {
  const file = await readFile('package.json', 'utf-8');
  const { version } = JSON.parse(file);

  return ({
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
    dts: false,
    platform: 'node',
    treeshake: true,
    bundle: true,
    minifySyntax: isProd,
    clean: true,
    minifyIdentifiers: isProd,
    define: {
      __DEV__: JSON.stringify(!isProd),
      __VERSION__: JSON.stringify(version),
    },
  });
});

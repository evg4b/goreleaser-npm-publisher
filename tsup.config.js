import { defineConfig } from 'tsup';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/cli.ts',
  ],
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
});

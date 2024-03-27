import { defineConfig } from 'tsup';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: !isProd,
  target: 'node14',
  minify: isProd,
  outDir: 'dist',
  format: 'cjs',
  dts: isProd,
  platform: 'node',
  bundle: true,
  minifySyntax: isProd,
});

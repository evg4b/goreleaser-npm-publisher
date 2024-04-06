import { defineConfig } from 'tsup';
import packageJson from './package.json';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: !isProd,
  target: 'node14',
  minify: isProd,
  outDir: 'dist',
  format: 'cjs',
  dts: false,
  banner: {
    js: `/* ${packageJson.name} v${packageJson.version} */`,
  },
  platform: 'node',
  treeshake: true,
  bundle: true,
  minifySyntax: isProd,
  clean: true,
  minifyIdentifiers: isProd,
});

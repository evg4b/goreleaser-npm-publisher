import { glob } from 'glob';

export const findFiles = (cwd: string, files: string[]) => glob(files, {
  cwd,
  debug: __DEV__,
  nocase: true,
  ignore: ['node_modules/**', 'dist/'],
});

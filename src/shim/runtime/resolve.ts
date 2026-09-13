import { dirname, join } from 'node:path';
import { fail } from './fail';

export const resolveBinary = (mapping: Mapping, key: string): string => {
  const definition = mapping[key];
  if (!definition) {
    return fail(`Unsupported platform: ${key}. Supported: ${Object.keys(mapping).join(', ')}`);
  }

  try {
    const packageJsonPath = require.resolve(join(...definition.name, 'package.json'));

    return join(dirname(packageJsonPath), definition.bin);
  } catch {
    return fail(`Missing platform package ${definition.name.join('/')} for ${key}. Reinstall without --no-optional.`);
  }
};

import { dirname, join } from 'node:path';
import { fail } from './helpers';

export const resolveBinary = (mapping: Mapping, key: string): string => {
  const definition = mapping[key];
  if (!definition) {
    return fail(`Unsupported platform: ${key}. Supported: ${Object.keys(mapping).join(', ')}`);
  }

  const name = definition.name.join('/');
  try {
    const packageJsonPath = require.resolve(join(...definition.name, 'package.json'));

    return join(dirname(packageJsonPath), definition.bin);
  } catch (error) {
    const { code, message } = error as NodeJS.ErrnoException;

    return fail(
      code === 'MODULE_NOT_FOUND'
        ? `The platform package ${name} is not installed. Remove node_modules and install again, and check that optional dependencies are not being skipped.`
        : `Could not resolve the platform package ${name}: ${message}`,
    );
  }
};

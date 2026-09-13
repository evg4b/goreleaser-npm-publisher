import { dirname, join } from 'node:path';
import { fail } from './fail';

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
    return fail(
      isNotInstalled(error)
        ? `The platform package ${name} is not installed. Remove node_modules and install again, and check that optional dependencies are not being skipped.`
        : `Could not resolve the platform package ${name}: ${reason(error)}`,
    );
  }
};

const isNotInstalled = (error: unknown): boolean =>
  (error as NodeJS.ErrnoException | null)?.code === 'MODULE_NOT_FOUND';

const reason = (error: unknown): string => String((error as Error | null)?.message ?? error);

#!/usr/bin/env node

import { join, dirname } from 'path';
import { spawn } from 'child_process';
import { exit, platform, arch, argv, env } from 'process';

declare const __INLINE_MAPPING__: Mapping;

type Mapping = Record<string, { name: string[]; bin: string }>;

const mapping: Mapping = __INLINE_MAPPING__;
const definition = mapping[platform + '_' + arch];
const packageJsonPath = require.resolve(join(...definition.name, 'package.json'));
const packagePath = join(dirname(packageJsonPath), definition.bin);

const child = spawn(packagePath, argv.slice(2), {
  stdio: 'inherit',
  env: env,
});

child.on('exit', (code) => exit(code));

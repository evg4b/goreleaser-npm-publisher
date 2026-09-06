#!/usr/bin/env node
import { join, dirname } from 'node:path';
import { spawn } from 'node:child_process';
import { exit, platform, arch, argv, env } from 'node:process';

// noinspection UnnecessaryLocalVariableJS
const mapping: Mapping = __INLINE_MAPPING__;
const definition = mapping[platform + '_' + arch];
const packageJsonPath = require.resolve(join(...definition.name, 'package.json'));
const packagePath = join(dirname(packageJsonPath), definition.bin);

const child = spawn(packagePath, argv.slice(2), {
  stdio: 'inherit',
  env: env,
});

child.on('exit', exit);

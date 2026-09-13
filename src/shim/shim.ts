#!/usr/bin/env node
import { join, dirname } from 'node:path';
import { platform, arch, argv, env } from 'node:process';
import { run } from './run';

// noinspection UnnecessaryLocalVariableJS
const mapping: Mapping = __INLINE_MAPPING__;
const definition = mapping[platform + '_' + arch];
const packageJsonPath = require.resolve(join(...definition.name, 'package.json'));
const packagePath = join(dirname(packageJsonPath), definition.bin);

run(packagePath, argv.slice(2), env);

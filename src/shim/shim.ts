#!/usr/bin/env node
import { arch, argv, env, platform } from 'node:process';
import { resolveBinary } from './resolve-binary';
import { run } from './run';

// noinspection UnnecessaryLocalVariableJS
const mapping: Mapping = __INLINE_MAPPING__;

void run(resolveBinary(mapping, platform + '_' + arch), argv.slice(2), env);

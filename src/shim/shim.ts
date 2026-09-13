#!/usr/bin/env node
import { arch, argv, env, platform } from 'node:process';
import { resolveBinary, run } from './runtime';

// noinspection UnnecessaryLocalVariableJS
const mapping: Mapping = __INLINE_MAPPING__;

run(resolveBinary(mapping, platform + '_' + arch), argv.slice(2), env);

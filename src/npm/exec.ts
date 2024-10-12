import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import { cwd } from 'node:process';
import { execInContext, type NpmExecContext } from './context';

const IS_WINDOWS = platform() === 'win32';
const NPM_BIN = IS_WINDOWS ? 'npm.cmd' : 'npm';

export const npmExec = async <T>(args: string[], options?: NpmExecContext): Promise<T> => {
    const context = options ?? {};
    return execInContext<T>(context, (env) => new Promise((resolve, reject) => {
        const npm = spawn(NPM_BIN, ['--json', ...args], {
            cwd: options?.pwd ?? cwd(),
            env: env,
            shell: IS_WINDOWS,
        });

        let stdout = '';
        let stderr = '';
        npm.stdout.on('data', (data: string) => (stdout += data));
        npm.stderr.on('data', (data: string) => (stderr += data));
        npm.on('close', (code) => {
            if (code !== 0) {
                const errorResp = JSON.parse(stdout) as { error: Error };
                reject(errorResp.error);
            }

            resolve(JSON.parse(stdout) as T);
        });
        npm.on('error', (err) => reject(err));
    }));
};



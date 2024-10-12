import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import { cwd } from 'node:process';
import { execInContext } from './context';
import { NpmExecError } from './error';
import { ErrorResponse, NpmExecContext } from './models';

export const npmExec = async <T>(args: string[], options?: NpmExecContext): Promise<T> => {
    const isWindows = platform() === 'win32';
    const npmBin = isWindows ? 'npm.cmd' : 'npm';
    const context = options ?? {};

    return execInContext<T>(context, (env) => new Promise((resolve, reject) => {
        const npmProcess = spawn(npmBin, ['--json', ...args], {
            cwd: options?.pwd ?? cwd(),
            env: env,
            shell: isWindows,
        });

        let stdout = '';
        let stderr = '';
        npmProcess.stdout.on('data', (data: string) => (stdout += data));
        npmProcess.stderr.on('data', (data: string) => (stderr += data));
        npmProcess.on('close', code => {
            if (code) {
                const errorResp = JSON.parse(stdout) as ErrorResponse;
                reject(new NpmExecError(errorResp.error));
            }

            resolve(JSON.parse(stdout) as T);
        });
        npmProcess.on('error', (err) => reject(err));
    }));
};



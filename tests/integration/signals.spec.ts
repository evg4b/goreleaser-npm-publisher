import { constants } from 'node:os';
import {
  createGoreleaserProject,
  createNpmProject,
  isWindows,
  type NpmProject,
  output,
  publishProject,
  type RunningProcess,
} from '@integration/support';

interface Delivery {
  signal: NodeJS.Signals;
  to: 'group' | 'process';
}

const signalApp = (app: RunningProcess, signal: NodeJS.Signals, to: Delivery['to']): void =>
  to === 'group' ? app.killGroup(signal) : app.kill(signal);

const itPosix = isWindows ? it.skip : it;

describe('signals sent to the installed command', () => {
  const packageName = 'test-app-signals';
  let consumer: NpmProject;

  // Windows cannot deliver a signal to another process: kill() is TerminateProcess there, so the
  // binary traps nothing and only the signals node can actually send are worth sending. Elsewhere
  // each signal is delivered the way it really arrives: a terminal signals the whole process group,
  // anything else names one process.
  const deliveries: Delivery[] = isWindows
    ? [
        { signal: 'SIGINT', to: 'process' },
        { signal: 'SIGTERM', to: 'process' },
      ]
    : [
        { signal: 'SIGINT', to: 'group' },
        { signal: 'SIGQUIT', to: 'group' },
        { signal: 'SIGTERM', to: 'process' },
        { signal: 'SIGHUP', to: 'process' },
        { signal: 'SIGUSR1', to: 'process' },
        { signal: 'SIGUSR2', to: 'process' },
      ];

  beforeAll(async () => {
    const project = await createGoreleaserProject(packageName);
    const publication = await publishProject(project);
    if (publication.code !== 0) {
      throw new Error(`Publishing the fixture failed:\n${publication.stdout}\n${publication.stderr}`);
    }

    consumer = await createNpmProject('signal-consumer');
    const installation = await consumer.install(`${packageName}@${project.version}`);
    if (installation.code !== 0) {
      throw new Error(`Installing the fixture failed:\n${installation.stdout}\n${installation.stderr}`);
    }
  });

  // Registering a signal libuv cannot handle throws, which would break the command on startup.
  it('runs the binary with the signal handlers installed', async () => {
    const execution = await consumer.run(packageName);

    expect({ code: execution.code, output: output(execution).trim() }).toEqual({ code: 0, output: 'Ba dum, tss!' });
  });

  it.each(deliveries)('stops the binary on $signal sent to the $to', async ({ signal, to }) => {
    const app = await consumer.start(packageName, ['wait'], { ownProcessGroup: to === 'group' });
    await app.waitForOutput('ready');

    signalApp(app, signal, to);
    const exit = await app.exited();

    if (isWindows) {
      // kill() is TerminateProcess: node records the signal it asked for, the binary never sees it.
      expect(exit).toEqual({ code: null, signal });
      expect(app.output()).not.toContain('received');
      return;
    }

    // The binary traps the signal, reports it by number and exits 7, which the wrapper passes on.
    expect(exit).toEqual({ code: 7, signal: null });
    expect(app.output()).toContain(`received ${constants.signals[signal]}`);
  });

  // A terminal signals the wrapper and the binary at once, so forwarding lands a second copy.
  itPosix.each<NodeJS.Signals>(['SIGINT', 'SIGQUIT'])('delivers %s to the binary exactly once', async signal => {
    const app = await consumer.start(packageName, ['wait'], { ownProcessGroup: true });
    await app.waitForOutput('ready');

    app.killGroup(signal);
    await app.exited();

    expect(app.output()).toContain('total 1');
  });

  itPosix('exits with 128 + the signal the binary was killed by', async () => {
    const app = await consumer.start(packageName, ['sleep']);
    await app.waitForOutput('ready');

    app.kill('SIGTERM');

    expect(await app.exited()).toEqual({ code: 128 + constants.signals.SIGTERM, signal: null });
  });
});

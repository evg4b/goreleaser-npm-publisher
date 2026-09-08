import { constants } from 'node:os';
import {
  createProject,
  createConsumer,
  isWindows,
  type NpmProject,
  output,
  type RunningProcess,
} from '@integration/support';

interface Delivery {
  signal: NodeJS.Signals;
  to: 'group' | 'process';
}

describe('signals sent to the installed command', () => {
  const packageName = 'test-app-signals';
  let consumer: NpmProject;

  const signalApp = (app: RunningProcess, signal: NodeJS.Signals, to: Delivery['to']): void =>
    to === 'group' ? app.killGroup(signal) : app.kill(signal);

  const itPosix = isWindows ? it.skip : it;

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
    const project = await createProject(packageName);
    const publication = await project.publish();
    if (publication.code !== 0) {
      throw new Error(`Publishing the fixture failed:\n${publication.stdout}\n${publication.stderr}`);
    }

    consumer = await createConsumer('signal-consumer');
    const installation = await consumer.install(`${packageName}@${project.version}`);
    if (installation.code !== 0) {
      throw new Error(`Installing the fixture failed:\n${installation.stdout}\n${installation.stderr}`);
    }
  });

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
      expect(exit).toEqual({ code: null, signal });
      expect(app.output()).not.toContain('received');
      return;
    }

    expect(exit).toEqual({ code: 7, signal: null });
    expect(app.output()).toContain(`received ${constants.signals[signal]}`);
  });

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

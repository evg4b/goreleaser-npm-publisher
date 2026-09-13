import { arch, platform } from 'node:process';

export interface FixtureTarget {
  target: string;
  os: OS;
  cpu: CPU;
  bin: string;
}

export const fixtureTargets: FixtureTarget[] = [
  { target: 'darwin_amd64', os: 'darwin', cpu: 'x64', bin: 'test-app' },
  { target: 'darwin_arm64', os: 'darwin', cpu: 'arm64', bin: 'test-app' },
  { target: 'linux_386', os: 'linux', cpu: 'ia32', bin: 'test-app' },
  { target: 'linux_amd64', os: 'linux', cpu: 'x64', bin: 'test-app' },
  { target: 'linux_arm64', os: 'linux', cpu: 'arm64', bin: 'test-app' },
  { target: 'windows_386', os: 'win32', cpu: 'ia32', bin: 'test-app.exe' },
  { target: 'windows_amd64', os: 'win32', cpu: 'x64', bin: 'test-app.exe' },
  { target: 'windows_arm64', os: 'win32', cpu: 'arm64', bin: 'test-app.exe' },
];

export const targetPackageName = (packageName: string, target: FixtureTarget): string =>
  `${packageName}_${target.target}`;

export const currentFixtureTarget = (): FixtureTarget => find(target => target.os === platform && target.cpu === arch);

export const foreignFixtureTarget = (): FixtureTarget => find(target => target.os !== platform);

const find = (predicate: (target: FixtureTarget) => boolean): FixtureTarget => {
  const target = fixtureTargets.find(predicate);
  if (!target) {
    throw new Error(`${platform}/${arch} is not covered by the test-app fixture`);
  }

  return target;
};

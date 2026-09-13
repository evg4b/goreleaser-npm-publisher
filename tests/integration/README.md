# Integration tests

End-to-end coverage of the published artefact: the built CLI publishes the goreleaser output of
[`tests/test-app`](../test-app) to a throwaway [Verdaccio](https://verdaccio.org) registry, an empty
npm project installs the result from that registry, and the installed command is executed.

```bash
yarn build && yarn test:integration
```

`yarn build` is required: the tests run `dist/bin.cjs`, not the TypeScript sources.

CI runs the suite on Linux, Windows and macOS, against the latest Node and against 22.14.0 - the
last release without `process.execve`, which Windows will never have either.

The registry runs as a plain Node process rather than a Docker service, which is what keeps that
matrix possible. It has no uplinks, so every run is offline and anything installed was published by
the test itself.

## Layout

| Path                     | Contents                                                       |
| ------------------------ | -------------------------------------------------------------- |
| `setup/`                 | Jest global setup and teardown: the registry every file shares |
| `support/environment.ts` | Paths, and the configuration the workers inherit               |
| `support/process.ts`     | Running commands: one-shot, long-lived, and npm                |
| `support/registry.ts`    | The private registry: starting it, and talking to it           |
| `support/project.ts`     | The sandboxes a test works in, and the CLI it runs on them     |
| `support/targets.ts`     | The goreleaser targets the fixture was built for               |
| `*.spec.ts`              | The flows under test                                           |

Each test publishes under its own package name into its own sandbox, so test files stay independent.

## Debugging

Set `INTEGRATION_KEEP_WORKSPACE=1` to keep the registry storage, the built `dist/npm` folders and the
consumer projects on disk; the path is printed when the suite starts.

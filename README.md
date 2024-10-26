<!--suppress HtmlDeprecatedAttribute -->
<p align="center">
  <a href="https://github.com/evg4b/goreleaser-npm-publisher" title="goreleaser-npm-publisher">
    <img alt="goreleaser-npm-publisher logo" width="30%" src="https://raw.githubusercontent.com/evg4b/goreleaser-npm-publisher/main/.github/logo.svg">
  </a>
</p>
<div align="center">
  <h1>goreleaser-npm-publisher</h1>
</div>
<p align="center">
  <a href="https://www.npmjs.com/package/goreleaser-npm-publisher" title="NPM Version">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/goreleaser-npm-publisher?logo=npm">  
  </a>
  <a href="https://www.npmjs.com/package/goreleaser-npm-publisher" title="NPM Version">
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dw/goreleaser-npm-publisher?logo=npm">
  </a>
  <a href="https://www.npmjs.com/package/goreleaser-npm-publisher" title="NPM Unpacked Size">
    <img alt="NPM Unpacked Size" src="https://img.shields.io/npm/unpacked-size/goreleaser-npm-publisher?logo=npm">
  </a>
  <br/>
  <a href="https://github.com/evg4b/goreleaser-npm-publisher/actions?query=branch%3Amain">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/evg4b/goreleaser-npm-publisher/node.js.yml?branch=main&logo=github">
  </a>
  <a href="https://github.com/evg4b/goreleaser-npm-publisher/actions?query=branch%3Amain">
    <img alt="Git Hub Release" src="https://img.shields.io/github/v/release/evg4b/goreleaser-npm-publisher?include_prereleases&logo=github">
  </a>
  <a href="https://github.com/evg4b/goreleaser-npm-publisher/?tab=MIT-1-ov-file">
    <img alt="License" src="https://img.shields.io/github/license/evg4b/goreleaser-npm-publisher?logo=github">
  </a>
  <br/>
  <a title="Quality Gate Status" href="https://sonarcloud.io/project/overview?id=evg4b_goreleaser-npm-publisher">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=evg4b_goreleaser-npm-publisher&metric=alert_status" alt="Quality Gate Status">
  </a>
  <a href="https://sonarcloud.io/project/activity?graph=coverage&id=evg4b_goreleaser-npm-publisher">
    <img alt="Coverage" src="https://sonarcloud.io/api/project_badges/measure?project=evg4b_goreleaser-npm-publisher&metric=coverage">
  </a>
  <a href="https://sonarcloud.io/project/activity?custom_metrics=ncloc&graph=custom&id=evg4b_goreleaser-npm-publisher">
    <img alt="Lines of code" src="https://sonarcloud.io/api/project_badges/measure?project=evg4b_goreleaser-npm-publisher&metric=ncloc">
  </a>

</p>
<p align="center">
  Automated tool for building and publishing NPM packages from Go binaries.
</p>`

# Quick start:

First, create a release of your package using [goreleaser](https://goreleaser.com/).

```shell
goreleaser build --clean
```

Then, run `goreleaser-npm-publisher` in the same directory. Make sure you're logged into the registry.

```shell
npx -y goreleaser-npm-publisher publish --clean
```

Alternatively, add the `--token` parameter to use your `NPM_AUTH_TOKEN`.

```shell
npx -y goreleaser-npm-publisher publish --clean --token npm_********
```

That’s it!

## Use as a library

You can use `goreleaser-npm-publisher` as a standard npm package.

```ts publish.ts
import { publish } from 'goreleaser-npm-publisher';

publish({ token: process.env.NPM_TOKEN })
  .then(console.log)
  .catch(console.error);
```

## Use as a GitHub Action

You can use `goreleaser-npm-publisher` as a GitHub Action.

```yaml
- name: Publish to npm
  uses: evg4b/goreleaser-npm-publisher-action@v1.0.0
  with:
    prefix: '@evg4b'
    token: ${{ secrets.NPM_AUTH_TOKEN }}
```

For more details, see [the GitHub Action documentation](https://github.com/evg4b/goreleaser-npm-publisher-action).

## CLI commands and options:

`goreleaser-npm-publisher` provides the following CLI commands:

### list

Displays a list of packages that can be built in the current project using the specified options.

#### Options

| Option          | type    | Description                                                                  |
|-----------------|---------|------------------------------------------------------------------------------|
| **project**     | string  | Specifies the path to the root of the Go package.                            |
| **builder**     | string  | The name of the builder whose output will be used for building the packages. |
| **prefix**      | string  | NPM package scope prefix.                                                    |
| **description** | string  | NPM package description.                                                     |
| **verbose**     | boolean | Print verbose output.                                                        |

### build

Builds all packages that can be built in the current project using the specified parameters.
The built packages can be found in the `dist/npm` folder.

| Option          | Type     | Description                                                                                 |
|-----------------|----------|---------------------------------------------------------------------------------------------|
| **project**     | string   | Specifies the path to the root of the Go package.                                           |
| **builder**     | string   | The name of the builder whose output will be used for building the packages.                |
| **clear**       | boolean  | Clean the `dist/npm` folder before the build.                                               |
| **prefix**      | string   | NPM package scope prefix.                                                                   |
| **description** | string   | NPM package description.                                                                    |
| **files**       | string[] | Files that should be included in the NPM package (e.g., `README.md`, `LICENSE` by default). |
| **verbose**     | boolean  | Print verbose output.                                                                       |

### publish

Builds and publishes to the `registry` all packages that can be built in the current project using the specified
parameters.

| Option          | Type     | Description                                                                                 |
|-----------------|----------|---------------------------------------------------------------------------------------------|
| **project**     | string   | Specifies the path to the root of the Go package.                                           |
| **builder**     | string   | The name of the builder whose output will be used for building the packages.                |
| **clear**       | boolean  | Clean the `dist/npm` folder before the build.                                               |
| **prefix**      | string   | NPM package scope prefix.                                                                   |
| **description** | string   | NPM package description.                                                                    |
| **files**       | string[] | Files that should be included in the NPM package (e.g., `README.md`, `LICENSE` by default). |
| **token**       | string   | The NPM authentication token.                                                               |
| **verbose**     | boolean  | Print verbose output.                                                                       |

## Structure of npm package:

The output will include a main package and platform packages.
The main package will contain the executable script that detects the platform and architecture, running the
corresponding platform package.
The platform packages will include the Go binary for the specific platform and architecture.

For example, for the package `go-package` with version `0.0.17`, and with Goreleaser building for `linux`, `windows`,
and `darwin` along with `ia32`, `x64`, and `arm64` architectures:

Main package:

```
go-package@0.0.17
  os: linux, win32, darwin
  cpu: ia32, x64, arm64
```

Platform packages:

```
go-package_linux_386@0.0.17
  os: linux
  cpu: ia32
  bin: /Users/<user>/go-package/dist/npm/dist-go-package-linux-386-go-package

go-package_windows_386@0.0.17
  os: win32
  cpu: ia32
  bin: /Users/<user>/go-package/dist/npm/dist-go-package-windows-386-go-package-exe

go-package_linux_amd64@0.0.17
  os: linux
  cpu: x64
  bin: /Users/<user>/go-package/dist/npm/dist-go-package-linux-amd-64-v-1-go-package

go-package_linux_arm64@0.0.17
  os: linux
  cpu: arm64
  bin: /Users/<user>/go-package/dist/npm/dist-go-package-linux-arm-64-go-package

go-package_windows_arm64@0.0.17
  os: win32
  cpu: arm64
  bin: /Users/<user>/go-package/dist/npm/dist-go-package-windows-arm-64-go-package-exe

go-package_windows_amd64@0.0.17
  os: win32
  cpu: x64
  bin: /Users/<user>/go-package/dist/npm/dist-go-package-windows-amd-64-v-1-go-package-exe

go-package_darwin_amd64@0.0.17
  os: darwin
  cpu: x64
  bin: /Users/<user>/go-package/dist/npm/dist-go-package-darwin-amd-64-v-1-go-package

go-package_darwin_arm64@0.0.17
  os: darwin
  cpu: arm64
  bin: /Users/<user>/go-package/dist/npm/dist-go-package-darwin-arm-64-go-package
```

## Supported platforms and architectures:

### Platforms:

| GOOS    | Node.js Platform |
|---------|------------------|
| darwin  | darwin           |
| linux   | linux            |
| windows | win32            |
| android | android          |
| aix     | aix              |
| freebsd | freebsd          |
| openbsd | openbsd          |
| solaris | sunos            |
| netbsd  | netbsd           |

### Architectures:

| GOARCH  | Node.js Platform |
|---------|------------------|
| amd64   | x64              |
| 386     | ia32             |
| arm     | arm              |
| arm64   | arm64            |
| s390x   | s390x            |
| s390    | s390             |
| riscv64 | riscv64          |
| ppc64   | ppc64            |
| ppc     | ppc              |
| mips    | mips             |


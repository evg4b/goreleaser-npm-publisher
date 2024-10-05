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
    <img alt="NPM License" src="https://img.shields.io/npm/l/goreleaser-npm-publisher?logo=npm">
  </a>
  <a href="https://www.npmjs.com/package/goreleaser-npm-publisher" title="NPM Version">
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dw/goreleaser-npm-publisher?logo=npm">
  </a>
  <a href="https://www.npmjs.com/package/goreleaser-npm-publisher" title="NPM Unpacked Size">
    <img alt="NPM Unpacked Size" src="https://img.shields.io/npm/unpacked-size/goreleaser-npm-publisher?logo=npm">
  </a>
  <br/>
  <a href="https://github.com/evg4b/goreleaser-npm-publisher/actions?query=branch%3Amain">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/evg4b/goreleaser-npm-publisher/node.js.yml?logo=github">
  </a>
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
  Publish Go binaries to npm registry, automated tool for build and publish Go binaries to npm registry.
</p>

# Overview

`goreleaser-npm-publisher` is a zero-configuration tool for build and publish Go binaries to npm registry.
Tool should be used after `goreleaser` build.

It will create npm package with Go binary and publish it to npm registry.

The main idea is to use npm as a distribution platform for Go binaries.
It allows using npm as a package manager for Go binaries.

## Structure of npm package:

The output will have a main package and platform packages.
The main package will contain the executable script
which will detect the platform and architecture and run the corresponding platform package.
Platform packages will contain the Go binary for the specific platform and architecture.

For example, for the package `go-package` with version `0.0.17`, and goreleaser build for `linux`, `windows`, `darwin`
and `ia32`, `x64`, `arm64` architectures:

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

## Use as a CLI tool

Goreleaser-npm-publisher can be used as general npm cli tool.

Via npx:

```bash
npx -y goreleaser-npm-publisher publish --clear --project <path-to-goreleaser-project>
```

or install globally:

```bash
npm install -g goreleaser-npm-publisher
goreleaser-npm-publisher publish --clear --project <path-to-goreleaser-project>
```

### Commands and options:

TBD

## Use as a GitHub Action

You can use `goreleaser-npm-publisher` as a GitHub Action.

```yaml
- name: Publish to npm
  uses: evg4b/goreleaser-npm-publisher@main
  with:
    project: .
    clear: true
    prefix: 'evg4b'
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

for more details see [GitHub Action documentation](https://github.com/evg4b/goreleaser-npm-publisher-action)

## Supported platforms and architectures:

### Platforms:

| GOOS    | Node.js Platform |
| ------- | ---------------- |
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
| ------- | ---------------- |
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

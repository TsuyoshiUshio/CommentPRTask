# Contribution

This article explains how to build an development environment.

This extension is developed on Windows 10.

## Prerequisite

- Node.js 14.0.x or later and NPM
- [TFS Cross Platform Command Line Interface(tfx-cli)](https://github.com/microsoft/tfs-cli)
- [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) compiler 4.4.4 or latter

## installation

Clone this repo. Then install the npm pacakges.

```shell
npm install
```

## npm commands

### Compile

Compile the TypeScript files to the js file.

```shell
npm run compile
```

### Deploy

Compile and Deploy the code to the Task directory

```shell
npm run deploy
```

### Build

Compile, Deploy and Build an extension `vsix` file.
If you want to release this task, do this and upload the vsix file to Market Place.

```shell
npm run build
```

### Test

Currently Not Supported, however, it is comming soon.

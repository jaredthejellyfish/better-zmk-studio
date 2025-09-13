Directory structure:
└── jaredthejellyfish-zmk-studio-ts-client/
├── README.md
├── CHANGELOG.md
├── jest.config.ts
├── LICENSE
├── package.json
├── release-please-config.json
├── tsconfig.build.json
├── tsconfig.json
├── .npmignore
├── .release-please-manifest.json
├── docs/
│ ├── README.md
│ ├── framing.md
│ ├── getting-started.md
│ ├── recipes.md
│ ├── studio.md
│ ├── transports.md
│ └── messages/
│ ├── behaviors.md
│ ├── core.md
│ ├── keymap.md
│ └── meta.md
├── src/
│ ├── framing.ts
│ ├── index.ts
│ └── transport/
│ ├── errors.ts
│ ├── gatt.ts
│ ├── index.ts
│ └── serial.ts
├── test/
│ ├── framing.spec.ts
│ ├── index.spec.ts
│ ├── messages.roundtrip.spec.ts
│ ├── setupStreams.ts
│ ├── transport.gatt.spec.ts
│ └── transport.serial.spec.ts
└── .github/
└── workflows/
├── checks.yml
└── release.yml

Files Content:

================================================
FILE: README.md
================================================

# zmk-studio-ts-client

TypeScript client library for the ZMK Studio RPC protocol. Runs in the browser and communicates with ZMK‑enabled keyboards over Web Serial or Web Bluetooth GATT.

- Works in modern Chromium-based browsers
- Uses protobuf message types generated directly from ZMK Studio `.proto` files

## Installation

Use your package manager to add the library. Examples with Bun and npm:

```bash
bun add @zmkfirmware/zmk-studio-ts-client
# or
npm install @zmkfirmware/zmk-studio-ts-client
```

## Requirements

- Browser environment with Web Serial and/or Web Bluetooth support
  - Web Serial: Chromium-based desktop browsers (HTTPS origin or `http://localhost`)
  - Web Bluetooth: Chromium-based browsers; requires a secure context (HTTPS)
- User gesture is required by the browser to open ports/devices

## Quick start

### Connect via Web Serial

```ts
import {
  create_rpc_connection,
  call_rpc,
} from "@zmkfirmware/zmk-studio-ts-client";
import * as Serial from "@zmkfirmware/zmk-studio-ts-client/transport/serial";
import { Request } from "@zmkfirmware/zmk-studio-ts-client/studio";

// Must be triggered from a user gesture (e.g., button click)
const transport = await Serial.connect();
const conn = create_rpc_connection(transport);

// Example: fetch basic device info
const rr = await call_rpc(conn, { core: { getDeviceInfo: true } } as Omit<
  Request,
  "requestId"
>);
console.log(rr.core?.getDeviceInfo);
```

### Connect via Web Bluetooth GATT

```ts
import {
  create_rpc_connection,
  call_rpc,
} from "@zmkfirmware/zmk-studio-ts-client";
import * as Gatt from "@zmkfirmware/zmk-studio-ts-client/transport/gatt";
import { Request } from "@zmkfirmware/zmk-studio-ts-client/studio";

// Must be triggered from a user gesture (e.g., button click)
const transport = await Gatt.connect();
const conn = create_rpc_connection(transport);

const rr = await call_rpc(conn, { core: { getDeviceInfo: true } } as Omit<
  Request,
  "requestId"
>);
console.log(rr.core?.getDeviceInfo);
```

### Receiving notifications

```ts
// Read notifications emitted by the device
const reader = conn.notification_readable.getReader();
const { done, value } = await reader.read();
reader.releaseLock();
if (!done && value?.core) {
  // handle core notifications, e.g. lockStateChanged
}
```

## API Surface

### Main module `@zmkfirmware/zmk-studio-ts-client`

- `create_rpc_connection(transport: RpcTransport, opts?: { signal?: AbortSignal }): RpcConnection`
- `call_rpc(conn: RpcConnection, req: Omit<Request, "requestId">): Promise<RequestResponse>`
- Types: `RpcConnection`, `Request`, `Response`, `RequestResponse`, `Notification`
- Errors: `NoResponseError` (no response expected), `MetaError` (contains `condition` of type `ErrorConditions`)

### Transports

- `@zmkfirmware/zmk-studio-ts-client/transport/serial`
  - `connect(): Promise<RpcTransport>` — prompts user to pick a serial device
- `@zmkfirmware/zmk-studio-ts-client/transport/gatt`
  - `connect(): Promise<RpcTransport>` — prompts user to pick a Bluetooth device
- `@zmkfirmware/zmk-studio-ts-client/transport/errors`
  - `UserCancelledError` — thrown when the user cancels a Bluetooth selection prompt

### Messages

Generated protobuf models are available from `@zmkfirmware/zmk-studio-ts-client/studio` and nested packages referenced inside. See the docs listed below for request/response specifics.

## Documentation

This repository includes additional docs:

- `docs/README.md`
- `docs/getting-started.md`
- `docs/studio.md`
- `docs/transports.md`
- `docs/framing.md`
- `docs/messages/core.md`, `docs/messages/keymap.md`, `docs/messages/behaviors.md`, `docs/messages/meta.md`
- `docs/recipes.md`

## Development

```bash
bun install
# If you are regenerating protobuf bindings (requires protoc):
bun run generate

# Build and test
bun run build
bun run test
```

## License

MIT

================================================
FILE: CHANGELOG.md
================================================

# Changelog

## [0.0.18](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.17...v0.0.18) (2024-10-03)

### Features

- Pull in updated studio messages ([#24](https://github.com/zmkfirmware/zmk-studio-ts-client/issues/24)) ([67856ff](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/67856ff93845f08cfedadc804a230cc21f8fd2d0))

## [0.0.17](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.16...v0.0.17) (2024-10-02)

### Features

- Add CI typecheck/test runs. ([217536a](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/217536ac25c727a7a057afe53484c069da92628b))
- Improved error handling. ([66f5abc](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/66f5abc033d9421852fb178534d294e8449563a8))

## [0.0.16](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.15...v0.0.16) (2024-08-27)

### Features

- Add support for closing/aborting transports ([61a4874](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/61a4874a3b939e8cff7ed026b957fb00f76fdc8a))

## [0.0.15](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.14...v0.0.15) (2024-08-17)

### Features

- Pull in core reset_settings request/response. ([4f47937](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/4f479376576364d8c0cd5847d5e090acd054f4a4))

## [0.0.14](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.13...v0.0.14) (2024-08-05)

### Code Refactoring

- Pull in core locking msg updates. ([94df97e](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/94df97e238b6c3618ad143369b292bcc0bd45632))

## [0.0.13](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.12...v0.0.13) (2024-07-29)

### Code Refactoring

- Pull in msg updates with zmk.studio pkg. ([7854d26](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/7854d263b48e8b2ac6f1ee914478bc86417e6a77))

## [0.0.12](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.11...v0.0.12) (2024-07-13)

### Bug Fixes

- Improved windows support. ([016e913](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/016e91354fc07b1a846118534d4f024092d4e62a))

### Miscellaneous Chores

- Preper 0.0.12 release ([259bc56](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/259bc56885ed0db622f5dfcb60d74ba51b977b16))

## [0.0.11](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.10...v0.0.11) (2024-07-12)

### Miscellaneous Chores

- Prepare 0.0.11 release ([46cc9ad](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/46cc9ad89bc28842b6eb198b40ed368d8f5b8c3c))

## [0.0.10](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.9...v0.0.10) (2024-07-12)

### Features

- Pull in layer related messages. ([ac886e9](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/ac886e9beaf37a80512ad96850c1a05648b54635))

### Miscellaneous Chores

- Prep 0.0.10 release ([113e0ef](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/113e0efcdad386786e30494b8a2ebdd5c72395d2))

## [0.0.9](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.8...v0.0.9) (2024-07-10)

### Features

- Raise errors for generic RPC error responses. ([524b305](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/524b305cf82b4dba720f11b3d58af7f03b913051))

### Miscellaneous Chores

- Prep 0.0.9 release ([c4e0f7d](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/c4e0f7d1e9daf4e82805c3df0c3ad41a932f3341))

## [0.0.8](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.7...v0.0.8) (2024-07-05)

### Miscellaneous Chores

- Prepare 0.0.8 release ([3a4f8f7](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/3a4f8f70c0c25af3133f25e592fc50b9960ffe60))

## [0.0.7](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.6...v0.0.7) (2024-06-29)

### Bug Fixes

- Add protobufjs dependency. ([c609191](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/c6091919ce5ae74372d55872b6ae8bd364a10592))

## [0.0.6](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.5...v0.0.6) (2024-06-29)

### Miscellaneous Chores

- Prepare 0.0.6 release. ([abe83f8](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/abe83f8b3e6a4476688223874c31dbf89a505f03))

## [0.0.5](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.4...v0.0.5) (2024-06-29)

### Miscellaneous Chores

- Prepare 0.0.5 release ([760161e](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/760161ef716001aa0a2a53ecf10e08e319cd45c0))

## [0.0.4](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.3...v0.0.4) (2024-06-29)

### Bug Fixes

- Add package-lock.json for release automation. ([0e76aad](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/0e76aad525f20afe0e291e3746baf86e2561aa97))

## [0.0.3](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.2...v0.0.3) (2024-06-29)

### Miscellaneous Chores

- Prepare 0.0.3 release ([91a026f](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/91a026fa4544a56f79f96c7c1b10762f04cdf001))

## [0.0.2](https://github.com/zmkfirmware/zmk-studio-ts-client/compare/v0.0.1...v0.0.2) (2024-06-29)

### Miscellaneous Chores

- Try to release 0.0.2 ([ce7403f](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/ce7403fb71bb67d7c854b45a3805abe4f10350bf))

## 0.0.1 (2024-06-29)

### Features

- Initial work on the standalone TS client. ([e48682d](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/e48682d79f92e2f8f34d29124f9f8f932849ab33))
- Updated messages and bytes support. ([9ce6a71](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/9ce6a712310d6b225e54ea9db4d732ede972e556))

### Bug Fixes

- Add .npmignore. ([4a0906f](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/4a0906f4783ceeea4e6359be7a366a1053c76e43))
- Do git submodule bits in postinstall as well. ([72b064d](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/72b064dba1c3d13f46ff9441c4ac4502ee660cee))
- preinstall script git typo fix. ([c27fa6f](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/c27fa6f5033c9b87ceaf136c4707cde27e7c94cd))
- Try more postinstall fixes. ([c67ac72](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/c67ac722b14ca7e9a6bf7bb7e5c2fbb56f902faa))
- Updated messages. ([f5ab165](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/f5ab165bf838c23ac577b0e4d1d1da7630ef73ae))

### Miscellaneous Chores

- Prepare 0.0.1 release. ([8076e86](https://github.com/zmkfirmware/zmk-studio-ts-client/commit/8076e86411818325efa133291e71e8e322505601))

================================================
FILE: jest.config.ts
================================================
import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
preset: "ts-jest",
testEnvironment: "node",
testMatch: ["**/test/**/*.spec.ts"],
collectCoverageFrom: [
"<rootDir>/src/**/*.ts",
"!<rootDir>/src/behaviors.ts",
"!<rootDir>/src/core.ts",
"!<rootDir>/src/keymap.ts",
"!<rootDir>/src/meta.ts",
"!<rootDir>/src/studio.ts",
"!<rootDir>/src/types/**/*.ts",
],
extensionsToTreatAsEsm: [".ts"],
setupFilesAfterEnv: ["<rootDir>/test/setupStreams.ts"],
moduleNameMapper: {
"^(\\.{1,2}/.\*)\\.js$": "$1",
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
// '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
    "^.+\\.tsx?$": [
"ts-jest",
{
useESM: true,
diagnostics: false,
},
],
},
};

export default config;

================================================
FILE: LICENSE
================================================
MIT License

Copyright (c) 2020 The ZMK Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

================================================
FILE: package.json
================================================
{
"name": "@zmkfirmware/zmk-studio-ts-client",
"version": "0.0.18",
"description": "RPC client library for interacting with ZMK Studio enabled keyboards",
"keywords": [
"typescript",
"rpc",
"protobuf",
"mechanical-keyboards"
],
"homepage": "https://github.com/zmkfirmware/zmk#readme",
"bugs": {
"url": "https://github.com/zmkfirmware/zmk-studio-ts-client/issues"
},
"repository": {
"type": "git",
"url": "git+https://github.com/zmkfirmware/zmk-studio-ts-client.git"
},
"license": "MIT",
"author": {
"name": "ZMK Project",
"email": "petejohason@users.noreply.github.com",
"url": "https://github.com/zmkfirmware"
},
"type": "module",
"exports": {
".": {
"types": "./lib/index.d.ts",
"import": "./lib/index.js"
},
"./_": {
"types": "./lib/_.d.ts",
"import": "./lib/_.js"
}
},
"files": [
"lib/\*\*/_"
],
"scripts": {
"build": "tsc --project tsconfig.build.json",
"clean": "rm -rf ./lib/",
"cli": "node --no-warnings --loader ts-node/esm example/cli.ts",
"cm": "cz",
"generate": "run-script-os",
"generate:default": "protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./src/ --ts_proto_opt=env=browser --proto_path=./zmk-studio-messages/proto/zmk/ ./zmk-studio-messages/proto/zmk/_.proto",
"generate:windows": "protoc --plugin=protoc-gen-ts_proto=.\\node_modules\\.bin\\protoc-gen-ts_proto.cmd --ts_proto_out=./src/ --ts_proto_opt=env=browser --proto_path=./zmk-studio-messages/proto/zmk/ ./zmk-studio-messages/proto/zmk/_.proto",
"postinstall": "run-script-os",
"lint": "eslint ./src/ --fix",
"postinstall:default": "if [ -e src/ ]; then git submodule update --init && npm run generate && npm run build; fi",
"postinstall:windows": "IF exist src/ ( git submodule update --init && npm run generate && npm run build )",
"test": "jest --coverage",
"test:watch": "jest --watch",
"typecheck": "tsc --noEmit"
},
"lint-staged": {
"\*.ts": "eslint --cache --cache-location .eslintcache --fix"
},
"config": {
"commitizen": {
"path": "./node_modules/@ryansonshine/cz-conventional-changelog"
}
},
"dependencies": {
"async-mutex": "^0.5.0",
"protobufjs": "^7.3.2"
},
"devDependencies": {
"@ryansonshine/commitizen": "^4.2.8",
"@ryansonshine/cz-conventional-changelog": "^3.3.4",
"@types/jest": "^29.0.0",
"@types/node": "^12.20.11",
"@types/w3c-web-serial": "^1.0.6",
"@types/web-bluetooth": "^0.0.20",
"@typescript-eslint/eslint-plugin": "^4.22.0",
"@typescript-eslint/parser": "^4.22.0",
"conventional-changelog-conventionalcommits": "^5.0.0",
"eslint": "^7.25.0",
"eslint-config-prettier": "^8.3.0",
"eslint-plugin-node": "^11.1.0",
"eslint-plugin-prettier": "^3.4.0",
"husky": "^6.0.0",
"jest": "^29.0.0",
"lint-staged": "^13.2.1",
"prettier": "^2.2.1",
"run-script-os": "^1.1.6",
"ts-jest": "^29.0.0",
"ts-node": "^10.2.1",
"ts-proto": "^1.180.0",
"typescript": "^4.2.4",
"web-streams-polyfill": "4.0.0"
},
"engines": {
"node": ">=12.0"
}
}

================================================
FILE: release-please-config.json
================================================
{
"packages": {
".": {
"changelog-path": "CHANGELOG.md",
"release-type": "node",
"bump-minor-pre-major": false,
"bump-patch-for-minor-pre-major": false,
"draft": false,
"prerelease": false
}
},
"$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json"
}

================================================
FILE: tsconfig.build.json
================================================
{
"extends": "./tsconfig.json",
"exclude": ["test/**/*.spec.ts"]
}

================================================
FILE: tsconfig.json
================================================
{
"compilerOptions": {
"moduleResolution": "node",
/_ Visit https://aka.ms/tsconfig.json to read more about this file _/

    /* Basic Options */
    // "incremental": true,                         /* Enable incremental compilation */
    "target": "ES2022" /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', or 'ESNEXT'. */,
    "module": "es2020" /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', 'es2020', or 'ESNext'. */,
    "lib": [
      "es2022",
      "dom"
    ] /* Specify library files to be included in the compilation. */,
    // "allowJs": true,                             /* Allow javascript files to be compiled. */
    // "checkJs": true,                             /* Report errors in .js files. */
    // "jsx": "preserve",                           /* Specify JSX code generation: 'preserve', 'react-native', 'react', 'react-jsx' or 'react-jsxdev'. */
    "declaration": true /* Generates corresponding '.d.ts' file. */,
    // "declarationMap": true,                      /* Generates a sourcemap for each corresponding '.d.ts' file. */
    // "sourceMap": true,                           /* Generates corresponding '.map' file. */
    // "outFile": "./",                             /* Concatenate and emit output to single file. */
    "outDir": "./lib/" /* Redirect output structure to the directory. */,
    // "rootDir": "./",                             /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    // "composite": true,                           /* Enable project compilation */
    // "tsBuildInfoFile": "./",                     /* Specify file to store incremental compilation information */
    // "removeComments": true,                      /* Do not emit comments to output. */
    // "noEmit": true,                              /* Do not emit outputs. */
    // "importHelpers": true,                       /* Import emit helpers from 'tslib'. */
    // "downlevelIteration": true,                  /* Provide full support for iterables in 'for-of', spread, and destructuring when targeting 'ES5' or 'ES3'. */
    // "isolatedModules": true,                     /* Transpile each file as a separate module (similar to 'ts.transpileModule'). */

    /* Strict Type-Checking Options */
    "strict": true /* Enable all strict type-checking options. */,
    // "noImplicitAny": true,                       /* Raise error on expressions and declarations with an implied 'any' type. */
    // "strictNullChecks": true,                    /* Enable strict null checks. */
    // "strictFunctionTypes": true,                 /* Enable strict checking of function types. */
    // "strictBindCallApply": true,                 /* Enable strict 'bind', 'call', and 'apply' methods on functions. */
    // "strictPropertyInitialization": true,        /* Enable strict checking of property initialization in classes. */
    // "noImplicitThis": true,                      /* Raise error on 'this' expressions with an implied 'any' type. */
    // "alwaysStrict": true,                        /* Parse in strict mode and emit "use strict" for each source file. */

    /* Additional Checks */
    // "noUnusedLocals": true,                      /* Report errors on unused locals. */
    // "noUnusedParameters": true,                  /* Report errors on unused parameters. */
    // "noImplicitReturns": true,                   /* Report error when not all code paths in function return a value. */
    // "noFallthroughCasesInSwitch": true,          /* Report errors for fallthrough cases in switch statement. */
    // "noUncheckedIndexedAccess": true,            /* Include 'undefined' in index signature results */
    // "noPropertyAccessFromIndexSignature": true,  /* Require undeclared properties from index signatures to use element accesses. */

    /* Module Resolution Options */
    // "moduleResolution": "node",                  /* Specify module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */
    // "baseUrl": "./",                             /* Base directory to resolve non-absolute module names. */
    // "paths": {},                                 /* A series of entries which re-map imports to lookup locations relative to the 'baseUrl'. */
    // "rootDirs": [],                              /* List of root folders whose combined content represents the structure of the project at runtime. */
    // "typeRoots": [],                             /* List of folders to include type definitions from. */
    // "types": [],                                 /* Type declaration files to be included in compilation. */
    // "allowSyntheticDefaultImports": true,        /* Allow default imports from modules with no default export. This does not affect code emit, just typechecking. */
    "esModuleInterop": true /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */,
    // "preserveSymlinks": true,                    /* Do not resolve the real path of symlinks. */
    // "allowUmdGlobalAccess": true,                /* Allow accessing UMD globals from modules. */

    /* Source Map Options */
    // "sourceRoot": "",                            /* Specify the location where debugger should locate TypeScript files instead of source locations. */
    // "mapRoot": "",                               /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSourceMap": true,                     /* Emit a single file with source maps instead of having a separate file. */
    // "inlineSources": true,                       /* Emit the source alongside the sourcemaps within a single file; requires '--inlineSourceMap' or '--sourceMap' to be set. */

    /* Experimental Options */
    // "experimentalDecorators": true,              /* Enables experimental support for ES7 decorators. */
    // "emitDecoratorMetadata": true,               /* Enables experimental support for emitting type metadata for decorators. */

    /* Advanced Options */
    "skipLibCheck": true /* Skip type checking of declaration files. */,
    "forceConsistentCasingInFileNames": true /* Disallow inconsistently-cased references to the same file. */,
    "isolatedModules": true /* Transpile each file as a separate module (similar to 'ts.transpileModule'). */

},
"include": ["src/**/*.ts", "test/**/*.ts"]
}

================================================
FILE: .npmignore
================================================
[Empty file]

================================================
FILE: .release-please-manifest.json
================================================
{
".": "0.0.18"
}

================================================
FILE: docs/README.md
================================================
zmk-studio-ts-client Docs

A TypeScript client for the ZMK Studio RPC protocol. It runs in the browser and communicates with ZMK-enabled keyboards via Web Serial or Web Bluetooth GATT.

- Getting Started: getting-started.md
- Studio RPC Client: studio.md
- Transports: transports.md
- Framing: framing.md
- Message Reference:
  - messages/core.md
  - messages/keymap.md
  - messages/behaviors.md
  - messages/meta.md
- Recipes: recipes.md

================================================
FILE: docs/framing.md
================================================
Framing

The stream protocol wraps protobuf-encoded messages with byte framing:

- SOF: 0xAB
- ESC: 0xAC
- EOF: 0xAD

Encoder

`get_encoder()` yields a `Transformer<Uint8Array, Uint8Array>` that:

- Emits SOF, the payload with any SOF/ESC/EOF bytes escaped by prefixing ESC, then EOF.

Decoder

`get_decoder()` yields a `Transformer<Uint8Array, Uint8Array>` that:

- Validates SOF, collects bytes (handling ESC), and emits payload at EOF.

Example

```ts
import { TransformStream } from "web-streams-polyfill";
import {
  get_encoder,
  get_decoder,
} from "@zmkfirmware/zmk-studio-ts-client/framing";

const encoded = new TransformStream(get_encoder());
const decoded = encoded.readable.pipeThrough(
  new TransformStream(get_decoder())
);
```

================================================
FILE: docs/getting-started.md
================================================
Getting Started

Install

```bash
bun add @zmkfirmware/zmk-studio-ts-client
```

Quick start (Serial)

```ts
import {
  create_rpc_connection,
  call_rpc,
} from "@zmkfirmware/zmk-studio-ts-client";
import { connect as connectSerial } from "@zmkfirmware/zmk-studio-ts-client/transport/serial";
import { Request } from "@zmkfirmware/zmk-studio-ts-client/studio";

const transport = await connectSerial(); // prompts user to select a serial device
const conn = create_rpc_connection(transport);

// Example: fetch device info via Core request
const resp = await call_rpc(conn, { core: { getDeviceInfo: true } } as Omit<
  Request,
  "requestId"
>);
console.log(resp.core?.getDeviceInfo);
```

Quick start (Bluetooth GATT)

```ts
import {
  create_rpc_connection,
  call_rpc,
} from "@zmkfirmware/zmk-studio-ts-client";
import { connect as connectGatt } from "@zmkfirmware/zmk-studio-ts-client/transport/gatt";

const transport = await connectGatt(); // prompts user to select a BLE device
const conn = create_rpc_connection(transport);
```

Permissions

- Serial: requires a Secure Context and user gesture to invoke `navigator.serial.requestPort`.
- Bluetooth: requires a Secure Context and user gesture to invoke `navigator.bluetooth.requestDevice`.

Build targets

- Designed for modern browsers. Use bundlers that preserve ESM.

================================================
FILE: docs/recipes.md
================================================
Recipes

List behaviors and get details

```ts
import { call_rpc } from "@zmkfirmware/zmk-studio-ts-client";
import { Request } from "@zmkfirmware/zmk-studio-ts-client/studio";

const list = await call_rpc(conn, {
  behaviors: { listAllBehaviors: true },
} as Omit<Request, "requestId">);
const ids = list.behaviors?.listAllBehaviors?.behaviors ?? [];

if (ids.length) {
  const details = await call_rpc(conn, {
    behaviors: { getBehaviorDetails: { behaviorId: ids[0] } },
  } as Omit<Request, "requestId">);
  console.log(details.behaviors?.getBehaviorDetails);
}
```

Fetch and update keymap

```ts
const rr = await call_rpc(conn, { keymap: { getKeymap: true } } as Omit<
  Request,
  "requestId"
>);
const km = rr.keymap?.getKeymap;

// set a binding
await call_rpc(conn, {
  keymap: {
    setLayerBinding: {
      layerId: km!.layers[0].id,
      keyPosition: 0,
      binding: { behaviorId: 4, param1: 0, param2: 0 },
    },
  },
} as Omit<Request, "requestId">);
```

Handle notifications

```ts
const reader = conn.notification_readable.getReader();
const { value } = await reader.read();
if (value?.keymap?.unsavedChangesStatusChanged) {
  // update UI
}
reader.releaseLock();
```

================================================
FILE: docs/studio.md
================================================
Studio RPC Client

Exports

- `create_rpc_connection(transport, opts?)` → `RpcConnection`
- `call_rpc(conn, request)` → `Promise<RequestResponse>`
- Errors: `NoResponseError`, `MetaError`
- Types: `RpcConnection`, `CreateRpcConnectionOpts`

Usage

```ts
import {
  create_rpc_connection,
  call_rpc,
  NoResponseError,
  MetaError,
} from "@zmkfirmware/zmk-studio-ts-client";
import { connect as connectSerial } from "@zmkfirmware/zmk-studio-ts-client/transport/serial";
import { Request } from "@zmkfirmware/zmk-studio-ts-client/studio";

const transport = await connectSerial();
const conn = create_rpc_connection(transport);

try {
  const rr = await call_rpc(conn, { core: { getLockState: true } } as Omit<
    Request,
    "requestId"
  >);
  console.log(rr.core?.getLockState);
} catch (e) {
  if (e instanceof NoResponseError) {
    // device intentionally responded with noResponse
  } else if (e instanceof MetaError) {
    console.error("Meta error condition", e.condition);
  } else {
    throw e;
  }
}
```

Notifications

`RpcConnection.notification_readable` is a `ReadableStream<Notification>` containing push updates.

```ts
const reader = conn.notification_readable.getReader();
const { value } = await reader.read();
if (value?.core?.lockStateChanged != null) {
  // handle lock state change
}
reader.releaseLock();
```

Concurrency

`call_rpc` is serialized by an internal mutex to keep request/response pairing ordered.

================================================
FILE: docs/transports.md
================================================
Transports

Interface

```ts
export interface RpcTransport {
  label: string;
  abortController: AbortController;
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
}
```

Serial transport

```ts
import { connect as connectSerial } from "@zmkfirmware/zmk-studio-ts-client/transport/serial";
const transport = await connectSerial();
```

- Uses `navigator.serial.requestPort()` and opens at baud `12500`.
- On abort, the port streams are closed and `port.close()` is called.

Bluetooth GATT transport

```ts
import { connect as connectGatt } from "@zmkfirmware/zmk-studio-ts-client/transport/gatt";
const transport = await connectGatt();
```

- Requests a device exposing the ZMK Studio primary service `00000000-0196-6107-c967-c5cfb1c2482a`.
- Writes via a characteristic and reads notifications for incoming bytes.
- Throws `UserCancelledError` when the chooser is dismissed.

Aborting

Call `transport.abortController.abort(reason)` to tear down the stream pipelines and underlying device connections.

================================================
FILE: docs/messages/behaviors.md
================================================
Behaviors Messages

Package: `zmk.behaviors`

Requests

- `listAllBehaviors: true`
- `getBehaviorDetails: { behaviorId }`

Responses

- `listAllBehaviors: { behaviors: number[] }`
- `getBehaviorDetails: { id, displayName, metadata: BehaviorBindingParametersSet[] }`

Parameter metadata

- `BehaviorBindingParametersSet { param1: BehaviorParameterValueDescription[], param2: BehaviorParameterValueDescription[] }`
- Value description can be: `nil`, `constant`, `range { min,max }`, `hidUsage { keyboardMax, consumerMax }`, or `layerId`.

================================================
FILE: docs/messages/core.md
================================================
Core Messages

Package: `zmk.core`

Requests

- `getDeviceInfo: true`
- `getLockState: true`
- `lock: true | false`
- `resetSettings: true`

Responses

- `getDeviceInfo: { name: string, serialNumber: Uint8Array }`
- `getLockState: LockState`
- `resetSettings: boolean`

Notifications

- `lockStateChanged: LockState`

Enums

- `LockState`: `ZMK_STUDIO_CORE_LOCK_STATE_LOCKED` | `ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED`

Example

```ts
import { call_rpc } from "@zmkfirmware/zmk-studio-ts-client";
import { Request } from "@zmkfirmware/zmk-studio-ts-client/studio";

const rr = await call_rpc(conn, { core: { getDeviceInfo: true } } as Omit<
  Request,
  "requestId"
>);
console.log(rr.core?.getDeviceInfo);
```

================================================
FILE: docs/messages/keymap.md
================================================
Keymap Messages

Package: `zmk.keymap`

Requests

- `getKeymap: true`
- `setLayerBinding: { layerId, keyPosition, binding }`
- `checkUnsavedChanges: true`
- `saveChanges: true`
- `discardChanges: true`
- `getPhysicalLayouts: true`
- `setActivePhysicalLayout: number`
- `moveLayer: { startIndex, destIndex }`
- `addLayer: {}`
- `removeLayer: { layerIndex }`
- `restoreLayer: { layerId, atIndex }`
- `setLayerProps: { layerId, name }`

Responses

- `getKeymap: Keymap`
- `setLayerBinding: SetLayerBindingResponse`
- `checkUnsavedChanges: boolean`
- `saveChanges: { ok?: boolean, err?: SaveChangesErrorCode }`
- `discardChanges: boolean`
- `getPhysicalLayouts: PhysicalLayouts`
- `setActivePhysicalLayout: { ok?: Keymap, err?: SetActivePhysicalLayoutErrorCode }`
- `moveLayer: { ok?: Keymap, err?: MoveLayerErrorCode }`
- `addLayer: { ok?: { index: number, layer: Layer }, err?: AddLayerErrorCode }`
- `removeLayer: { ok?: {}, err?: RemoveLayerErrorCode }`
- `restoreLayer: { ok?: Layer, err?: RestoreLayerErrorCode }`
- `setLayerProps: SetLayerPropsResponse`

Notifications

- `unsavedChangesStatusChanged: boolean`

Models

- `Keymap { layers: Layer[], availableLayers, maxLayerNameLength }`
- `Layer { id, name, bindings: BehaviorBinding[] }`
- `BehaviorBinding { behaviorId, param1, param2 }`
- Physical layout types for rendering/editor UIs

Enums (selected)

- `SaveChangesErrorCode`, `SetLayerBindingResponse`, `MoveLayerErrorCode`, `AddLayerErrorCode`, `RemoveLayerErrorCode`, `RestoreLayerErrorCode`, `SetLayerPropsResponse`, `SetActivePhysicalLayoutErrorCode`

================================================
FILE: docs/messages/meta.md
================================================
Meta Messages

Package: `zmk.meta`

Purpose: communicate out-of-band RPC semantics and simple errors.

Response fields

- `noResponse?: boolean` → indicates the RPC intentionally returns no payload
- `simpleError?: ErrorConditions` → a simple error code

ErrorConditions

- `GENERIC`, `UNLOCK_REQUIRED`, `RPC_NOT_FOUND`, `MSG_DECODE_FAILED`, `MSG_ENCODE_FAILED`

Client-side errors

- `NoResponseError` is thrown by `call_rpc` when `noResponse` is present
- `MetaError` is thrown when `simpleError` is present

================================================
FILE: src/framing.ts
================================================
const FRAMING_SOF = 0xab;
const FRAMING_ESC = 0xac;
const FRAMING_EOF = 0xad;

export function get_encoder(): Transformer<Uint8Array, Uint8Array> {
return {
transform: (chunk, controller) => {
if (chunk instanceof Uint8Array) {
controller.enqueue(new Uint8Array([FRAMING_SOF]));
let next_start_index = 0;
for (let i = 0; i < chunk.length; i++) {
switch (chunk[i]) {
case FRAMING_SOF:
case FRAMING_ESC:
case FRAMING_EOF:
controller.enqueue(chunk.subarray(next_start_index, i));
controller.enqueue(new Uint8Array([FRAMING_ESC]));
next_start_index = i;
}
}

        if (next_start_index < chunk.length) {
          controller.enqueue(chunk.subarray(next_start_index, chunk.length));
        }
        controller.enqueue(new Uint8Array([FRAMING_EOF]));
      } else {
        return controller.error(
          'Only Uint8Array chunks are able to be handled'
        );
      }
    },

};
}

enum DecodeState {
IDLE = 0,
AWAITING_DATA = 1,
ESCAPED = 2,
}

export function get_decoder(): Transformer<Uint8Array, Uint8Array> {
let state = DecodeState.IDLE;
let data: Array<number> = [];

let process = (
b: number,
controller: TransformStreamDefaultController<Uint8Array>
) => {
switch (state) {
case DecodeState.IDLE:
switch (b) {
case FRAMING_SOF:
state = DecodeState.AWAITING_DATA;
break;
default:
return controller.error('Expected SoF to start decoding');
}
break;
case DecodeState.AWAITING_DATA:
switch (b) {
case FRAMING_SOF:
return controller.error('Unexpected SoF mid-frame');
case FRAMING_ESC:
state = DecodeState.ESCAPED;
break;
case FRAMING_EOF:
controller.enqueue(new Uint8Array(data));
data = [];
state = DecodeState.IDLE;
break;
default:
data.push(b);
break;
}
break;
case DecodeState.ESCAPED:
data.push(b);
state = DecodeState.AWAITING_DATA;
break;
}

    return true;

};

return {
transform(chunk, controller) {
if (chunk instanceof Uint8Array) {
for (let i = 0; i < chunk.length; i++) {
let b = chunk[i];
if (!process(b, controller)) {
throw 'Failed to process the byte';
}
}
} else if (typeof chunk == 'number') {
process(chunk, controller);
} else {
return controller.error(
'Only Uint8Array chunks are able to be handled'
);
}
},
};
}

================================================
FILE: src/index.ts
================================================
import { Request, Response, RequestResponse, Notification } from './studio';

import { get_encoder, get_decoder } from './framing';
import { RpcTransport } from './transport';

import { Mutex } from 'async-mutex';
import { ErrorConditions } from './meta';
export { Request, RequestResponse, Response, Notification };

export interface RpcConnection {
label: string;
request_response_readable: ReadableStream<RequestResponse>;
request_writable: WritableStream<Request>;
notification_readable: ReadableStream<Notification>;
current_request: number;
}

export interface CreateRpcConnectionOpts {
signal?: AbortSignal;
}

export function create_rpc_connection(transport: RpcTransport, opts?: CreateRpcConnectionOpts): RpcConnection {
let { writable: request_writable, readable: byte_readable } =
new TransformStream<Request, Uint8Array>({
transform(chunk, controller) {
let bytes = Request.encode(chunk).finish();
controller.enqueue(bytes);
},
});

let reqPipelineClosed = byte_readable
.pipeThrough(new TransformStream(get_encoder()), { signal: opts?.signal })
.pipeTo(transport.writable, { signal: opts?.signal });

reqPipelineClosed.catch((r) => {console.log("Closed error", r); return r}).then(async (reason: any) => {
await byte_readable.cancel();
transport.abortController.abort(reason);
});

let response_readable = transport.readable
.pipeThrough(new TransformStream(get_decoder()), { signal: opts?.signal })
.pipeThrough(
new TransformStream({
transform(chunk, controller) {
controller.enqueue(Response.decode(chunk));
},
}),
{ signal: opts?.signal }
);

let [a, b] = response_readable.tee();

let request_response_readable = a.pipeThrough(
new TransformStream({
transform(chunk, controller) {
if (chunk.requestResponse) {
controller.enqueue(chunk.requestResponse);
}
},
}),
{ signal: opts?.signal }
);

let notification_readable = b.pipeThrough(
new TransformStream({
transform(chunk, controller) {
if (chunk.notification) {
controller.enqueue(chunk.notification);
}
},
}),
{ signal: opts?.signal }
);

return {
label: transport.label,
request_response_readable,
request_writable,
notification_readable,
current_request: 0,
};
}

const rpcMutex = new Mutex();

export class NoResponseError extends Error {
constructor() {
super("No RPC response received");
Object.setPrototypeOf(this, NoResponseError.prototype);
}
}

export class MetaError extends Error {
readonly condition: ErrorConditions;

constructor(condition: ErrorConditions) {
super("Meta error: " + condition);
this.condition = condition;
Object.setPrototypeOf(this, MetaError.prototype);
}
}

export async function call_rpc(
conn: RpcConnection,
req: Omit<Request, 'requestId'>
): Promise<RequestResponse> {
return await rpcMutex.runExclusive(async () => {
let request: Request = { ...req, requestId: conn.current_request++ };

    let writer = conn.request_writable.getWriter();
    await writer.write(request);
    writer.releaseLock();

    let reader = conn.request_response_readable.getReader();

    let { done, value } = await reader.read();
    reader.releaseLock();

    if (done || !value) {
      throw 'No response';
    }

    if (value.requestId != request.requestId) {
      throw 'Mismatch request IDs';
    }

    if (value.meta?.noResponse) {
      throw new NoResponseError();
    } else if (value.meta?.simpleError) {
      throw new MetaError(value.meta.simpleError);
    }

    return value;

});
}

================================================
FILE: src/transport/errors.ts
================================================
export class UserCancelledError extends Error {
constructor(m: string, opts: ErrorOptions) {
super(m, opts);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UserCancelledError.prototype);
    }

}

================================================
FILE: src/transport/gatt.ts
================================================
import type { RpcTransport } from './';
import { UserCancelledError } from './errors';

const SERVICE_UUID = '00000000-0196-6107-c967-c5cfb1c2482a';
const RPC_CHRC_UUID = '00000001-0196-6107-c967-c5cfb1c2482a';

export async function connect(): Promise<RpcTransport> {
let dev = await navigator.bluetooth.requestDevice({
filters: [{ services: [SERVICE_UUID] }],
optionalServices: [SERVICE_UUID],
}).catch((e) => {
if (e instanceof DOMException && e.name == "NotFoundError") {
throw new UserCancelledError("User cancelled the connection attempt", { cause: e});
} else {
throw e;
}
});

if (!dev.gatt) {
filters: {
throw 'No GATT service!';
}
}

let abortController = new AbortController();

let label = dev.name || 'Unknown';
if (!dev.gatt.connected) {
await dev.gatt.connect();
}

let svc = await dev.gatt.getPrimaryService(SERVICE_UUID);
let char = await svc.getCharacteristic(RPC_CHRC_UUID);

let readable = new ReadableStream({
async start(controller) {
// Reconnect to the same device will lose notifications if we don't first force a stop before starting again.
await char.stopNotifications();
await char.startNotifications();
let vc = (ev: Event) => {
let buf = (ev.target as BluetoothRemoteGATTCharacteristic)?.value
?.buffer;
if (!buf) {
return;
}

        controller.enqueue(new Uint8Array(buf));
      };

      char.addEventListener('characteristicvaluechanged', vc);

      let cb = async () => {
        char.removeEventListener('characteristicvaluechanged', vc);
        dev.removeEventListener('gattserverdisconnected', cb);
        controller.close();
      };

      dev.addEventListener('gattserverdisconnected', cb);
    },

});

let writable = new WritableStream({
write(chunk) {
return char.writeValueWithoutResponse(chunk);
},
});

let sig = abortController.signal;
let abort_cb: (this: AbortSignal, ev: Event) => any;

abort_cb = async (ev: Event) => {
sig.removeEventListener("abort", abort_cb);
dev.gatt?.disconnect();
}

sig.addEventListener("abort", abort_cb);

return { label, abortController, readable, writable };
}

================================================
FILE: src/transport/index.ts
================================================
export interface RpcTransport {
label: string;
abortController: AbortController;
readable: ReadableStream<Uint8Array>;
writable: WritableStream<Uint8Array>;
}

================================================
FILE: src/transport/serial.ts
================================================
import type { RpcTransport } from './';

export async function connect(): Promise<RpcTransport> {
let abortController = new AbortController();
let port = await navigator.serial.requestPort({});

await port.open({ baudRate: 12500 })
.catch((e) => {
if (e instanceof DOMException && e.name === "NetworkError") {
throw new Error("Failed to open the serial port. Check the permissions of the device and verify it is not in use by another process.", { cause: e });
} else {
throw e;
}
});

let info = port.getInfo();
let label =
(info.usbVendorId?.toLocaleString() || '') +
':' +
(info.usbProductId?.toLocaleString() || '');

let sig = abortController.signal;
let abort_cb: (this: AbortSignal, ev: Event) => any;

abort_cb = async (ev: Event) => {
sig.removeEventListener("abort", abort_cb);
await port.writable?.close();
await port.readable?.cancel();

    await port.close();

}

sig.addEventListener("abort", abort_cb);

return { label, abortController, readable: port.readable!, writable: port.writable! };
}

================================================
FILE: test/framing.spec.ts
================================================
import { ReadableStream, TransformStream } from 'web-streams-polyfill';
import { get_encoder, get_decoder } from '../src/framing';

describe("framing", () => {
describe("get_encoder", () => {
it("transforms a basic byte array with SOF and EOF", async () => {
const input = Uint8Array.from([1, 2, 3]);

      const readable: ReadableStream = ReadableStream.from([input]);

      const converted = readable.pipeThrough(
        new TransformStream(get_encoder())
      );

      let reader = converted.getReader();
      let chunks: Array<number> = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done || !value) break;
          chunks = chunks.concat(Array.from(value.values()));
        }
      } finally {
        reader.releaseLock();
      }

      expect(chunks).toEqual([171, 1, 2, 3, 173]);
    });

    it("transforms a complex byte array with SOF and EOF", async () => {
      const input = Uint8Array.from([1, 171, 172, 2, 3, 171, 4, 173, 5]);

      const readable: ReadableStream = ReadableStream.from([input]);

      const converted = readable.pipeThrough(
        new TransformStream(get_encoder())
      );

      let reader = converted.getReader();
      let chunks: Array<number> = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done || !value) break;
          chunks = chunks.concat(Array.from(value.values()));
        }
      } finally {
        reader.releaseLock();
      }

      expect(chunks).toEqual([
        171, 1, 172, 171, 172, 172, 2, 3, 172, 171, 4, 172, 173, 5, 173,
      ]);
    });

});

describe("get_decoder", () => {
it("transforms a basic byte array containing SOF and EOF", async () => {
const input = Uint8Array.from([171, 1, 2, 3, 173, 171, 4, 173]);

      const readable: ReadableStream = ReadableStream.from([input]);

      const converted = readable.pipeThrough(
        new TransformStream(get_decoder())
      );

      let reader = converted.getReader();
      let { done: first_done, value: first_value } = await reader.read();

      expect(first_done).toBeFalsy();
      expect(first_value).toEqual(Uint8Array.from([1, 2, 3]));

      let { done: second_done, value: second_value } = await reader.read();

      expect(second_done).toBeFalsy();
      expect(second_value).toEqual(Uint8Array.from([4]));

      let { done: third_done } = await reader.read();

      expect(third_done).toBeTruthy();
    });

    it("transforms a complex byte array with SOF and EOF", async () => {
      const input = Uint8Array.from([
        171, 1, 172, 171, 172, 172, 2, 3, 172, 171, 4, 172, 173, 5, 173,
      ]);

      const readable: ReadableStream = ReadableStream.from(input);

      const converted = readable.pipeThrough(
        new TransformStream(get_decoder())
      );

      let reader = converted.getReader();
      let { done, value } = await reader.read();

      expect(done).toBeFalsy();

      expect(value).toEqual(
        Uint8Array.from([1, 171, 172, 2, 3, 171, 4, 173, 5])
      );

      reader.releaseLock();
    });

});

describe("extra", () => {
it("decoder errors on unexpected SOF mid-frame", async () => {
const input = Uint8Array.from([0xab, 1, 0xab]);
const readable: ReadableStream<Uint8Array> = ReadableStream.from([input]);
const converted = readable.pipeThrough(
new TransformStream(get_decoder())
);
const reader = converted.getReader();
await expect(reader.read()).rejects.toBeTruthy();
reader.releaseLock();
});

    it("encoder escapes control bytes", async () => {
      const input = Uint8Array.from([0xab, 0xac, 0xad]);
      const readable: ReadableStream<Uint8Array> = ReadableStream.from([input]);
      const converted = readable.pipeThrough(
        new TransformStream(get_encoder())
      );
      const reader = converted.getReader();
      const out: number[] = [];
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done || !value) break;
          out.push(...value);
        }
      } finally {
        reader.releaseLock();
      }
      // Expect: SOF, ESC, SOF, ESC, ESC, ESC, EOF, EOF
      expect(out[0]).toBe(0xab);
      expect(out[out.length - 1]).toBe(0xad);
    });

});
});

================================================
FILE: test/index.spec.ts
================================================
// Streams are polyfilled in test/setupStreams.ts; TypeScript types come from dom lib
import {
create_rpc_connection,
call_rpc,
NoResponseError,
MetaError,
} from "../src/index";
import { Request, Response } from "../src/studio";
import type { RpcTransport } from "../src/transport";

function makeMockTransport() {
const abortController = new AbortController();

let downstreamToTransport = new TransformStream<Uint8Array, Uint8Array>();
let transportToUpstream = new TransformStream<Uint8Array, Uint8Array>();

const writable = downstreamToTransport.writable;
const readable = transportToUpstream.readable;

return {
transport: {
label: "mock",
abortController,
readable,
writable,
} as RpcTransport,
downReadable: downstreamToTransport.readable,
upWritable: transportToUpstream.writable,
};
}

async function writeResponseBytes(
upWritable: WritableStream<Uint8Array>,
resp: Response
) {
const writer = upWritable.getWriter();
const bytes = Response.encode(resp).finish();
await writer.write(Uint8Array.from([0xab]));
await writer.write(bytes);
await writer.write(Uint8Array.from([0xad]));
writer.releaseLock();
}

describe("index rpc", () => {
it("sends a Core request and receives matching response", async () => {
const { transport, upWritable } = makeMockTransport();
const conn = create_rpc_connection(transport);

    // Prepare response for requestId 0
    const rrPromise = call_rpc(conn, { core: { getLockState: true } } as Omit<
      Request,
      "requestId"
    >);

    await writeResponseBytes(upWritable, {
      requestResponse: {
        requestId: 0,
        core: { getLockState: 1 },
      },
    });

    const rr = await rrPromise;
    expect(rr.requestId).toBe(0);
    expect(rr.core?.getLockState).toBe(1);

});

it("throws NoResponseError when meta.noResponse is set", async () => {
const { transport, upWritable } = makeMockTransport();
const conn = create_rpc_connection(transport);

    const p = call_rpc(conn, { core: { getDeviceInfo: true } } as Omit<
      Request,
      "requestId"
    >);

    await writeResponseBytes(upWritable, {
      requestResponse: { requestId: 0, meta: { noResponse: true } },
    });

    await expect(p).rejects.toBeInstanceOf(NoResponseError);

});

it("throws MetaError when meta.simpleError is set", async () => {
const { transport, upWritable } = makeMockTransport();
const conn = create_rpc_connection(transport);

    const p = call_rpc(conn, { core: { getDeviceInfo: true } } as Omit<
      Request,
      "requestId"
    >);

    await writeResponseBytes(upWritable, {
      requestResponse: { requestId: 0, meta: { simpleError: 1 } },
    });

    await expect(p).rejects.toBeInstanceOf(MetaError);

});

it("rejects when requestId mismatches", async () => {
const { transport, upWritable } = makeMockTransport();
const conn = create_rpc_connection(transport);

    const p = call_rpc(conn, { core: { getDeviceInfo: true } } as Omit<
      Request,
      "requestId"
    >);

    await writeResponseBytes(upWritable, {
      requestResponse: { requestId: 1234 },
    });

    await expect(p).rejects.toBeTruthy();

});
});

================================================
FILE: test/messages.roundtrip.spec.ts
================================================
import {
Request as CoreReq,
Response as CoreResp,
LockState,
} from "../src/core";
import {
Request as KmReq,
Response as KmResp,
Keymap,
BehaviorBinding,
} from "../src/keymap";
import { Request as BehReq, Response as BehResp } from "../src/behaviors";
import { Response as MetaResp, ErrorConditions } from "../src/meta";

describe("messages roundtrip encode/decode", () => {
it("core GetDeviceInfo encodes/decodes", () => {
const req = CoreReq.fromPartial({ getDeviceInfo: true });
const bytes = CoreReq.encode(req).finish();
const decoded = CoreReq.decode(bytes);
expect(decoded.getDeviceInfo).toBe(true);
});

it("core LockState enum JSON mapping", () => {
expect(LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED).toBe(0);
});

it("keymap setLayerBinding encodes/decodes", () => {
const binding: BehaviorBinding = { behaviorId: 4, param1: 1, param2: 2 };
const req = KmReq.fromPartial({
setLayerBinding: { layerId: 1, keyPosition: 0, binding },
});
const bytes = KmReq.encode(req).finish();
const decoded = KmReq.decode(bytes);
expect(decoded.setLayerBinding?.binding?.behaviorId).toBe(4);
});

it("behaviors listAllBehaviors encodes/decodes", () => {
const req = BehReq.fromPartial({ listAllBehaviors: true });
const bytes = BehReq.encode(req).finish();
const decoded = BehReq.decode(bytes);
expect(decoded.listAllBehaviors).toBe(true);
});

it("meta simpleError encodes/decodes", () => {
const resp = MetaResp.fromPartial({
simpleError: ErrorConditions.UNLOCK_REQUIRED,
});
const bytes = MetaResp.encode(resp).finish();
const decoded = MetaResp.decode(bytes);
expect(decoded.simpleError).toBe(ErrorConditions.UNLOCK_REQUIRED);
});
});

================================================
FILE: test/setupStreams.ts
================================================
import {
ReadableStream,
WritableStream,
TransformStream,
} from "web-streams-polyfill";

(globalThis as any).ReadableStream = ReadableStream;
(globalThis as any).WritableStream = WritableStream;
(globalThis as any).TransformStream = TransformStream;

================================================
FILE: test/transport.gatt.spec.ts
================================================
import { connect } from "../src/transport/gatt";
import { UserCancelledError } from "../src/transport/errors";

function makeDevice() {
const chrc = {
startNotifications: jest.fn().mockResolvedValue(undefined),
stopNotifications: jest.fn().mockResolvedValue(undefined),
addEventListener: jest.fn(),
removeEventListener: jest.fn(),
writeValueWithoutResponse: jest.fn().mockResolvedValue(undefined),
};
const svc = { getCharacteristic: jest.fn().mockResolvedValue(chrc) };
const gatt = {
connected: false,
connect: jest.fn().mockResolvedValue(undefined),
getPrimaryService: jest.fn().mockResolvedValue(svc),
};
const dev = {
name: "Mock ZMK",
gatt,
addEventListener: jest.fn(),
removeEventListener: jest.fn(),
};
return { dev, chrc } as any;
}

describe("transport.gatt connect", () => {
it("returns transport with readable/writable streams", async () => {
const { dev } = makeDevice();
(globalThis as any).navigator = {
bluetooth: {
requestDevice: jest.fn().mockResolvedValue(dev),
},
};
const transport = await connect();
expect(transport.label).toBe("Mock ZMK");
expect(transport.readable).toBeTruthy();
expect(transport.writable).toBeTruthy();
});

it("throws UserCancelledError when chooser dismissed", async () => {
const domErr = new DOMException("cancelled", "NotFoundError");
(globalThis as any).navigator = {
bluetooth: {
requestDevice: jest.fn().mockRejectedValue(domErr),
},
};
await expect(connect()).rejects.toBeInstanceOf(UserCancelledError);
});

it("connects when not already connected, skips when already connected", async () => {
const { dev } = makeDevice();
(globalThis as any).navigator = {
bluetooth: {
requestDevice: jest.fn().mockResolvedValue(dev),
},
};
await connect();
expect(dev.gatt.connect).toHaveBeenCalledTimes(1);

    // Now pretend device is already connected
    const ready = makeDevice();
    ready.dev.gatt.connected = true;
    (globalThis as any).navigator.bluetooth.requestDevice.mockResolvedValueOnce(
      ready.dev
    );
    await connect();
    expect(ready.dev.gatt.connect).not.toHaveBeenCalled();

});

it("emits bytes on notifications and calls stop/start notifications", async () => {
const { dev, chrc } = makeDevice();
(globalThis as any).navigator = {
bluetooth: { requestDevice: jest.fn().mockResolvedValue(dev) },
};
const transport = await connect();

    // Ensure stop/start notifications were called in start()
    expect(chrc.stopNotifications).toHaveBeenCalledTimes(1);
    expect(chrc.startNotifications).toHaveBeenCalledTimes(1);

    // Trigger a notification using the actual registered listener
    await new Promise((r) => setTimeout(r, 0));
    const reader = transport.readable.getReader();
    const data = Uint8Array.from([1, 2, 3]);
    const call = chrc.addEventListener.mock.calls.find(
      (c: any[]) => c[0] === "characteristicvaluechanged"
    );
    expect(call).toBeTruthy();
    const listener = call![1] as (ev: any) => void;
    listener({ target: { value: new DataView(data.buffer) } });
    const { done, value } = await reader.read();
    expect(done).toBeFalsy();
    expect(Array.from(value!)).toEqual([1, 2, 3]);
    reader.releaseLock();

});

it("closes readable on gattserverdisconnected and removes listeners", async () => {
const { dev, chrc } = makeDevice();
(globalThis as any).navigator = {
bluetooth: { requestDevice: jest.fn().mockResolvedValue(dev) },
};
const transport = await connect();
await new Promise((r) => setTimeout(r, 0));
const reader = transport.readable.getReader();

    // Locate the registered disconnect handler and invoke it
    const dcall = dev.addEventListener.mock.calls.find(
      (c: any[]) => c[0] === "gattserverdisconnected"
    );
    expect(dcall).toBeTruthy();
    const dlistener = dcall![1] as (ev: any) => void;
    dlistener({});

    const { done } = await reader.read();
    expect(done).toBe(true);
    reader.releaseLock();

    // Expect listeners removed
    const ncall = chrc.addEventListener.mock.calls.find(
      (c: any[]) => c[0] === "characteristicvaluechanged"
    );
    const nlistener = ncall![1];
    expect(chrc.removeEventListener).toHaveBeenCalledWith(
      "characteristicvaluechanged",
      nlistener
    );
    expect(dev.removeEventListener).toHaveBeenCalledWith(
      "gattserverdisconnected",
      expect.any(Function)
    );

});

it("writes chunks via characteristic without response", async () => {
const { dev, chrc } = makeDevice();
(globalThis as any).navigator = {
bluetooth: { requestDevice: jest.fn().mockResolvedValue(dev) },
};
const transport = await connect();
const writer = transport.writable.getWriter();
const payload = Uint8Array.from([9, 8, 7]);
await writer.write(payload);
writer.releaseLock();
expect(chrc.writeValueWithoutResponse).toHaveBeenCalledTimes(1);
expect(chrc.writeValueWithoutResponse.mock.calls[0][0]).toEqual(payload);
});

it("aborts: disconnects GATT server", async () => {
const { dev } = makeDevice();
dev.gatt.disconnect = jest.fn();
(globalThis as any).navigator = {
bluetooth: { requestDevice: jest.fn().mockResolvedValue(dev) },
};
const transport = await connect();
transport.abortController.abort(new Error("test"));
await new Promise((r) => setTimeout(r, 0));
expect(dev.gatt.disconnect).toHaveBeenCalled();
});

it("throws when device has no GATT service", async () => {
const dev: any = { name: "NoGatt" };
(globalThis as any).navigator = {
bluetooth: { requestDevice: jest.fn().mockResolvedValue(dev) },
};
await expect(connect()).rejects.toBe("No GATT service!");
});
});

================================================
FILE: test/transport.serial.spec.ts
================================================
import { connect } from "../src/transport/serial";

describe("transport.serial connect", () => {
it("opens serial port and returns transport", async () => {
const mockPort = {
open: jest.fn().mockResolvedValue(undefined),
close: jest.fn().mockResolvedValue(undefined),
get readable() {
return new ReadableStream<Uint8Array>();
},
get writable() {
return new WritableStream<Uint8Array>();
},
getInfo: () => ({ usbVendorId: 1, usbProductId: 2 }),
} as any;

    (globalThis as any).navigator = {
      serial: {
        requestPort: jest.fn().mockResolvedValue(mockPort),
      },
    };

    const transport = await connect();
    expect(transport.label).toBe("1:2");
    expect(transport.readable).toBeTruthy();
    expect(transport.writable).toBeTruthy();

});

it("maps NetworkError during open to clear message", async () => {
const err = new DOMException("nope", "NetworkError");
const mockPort = {
open: jest.fn().mockRejectedValue(err),
} as any;
(globalThis as any).navigator = {
serial: { requestPort: jest.fn().mockResolvedValue(mockPort) },
};

    await expect(connect()).rejects.toBeInstanceOf(Error);

});
});

================================================
FILE: .github/workflows/checks.yml
================================================
on:
pull_request:
push:
branches: - main

name: checks

jobs:
checks:
strategy:
matrix:
command: [typecheck, test]
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v4 - uses: actions/setup-node@v4
with:
node-version: 18
registry-url: 'https://registry.npmjs.org' - name: Install Protoc
uses: arduino/setup-protoc@v3 - run: npm ci - run: npm run ${{ matrix.command }}

================================================
FILE: .github/workflows/release.yml
================================================
on:
push:
branches: - main

permissions: {}

name: release-please

jobs:
release-please:
runs-on: ubuntu-latest
permissions:
contents: write
pull-requests: write
steps: - uses: googleapis/release-please-action@v4
id: release
with:
token: ${{ secrets.ZMK_STUDIO_RELEASE_TOKEN }}
release-type: node - uses: actions/checkout@v4
if: ${{ steps.release.outputs.release_created }}
with:
submodules: true - uses: actions/setup-node@v4
with:
node-version: 18
registry-url: 'https://registry.npmjs.org'
if: ${{ steps.release.outputs.release_created }} - name: Install Protoc
uses: arduino/setup-protoc@v3
if: ${{ steps.release.outputs.release_created }} - run: npm ci
if: ${{ steps.release.outputs.release_created }} - run: npm publish --access public
env:
NODE_AUTH_TOKEN: ${{secrets.ZMK_STUDIO_NPM_TOKEN}}
if: ${{ steps.release.outputs.release_created }}

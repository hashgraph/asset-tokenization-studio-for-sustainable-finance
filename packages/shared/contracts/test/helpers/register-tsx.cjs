// SPDX-License-Identifier: Apache-2.0
// Registers tsx CJS and ESM hooks inside Mocha parallel worker threads.
// tsx's auto-registration skips ESM hooks in worker threads (isMainThread guard).
// We force both registrations by calling tsx's internal register functions directly.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MessageChannel } = require("node:worker_threads");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { register } = require("node:module");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { pathToFileURL } = require("node:url");

// 1. Register CJS hooks (Module._extensions for .ts files)
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("tsx/cjs");

// 2. Register ESM hooks via module.register() with proper data
//    tsx/esm's initialize() requires a truthy data argument with a port
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { port1, port2 } = new MessageChannel();
register("tsx/esm", {
  parentURL: pathToFileURL(__filename).toString(),
  data: { port: port2 },
  transferList: [port2],
});

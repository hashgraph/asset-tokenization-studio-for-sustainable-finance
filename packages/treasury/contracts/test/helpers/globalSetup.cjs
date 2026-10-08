// SPDX-License-Identifier: Apache-2.0
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { silenceScriptLogging, mochaHooks } = require("@hashgraph/asset-tokenization-contracts/test");

// Module-level: silences deployment logs when Mocha loads this file via require.
// Hardhat's Mocha integration does NOT extract Root Hook Plugins from require files,
// so mochaHooks.beforeAll never fires — module-level silencing is the actual mechanism.
silenceScriptLogging();

module.exports = { mochaHooks };

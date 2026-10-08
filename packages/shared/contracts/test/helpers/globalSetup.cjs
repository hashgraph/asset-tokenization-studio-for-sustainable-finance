// SPDX-License-Identifier: Apache-2.0
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { silenceScriptLogging, mochaHooks } = require("@hashgraph/asset-tokenization-contracts/test");

// Module-level: silences deployment logs when Mocha loads this file via require.
// Hardhat's Mocha integration does NOT extract Root Hook Plugins from require files,
// so mochaHooks.beforeAll never fires — module-level silencing is the actual mechanism.
silenceScriptLogging();

// Each domain package has its own @hashgraph/asset-tokenization-contracts copy
// with separate logger state. Importing their test barrels triggers module-level
// silenceScriptLogging() in each, suppressing cross-domain deployment logs.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("@hashgraph/green-bonds-platform-ats-contracts/test");
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("@hashgraph/green-bonds-platform-treasury-contracts/test");
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("@hashgraph/green-bonds-platform-primarymarket-contracts/test");

module.exports = { mochaHooks };

// SPDX-License-Identifier: Apache-2.0
import { silenceScriptLogging } from "@hashgraph/asset-tokenization-contracts/test";

// Module-level: silences deployment logs when test files import this barrel.
// In sequential mode, Mocha ignores the `require` config — this code runs
// when any test file transitively imports from test/helpers/index.ts.
silenceScriptLogging();

// Each domain package has its own @hashgraph/asset-tokenization-contracts copy
// with separate logger state. Importing their test barrels triggers module-level
// silenceScriptLogging() in each, suppressing cross-domain deployment logs.
import "@hashgraph/green-bonds-platform-ats-contracts/test";
import "@hashgraph/green-bonds-platform-treasury-contracts/test";
import "@hashgraph/green-bonds-platform-primarymarket-contracts/test";

export { mochaHooks, silenceScriptLogging } from "@hashgraph/asset-tokenization-contracts/test";

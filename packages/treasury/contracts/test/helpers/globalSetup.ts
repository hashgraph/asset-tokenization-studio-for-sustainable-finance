// SPDX-License-Identifier: Apache-2.0
import { silenceScriptLogging } from "@hashgraph/asset-tokenization-contracts/test";

// Module-level: silences deployment logs when test files import this barrel.
// In sequential mode, Mocha ignores the `require` config — this code runs
// when any test file transitively imports from test/helpers/index.ts.
silenceScriptLogging();

export { mochaHooks, silenceScriptLogging } from "@hashgraph/asset-tokenization-contracts/test";

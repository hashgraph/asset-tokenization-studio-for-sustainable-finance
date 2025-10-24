// SPDX-License-Identifier: Apache-2.0

import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";

/**
 * Override Hardhat's compile task to automatically generate registry.
 *
 * This ensures the registry is always up-to-date with the latest compiled contracts.
 * The registry generation runs silently to avoid cluttering compilation output.
 *
 * Workflow:
 * 1. Run default Hardhat compilation (Solidity → artifacts → TypeChain)
 * 2. Run registry generation (scan contracts → extract metadata → generate TS registry)
 *
 * @see tasks/generateRegistry.ts for the registry generation task
 */
task(TASK_COMPILE, "Compile contracts and generate registry", async function (taskArguments, hre, runSuper) {
  // Run default compilation
  await runSuper(taskArguments);

  // Generate registry after successful compilation
  // Use silent mode to minimize output during compilation
  await hre.run("generate-registry", { silent: true });
});

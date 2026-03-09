// SPDX-License-Identifier: Apache-2.0

import { ethers } from "hardhat";
import { join } from "path";
import { tmpdir } from "os";
import { mkdtempSync } from "fs";
import { BusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import {
  deployGbpInfrastructure,
  upgradeGbpConfigurations,
  type DeploymentOptions,
  type UpgradeGbpConfigurationsOutput,
} from "@scripts";

/**
 * Fixture: Deploy complete GBP infrastructure on Hardhat network.
 *
 * Runs the full 6-step orchestration:
 * 1. ProxyAdmin
 * 2. BLR (BusinessLogicResolver)
 * 3. BOND configuration
 * 4. TREASURY configuration
 * 5. FactorySuite configuration + proxy
 * 6. PrimaryMarket configuration + proxy
 */
export async function deployGbpInfrastructureFixture(useTimeTravel = false) {
  const signers = await ethers.getSigners();
  const [deployer] = signers;

  // Use temp directory for test isolation (no leftover checkpoint files)
  const checkpointDir = mkdtempSync(join(tmpdir(), "gbp-test-"));

  const options: DeploymentOptions = {
    useTimeTravel,
    network: "hardhat",
    verbose: false,
    checkpointDir,
    saveOutput: false,
  };

  const result = await deployGbpInfrastructure(deployer, options);

  // Connect BLR instance for test queries
  const blr = BusinessLogicResolver__factory.connect(result.blr, deployer);

  return {
    // Signers
    signers,
    deployer,

    // Deployment result
    result,

    // Convenience accessors
    blr,
    blrAddress: result.blr,
    proxyAdminAddress: result.proxyAdmin,

    // Domain results
    bondDeployment: result.bondDeployment,
    treasuryDeployment: result.treasuryDeployment,
    factorySuiteDeployment: result.factorySuiteDeployment,
    primaryMarketDeployment: result.primaryMarketDeployment,
  };
}

/** Fixture variant with TimeTravel mode enabled. */
export async function deployGbpInfrastructureTimeTravelFixture() {
  return deployGbpInfrastructureFixture(true);
}

/**
 * Fixture: Deploy GBP infrastructure AND run a full upgrade (v1 → v2).
 *
 * Combines deploy + upgrade into a single snapshot so individual upgrade tests
 * don't repeat the expensive 4-domain upgrade.
 */
export async function deployAndUpgradeGbpFixture() {
  const base = await deployGbpInfrastructureFixture();

  const upgradeOutput = await upgradeGbpConfigurations(base.deployer, {
    blrAddress: base.blrAddress,
    network: "hardhat",
  });

  return {
    ...base,
    upgradeOutput,
  };
}

/**
 * Fixture: Deploy GBP infrastructure AND upgrade only treasury + factorySuite.
 */
export async function deployAndSelectiveUpgradeFixture() {
  const base = await deployGbpInfrastructureFixture();

  const upgradeOutput = await upgradeGbpConfigurations(base.deployer, {
    blrAddress: base.blrAddress,
    network: "hardhat",
    domains: ["treasury", "factorySuite"],
  });

  return {
    ...base,
    upgradeOutput,
  };
}

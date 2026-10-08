// SPDX-License-Identifier: Apache-2.0

/**
 * Core Treasury infrastructure fixtures.
 *
 * Provides base deployment fixtures for:
 * - ProxyAdmin (upgrade management)
 * - BusinessLogicResolver (BLR) with facet registry
 * - Treasury facets (AccessControl, Pause, LifeCycleCashFlow, Portfolio, ProceedsManagement)
 * - Treasury proxy with all facets
 *
 * Uses Hardhat Network Helpers loadFixture pattern for efficient test setup.
 * Each fixture is executed once and snapshotted, subsequent calls restore state.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ethers } from "hardhat";
import type { ITimeTravel } from "@hashgraph/asset-tokenization-contracts";
import { ITimeTravel__factory, BusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import { deployTreasury, type DeployTreasuryOutput } from "@scripts";
import type { IBusinessLogicResolver } from "@contract-types";

/**
 * Fixture: Deploy complete Treasury infrastructure
 *
 * Deploys: ProxyAdmin, BLR, Treasury facets, Treasury configuration & proxy
 *
 * @param useTimeTravel - Use TimeTravel facet variants (default: true for tests)
 * @returns Complete deployment output + test utilities
 */
export async function deployTreasuryInfrastructureFixture(useTimeTravel = true) {
  const signers = await ethers.getSigners();
  const [deployer, admin] = signers;

  // Deploy complete system using workflow
  const deployment = await deployTreasury(deployer, "hardhat", {
    useTimeTravel,
    saveOutput: false,
  });

  // Get typed contract instances using TypeChain factories
  const blr = BusinessLogicResolver__factory.connect(deployment.infrastructure.blr.proxy, deployer);

  // Get TimeTravelFacet if TimeTravel is enabled
  const timeTravel = useTimeTravel
    ? ITimeTravel__factory.connect(deployment.infrastructure.treasury?.proxy || "", deployer)
    : undefined;

  return {
    // Signers
    deployer,
    admin,

    // Core contracts
    blr,

    // TimeTravel control (only available when useTimeTravel: true)
    timeTravel,

    // Deployment metadata
    deployment,

    // Facet addresses (useful for verification)
    facetAddresses: deployment.facets.reduce(
      (acc, f) => {
        acc[f.name] = f.address;
        return acc;
      },
      {} as Record<string, string>,
    ),
  };
}

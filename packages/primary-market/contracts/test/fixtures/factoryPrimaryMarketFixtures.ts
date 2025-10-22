// SPDX-License-Identifier: Apache-2.0

/**
 * Core FactoryPrimaryMarket infrastructure fixtures.
 *
 * Provides base deployment fixtures for:
 * - ProxyAdmin (upgrade management)
 * - BusinessLogicResolver (BLR) with facet registry
 * - FactoryPrimaryMarket proxy with all facets
 * - Registered facets (FactoryPrimaryMarket configuration)
 *
 * Uses Hardhat Network Helpers loadFixture pattern for efficient test setup.
 * Each fixture is executed once and snapshotted, subsequent calls restore state.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ethers } from "hardhat";
import {
  HardhatProvider,
  configureLogger,
  LogLevel,
  deployFacets,
  registerAdditionalFacets,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { deployFactoryPrimaryMarketSystem, PM_DEPLOYER_ROLE, PAUSER_ROLE } from "@scripts";
import { createTreasuryConfiguration } from "@test";
import type { IFactoryPrimaryMarket, IBusinessLogicResolver, ProxyAdmin } from "@contracts";

/**
 * Fixture: Deploy complete FactoryPrimaryMarket infrastructure
 *
 * Deploys: ProxyAdmin, BLR, FactoryPrimaryMarket facets, FactoryPrimaryMarket configuration & proxy
 *
 * @param useTimeTravel - Use TimeTravel facet variants (default: true for tests)
 * @returns Complete deployment output + test utilities
 */
export async function deployFactoryPrimaryMarketInfrastructureFixture(useTimeTravel = true) {
  // Configure logger to SILENT for tests (suppress all deployment logs)
  configureLogger({ level: LogLevel.SILENT });

  const provider = new HardhatProvider();
  const signers = await ethers.getSigners();
  const [deployer, admin, user, unauthorized] = signers;

  // Deploy complete system using workflow
  const deployment = await deployFactoryPrimaryMarketSystem(provider, "hardhat", {
    useTimeTravel,
    saveOutput: false, // Don't save deployment files during tests
  });

  // Get typed contract instances
  // Use ethers.getContractAt for interfaces
  const factoryPrimaryMarket = (await ethers.getContractAt(
    "IFactoryPrimaryMarket",
    deployment.infrastructure.factoryPrimaryMarket.proxy,
  )) as IFactoryPrimaryMarket;

  const blr = (await ethers.getContractAt(
    "IBusinessLogicResolver",
    deployment.infrastructure.blr.proxy,
  )) as IBusinessLogicResolver;

  const proxyAdmin = (await ethers.getContractAt(
    "ProxyAdmin",
    deployment.infrastructure.proxyAdmin.address,
  )) as ProxyAdmin;

  // Get TimeTravelFacet if TimeTravel is enabled
  const timeTravel = useTimeTravel
    ? ((await ethers.getContractAt("ITimeTravel", deployment.infrastructure.factoryPrimaryMarket.proxy)) as ITimeTravel)
    : undefined;

  return {
    // Provider & signers
    provider,
    signers,
    deployer,
    admin,
    user,
    unauthorized,

    // Core contracts
    factoryPrimaryMarket,
    blr,
    proxyAdmin,

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

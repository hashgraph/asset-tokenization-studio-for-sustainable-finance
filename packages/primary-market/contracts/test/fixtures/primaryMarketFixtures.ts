// SPDX-License-Identifier: Apache-2.0

/**
 * Core Primary Market infrastructure fixtures.
 *
 * Provides base deployment fixtures for:
 * - ProxyAdmin (upgrade management)
 * - BusinessLogicResolver (BLR) with facet registry
 * - FactoryPrimaryMarket and PrimaryMarket facets
 * - FactoryPrimaryMarket proxy with all facets
 *
 * Uses Hardhat Network Helpers loadFixture pattern for efficient test setup.
 * Each fixture is executed once and snapshotted, subsequent calls restore state.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ethers } from "hardhat";
import { deployResolverProxy } from "@hashgraph/asset-tokenization-contracts/scripts";
import { ITimeTravel__factory, BusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import { deployFactoryPrimaryMarketSystem } from "@scripts";
import { PRIMARY_MARKET_CONFIG_ID } from "@scripts/domain";

/**
 * Fixture: Deploy complete FactoryPrimaryMarket infrastructure
 *
 * Deploys: ProxyAdmin, BLR, FactoryPrimaryMarket facets, FactoryPrimaryMarket configuration & proxy
 *
 * @param useTimeTravel - Use TimeTravel facet variants (default: true for tests)
 * @returns Complete deployment output + test utilities
 */
export async function deployFactoryPrimaryMarketInfrastructureFixture(useTimeTravel = true) {
  const signers = await ethers.getSigners();
  const [deployer, admin] = signers;

  // Deploy complete system using workflow
  const deployment = await deployFactoryPrimaryMarketSystem(deployer, "hardhat", {
    useTimeTravel,
    saveOutput: false,
  });

  // Get typed contract instances using TypeChain factories
  const blr = BusinessLogicResolver__factory.connect(deployment.infrastructure.blr.proxy, deployer);

  // Get TimeTravelFacet if TimeTravel is enabled
  const timeTravel = useTimeTravel
    ? ITimeTravel__factory.connect(deployment.infrastructure.factoryPrimaryMarket.proxy, deployer)
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

/**
 * Fixture: Deploy complete PrimaryMarket infrastructure (individual instance)
 *
 * This fixture is similar to FactoryPrimaryMarket but specifically for testing
 * individual PrimaryMarket deployments or upgrade scenarios.
 *
 * @param useTimeTravel - Use TimeTravel facet variants (default: true for tests)
 * @returns Complete deployment output + test utilities
 */
export async function deployPrimaryMarketInfrastructureFixture(useTimeTravel = true) {
  const signers = await ethers.getSigners();
  const [deployer, admin] = signers;

  // Deploy complete system using workflow (includes both Factory and individual configs)
  const deployment = await deployFactoryPrimaryMarketSystem(deployer, "hardhat", {
    useTimeTravel,
    saveOutput: false,
  });

  // Get typed contract instances using TypeChain factories
  const blr = BusinessLogicResolver__factory.connect(deployment.infrastructure.blr.proxy, deployer);

  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  // Deploy separate PrimaryMarket ResolverProxy using PrimaryMarket configuration (ID 10'001)
  const primaryMarketProxyResult = await deployResolverProxy(deployer, {
    blrAddress: deployment.infrastructure.blr.proxy,
    configurationId: PRIMARY_MARKET_CONFIG_ID,
    version: deployment.primaryMarketConfiguration.version,
    rbac: [
      {
        role: DEFAULT_ADMIN_ROLE,
        members: [await deployer.getAddress()],
      },
    ],
    network: "hardhat",
  });

  if (!primaryMarketProxyResult.success) {
    throw new Error(`PrimaryMarket ResolverProxy deployment failed: ${primaryMarketProxyResult.error}`);
  }

  // Get TimeTravelFacet if TimeTravel is enabled (using PrimaryMarket proxy)
  const timeTravel = useTimeTravel
    ? ITimeTravel__factory.connect(primaryMarketProxyResult.proxyAddress!, deployer)
    : undefined;

  // Extended deployment output to include PrimaryMarket proxy
  const extendedDeployment = {
    ...deployment,
    infrastructure: {
      ...deployment.infrastructure,
      primaryMarket: {
        proxy: primaryMarketProxyResult.proxyAddress!,
        proxyContractId: primaryMarketProxyResult.contractId,
      },
    },
  };

  return {
    // Signers
    deployer,
    admin,

    // Core contracts
    blr,

    // TimeTravel control (only available when useTimeTravel: true)
    timeTravel,

    // Deployment metadata (includes both Factory and PrimaryMarket configurations)
    deployment: extendedDeployment,

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

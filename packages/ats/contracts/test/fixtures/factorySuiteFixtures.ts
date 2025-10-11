// SPDX-License-Identifier: Apache-2.0

/**
 * Core FactorySuite infrastructure fixtures.
 *
 * Provides base deployment fixtures for:
 * - ProxyAdmin (upgrade management)
 * - BusinessLogicResolver (BLR) with facet registry
 * - FactorySuite proxy with all facets
 * - Registered facets (FactorySuite configuration)
 *
 * Uses Hardhat Network Helpers loadFixture pattern for efficient test setup.
 * Each fixture is executed once and snapshotted, subsequent calls restore state.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ethers } from "hardhat";
import { HardhatProvider, configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import { deployFactorySuiteSystem } from "@scripts";
import type { IFactorySuite, IBusinessLogicResolver, ProxyAdmin } from "@typechain";

/**
 * Fixture: Deploy complete FactorySuite infrastructure
 *
 * Deploys: ProxyAdmin, BLR, FactorySuite facets, FactorySuite configuration & proxy
 *
 * @param useTimeTravel - Use TimeTravel facet variants (default: true for tests)
 * @returns Complete deployment output + test utilities
 */
export async function deployFactorySuiteInfrastructureFixture(useTimeTravel = true) {
  // Configure logger to SILENT for tests (suppress all deployment logs)
  configureLogger({ level: LogLevel.SILENT });

  const provider = new HardhatProvider();
  const signers = await ethers.getSigners();
  const [deployer, admin, user, unauthorized] = signers;

  // Deploy complete system using workflow
  const deployment = await deployFactorySuiteSystem(provider, "hardhat", {
    useTimeTravel,
    saveOutput: false, // Don't save deployment files during tests
  });

  // Get typed contract instances
  // Use ethers.getContractAt for interfaces
  const factorySuite = (await ethers.getContractAt(
    "IFactorySuite",
    deployment.infrastructure.factorySuite.proxy,
  )) as IFactorySuite;

  const blr = (await ethers.getContractAt(
    "IBusinessLogicResolver",
    deployment.infrastructure.blr.proxy,
  )) as IBusinessLogicResolver;

  const proxyAdmin = (await ethers.getContractAt(
    "ProxyAdmin",
    deployment.infrastructure.proxyAdmin.address,
  )) as ProxyAdmin;

  return {
    // Provider & signers
    provider,
    signers,
    deployer,
    admin,
    user,
    unauthorized,

    // Core contracts
    factorySuite,
    blr,
    proxyAdmin,

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
 * Fixture: Deploy with mock dependencies
 * (For isolated FactorySuite testing without full infrastructure)
 */
export async function deployFactorySuiteWithMocksFixture() {
  const signers = await ethers.getSigners();
  const [deployer, admin, user, unauthorized] = signers;

  // Deploy mock contracts
  const MockAtsFactory = await ethers.getContractFactory("MockAtsFactory");
  const mockAtsFactory = await MockAtsFactory.deploy();
  await mockAtsFactory.deployed();

  const MockResolver = await ethers.getContractFactory("MockBusinessLogicResolver");
  const mockResolver = await MockResolver.deploy();
  await mockResolver.deployed();

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const paymentToken = await MockERC20.deploy("Payment Token", "PAY");
  await paymentToken.deployed();

  const MockERC721 = await ethers.getContractFactory("MockERC721");
  const erc721Token1 = await MockERC721.deploy("NFT 1", "NFT1");
  await erc721Token1.deployed();

  const erc721Token2 = await ethers.getContractFactory("MockERC721");
  const erc721Token = await erc721Token2.deploy("NFT 2", "NFT2");
  await erc721Token.deployed();

  return {
    // Signers
    deployer,
    admin,
    user,
    unauthorized,

    // Mock contracts
    mockAtsFactory,
    mockResolver,
    paymentToken,
    erc721Token1,
    erc721Token2: erc721Token,
  };
}

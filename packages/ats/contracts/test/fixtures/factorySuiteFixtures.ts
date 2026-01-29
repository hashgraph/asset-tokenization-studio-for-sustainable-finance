// SPDX-License-Identifier: Apache-2.0

/**
 * Core FactorySuite infrastructure fixtures.
 *
 * Provides base deployment fixtures for:
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
import { ContractFactory } from "ethers";
import {
  configureLogger,
  LogLevel,
  deployFacets,
  registerAdditionalFacets,
  atsRegistry,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { ITimeTravel__factory, IBusinessLogicResolver__factory, IPause__factory } from "@hashgraph/asset-tokenization-contracts";
import {
  deployFactorySuiteSystem,
  factorySuiteRegistry,
  getFacetDefinitionFromRegistry,
  TREASURY_CONFIG_ID,
  ROLES,
} from "@scripts";
import {
  createTreasuryConfiguration,
  TREASURY_CONFIG_VERSION,
} from "@test";
import {
  MockAtsFactory__factory,
  MockERC20__factory,
  MockERC721__factory,
  IFactorySuite__factory,
} from "@contract-types";

/**
 * Fixture: Deploy complete FactorySuite infrastructure
 *
 * Deploys: BLR, FactorySuite facets, FactorySuite configuration & proxy
 *
 * @param useTimeTravel - Use TimeTravel facet variants (default: true for tests)
 * @returns Complete deployment output + test utilities
 */
export async function deployFactorySuiteInfrastructureFixture(useTimeTravel = true) {
  // Configure logger to SILENT for tests (suppress all deployment logs)
  configureLogger({ level: LogLevel.SILENT });

  const signers = await ethers.getSigners();
  const [deployer, admin, user, unauthorized] = signers;

  // Deploy complete system using workflow
  const deployment = await deployFactorySuiteSystem(deployer, "hardhat", {
    useTimeTravel,
    saveOutput: false, // Don't save deployment files during tests
    confirmations: 0, // Force 0 confirmations for tests (hardhat instant network)
  });

  // Get typed contract instances using TypeChain factories
  const factorySuite = IFactorySuite__factory.connect(deployment.infrastructure.factorySuite.proxy, deployer);

  const blr = IBusinessLogicResolver__factory.connect(deployment.infrastructure.blr.proxy, deployer);

  // Get TimeTravelFacet if TimeTravel is enabled
  const timeTravel = useTimeTravel
    ? ITimeTravel__factory.connect(deployment.infrastructure.factorySuite.proxy, deployer)
    : undefined;

  return {
    // Signers
    signers,
    deployer,
    admin,
    user,
    unauthorized,

    // Core contracts
    factorySuite,
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
 * Fixture: Deploy FactorySuite with mock dependencies for business logic testing
 *
 * Deploys:
 * - Full Diamond proxy (AccessControl + Pause + FactorySuite facets)
 * - Mock dependencies (MockAtsFactory, MockERC20, MockERC721)
 * - Real BLR with mock Treasury/KPI facets registered
 * - Grants DEPLOYER_ROLE to admin signer
 *
 * Uses 2025 best practice: loadFixture pattern for performance optimization
 *
 * @returns Complete deployment + mocks for testing deployBondSuite() business logic
 */
export async function deployFactorySuiteWithMocksForBusinessLogic() {
  // Configure logger to SILENT for tests
  configureLogger({ level: LogLevel.SILENT });

  const signers = await ethers.getSigners();
  const [deployer, admin, user, unauthorized] = signers;

  // Deploy complete Diamond system
  const deployment = await deployFactorySuiteSystem(deployer, "hardhat", {
    useTimeTravel: false, // Don't need TimeTravel for business logic tests
    saveOutput: false,
    confirmations: 0, // Force 0 confirmations for hardhat instant network
  });

  // Get typed contract instances for Diamond proxy
  const factorySuite = IFactorySuite__factory.connect(deployment.infrastructure.factorySuite.proxy, deployer);

  const blr = IBusinessLogicResolver__factory.connect(deployment.infrastructure.blr.proxy, deployer);

  // Get AccessControl facet for test setup
  const accessControl = await ethers.getContractAt(
    "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/accessControl/IAccessControl.sol:IAccessControl",
    deployment.infrastructure.factorySuite.proxy,
  );
  
  // Get pause functionality through ITimeTravel interface (which includes pause methods)
  const pause = IPause__factory.connect(deployment.infrastructure.factorySuite.proxy, deployer);

  // ========================================
  // STEP 1: Deploy and register mock Treasury configuration
  // ========================================
  // Mock facets are now included in factorySuiteRegistry (includeMocksInRegistry: true)
  // No need for manual mock registry creation!

  // Deploy ONLY MockTreasuryFacet (AccessControl already exists from FactorySuite deployment)
  const facetNames = ["MockTreasuryFacet"];

  // Create TypeChain factories from registry
  const facetFactories: Record<string, ContractFactory> = {};
  for (const facetName of facetNames) {
    const facetDef = factorySuiteRegistry.getFacetDefinition(facetName) || atsRegistry.getFacetDefinition(facetName);

    if (!facetDef?.factory) {
      throw new Error(`No factory found for facet: ${facetName}`);
    }

    facetFactories[facetName] = facetDef.factory(deployer, false);
  }

  const mockFacetsResult = await deployFacets(facetFactories, {
    confirmations: 0,
  });

  if (!mockFacetsResult.success || mockFacetsResult.deployed.size !== 1) {
    throw new Error("Failed to deploy MockTreasuryFacet");
  }

  // Extract deployed facet address
  const mockFacetAddresses: Record<string, string> = {};
  mockFacetsResult.deployed.forEach((result, facetName) => {
    if (result.address) {
      mockFacetAddresses[facetName] = result.address;
    }
  });

  const mockFacetsWithKeys = Object.entries(mockFacetAddresses).map(([name, address]) => {
    const { resolverKey } = getFacetDefinitionFromRegistry(name);
    return { name, address, resolverKey };
  });

  // Register MockTreasuryFacet in BLR using registerAdditionalFacets
  const registerResult = await registerAdditionalFacets(deployer, {
    blrAddress: blr.address,
    newFacets: mockFacetsWithKeys,
  });

  if (!registerResult.success) {
    throw new Error(`Failed to register MockTreasuryFacet: ${registerResult.error}`);
  }

  // Create Treasury configuration in BLR using the helper
  // This reuses AccessControlFacet from FactorySuite deployment and adds MockTreasuryFacet
  const facetAddressesForConfig = {
    AccessControlFacet: deployment.facets.find((f) => f.name === "AccessControlFacet")!.address,
    MockTreasuryFacet: mockFacetAddresses.MockTreasuryFacet,
  };

  const treasuryConfigResult = await createTreasuryConfiguration(blr, facetAddressesForConfig, false);

  if (!treasuryConfigResult.success) {
    throw new Error(`Failed to create Treasury configuration: ${treasuryConfigResult.error}`);
  }

  const treasuryConfigId = TREASURY_CONFIG_ID;

  // Treasury configuration version (first version of this configuration)
  const treasuryVersion = TREASURY_CONFIG_VERSION;

  // ========================================
  // STEP 2: Grant DEPLOYER_ROLE to test signers
  // ========================================
  // The deployer account has DEFAULT_ADMIN_ROLE (set during proxy deployment)
  // Grant DEPLOYER_ROLE to both deployer and admin signers for testing flexibility
  // The deployer signer (first account) has DEFAULT_ADMIN_ROLE from deployment
  await accessControl.connect(deployer).grantRole(ROLES.DEPLOYER_ROLE, deployer.address);
  await accessControl.connect(deployer).grantRole(ROLES.DEPLOYER_ROLE, admin.address);

  // Deploy mock contracts for business logic testing using TypeChain factories
  const mockAtsFactory = await new MockAtsFactory__factory(deployer).deploy();
  const paymentToken = await new MockERC20__factory(deployer).deploy("Payment Token", "PAY");
  const environmentalAssetToken1 = await new MockERC721__factory(deployer).deploy("NFT 1", "NFT1");
  const environmentalAssetToken2 = await new MockERC721__factory(deployer).deploy("NFT 2", "NFT2");

  return {
    // Signers
    signers,
    deployer,
    admin,
    user,
    unauthorized,

    // Diamond proxy contracts (for business logic testing)
    factorySuite, // ResolverProxy address - this is what we call deployBondSuite() on
    blr, // Real BLR for Treasury/KPI deployments
    accessControl, // For role management in tests
    pause, // For pause testing

    // Mock contracts for testing deployBondSuite()
    mockAtsFactory,
    paymentToken,
    environmentalAssetToken1,
    environmentalAssetToken2,

    // Treasury configuration metadata (for test data generation)
    treasuryConfigId,
    treasuryVersion,

    // Deployment metadata
    deployment,
  };
}

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
import {
  HardhatProvider,
  configureLogger,
  LogLevel,
  deployFacets,
  registerAdditionalFacets,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { deployFactorySuiteSystem, TREASURY_CONFIG_ID, DEPLOYER_ROLE, PAUSER_ROLE } from "@scripts";
import {
  createTreasuryConfiguration,
  MOCK_ERC20_CONTRACT_NAME,
  MOCK_ERC721_CONTRACT_NAME,
  MOCK_ATS_FACTORY_CONTRACT_NAME,
  TREASURY_CONFIG_VERSION,
} from "@test";
import type { IFactorySuite, IBusinessLogicResolver, ProxyAdmin, ITimeTravel } from "@contracts";

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

  // Get TimeTravelFacet if TimeTravel is enabled
  const timeTravel = useTimeTravel
    ? ((await ethers.getContractAt("ITimeTravel", deployment.infrastructure.factorySuite.proxy)) as ITimeTravel)
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
    factorySuite,
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

  const provider = new HardhatProvider();
  const signers = await ethers.getSigners();
  const [deployer, admin, user, unauthorized] = signers;

  // Deploy complete Diamond system
  const deployment = await deployFactorySuiteSystem(provider, "hardhat", {
    useTimeTravel: false, // Don't need TimeTravel for business logic tests
    saveOutput: false,
  });

  // IMPORTANT: The deployment uses HardhatProvider which internally uses ethers.provider.getSigner(0)
  // This corresponds to the first Hardhat account (index 0 from ethers.getSigners())
  // We need to ensure this matches our deployer signer
  const deployerAddress = deployment.deployer;

  // Get typed contract instances for Diamond proxy
  const factorySuite = (await ethers.getContractAt(
    "IFactorySuite",
    deployment.infrastructure.factorySuite.proxy,
  )) as IFactorySuite;

  const blr = (await ethers.getContractAt(
    "IBusinessLogicResolver",
    deployment.infrastructure.blr.proxy,
  )) as IBusinessLogicResolver;

  // Get AccessControl and Pause facets for test setup
  const accessControl = await ethers.getContractAt("IAccessControl", deployment.infrastructure.factorySuite.proxy);
  const pause = await ethers.getContractAt("IPause", deployment.infrastructure.factorySuite.proxy);

  // ========================================
  // STEP 1: Deploy and register mock Treasury configuration
  // ========================================
  // Create a minimal registry for mock Treasury facet
  const mockTreasuryRegistry = {
    getFacetDefinition(name: string) {
      const facets: Record<string, any> = {
        MockTreasuryFacet: { name: "MockTreasuryFacet", description: "Mock Treasury facet" },
      };
      return facets[name];
    },
    getAllFacets() {
      return [{ name: "MockTreasuryFacet", description: "Mock Treasury facet" }];
    },
  };

  // Deploy ONLY MockTreasuryFacet (AccessControl already exists from FactorySuite deployment)
  const mockFacetsResult = await deployFacets(provider, {
    facetNames: ["MockTreasuryFacet"],
    useTimeTravel: false,
    registry: mockTreasuryRegistry,
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

  // Register MockTreasuryFacet in BLR using registerAdditionalFacets
  const registerResult = await registerAdditionalFacets(provider, {
    blrAddress: blr.address,
    newFacets: mockFacetAddresses,
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
  await accessControl.connect(deployer).grantRole(DEPLOYER_ROLE, deployer.address);
  await accessControl.connect(deployer).grantRole(DEPLOYER_ROLE, admin.address);

  // Deploy mock contracts for business logic testing
  const MockAtsFactory = await ethers.getContractFactory(MOCK_ATS_FACTORY_CONTRACT_NAME);
  const mockAtsFactory = await MockAtsFactory.deploy();
  await mockAtsFactory.deployed();

  const MockERC20 = await ethers.getContractFactory(MOCK_ERC20_CONTRACT_NAME);
  const paymentToken = await MockERC20.deploy("Payment Token", "PAY");
  await paymentToken.deployed();

  const MockERC721 = await ethers.getContractFactory(MOCK_ERC721_CONTRACT_NAME);
  const erc721Token1 = await MockERC721.deploy("NFT 1", "NFT1");
  await erc721Token1.deployed();

  const erc721Token2 = await ethers.getContractFactory(MOCK_ERC721_CONTRACT_NAME);
  const erc721Token2Instance = await erc721Token2.deploy("NFT 2", "NFT2");
  await erc721Token2Instance.deployed();

  return {
    // Provider & signers
    provider,
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
    erc721Token1,
    erc721Token2: erc721Token2Instance,

    // Treasury configuration metadata (for test data generation)
    treasuryConfigId,
    treasuryVersion,

    // Deployment metadata
    deployment,
  };
}

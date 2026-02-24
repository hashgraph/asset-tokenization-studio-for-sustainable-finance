import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {
  createTestDataSets,
  createDefaultAdminRbac,
  TREASURY_CONFIG_VERSION,
  MAX_GAS_FOR_TREASURY_KPI_DEPLOYMENT,
  hashRole,
  TEST_ROLE_1,
  TEST_ROLE_2,
  deployFactorySuiteWithMocksForBusinessLogic,
  deployBondSuiteAndExtractContracts,
} from "@test";
import { TREASURY_CONFIG_ID, PAUSER_ROLE, ROLES } from "@scripts";
import { MockERC721__factory, MockBond__factory, AccessControl__factory } from "@contract-types";
import { ATS_ROLES } from "@hashgraph/asset-tokenization-contracts/scripts";

describe("FactorySuite - Business Logic Tests", () => {
  async function setupFixture() {
    const fixture = await deployFactorySuiteWithMocksForBusinessLogic();
    const testData = createTestDataSets({
      mockResolver: { address: fixture.blr.address }, // Use real BLR for Treasury/KPI
      paymentToken: fixture.paymentToken,
      environmentalAssetToken1: fixture.environmentalAssetToken1,
      environmentalAssetToken2: fixture.environmentalAssetToken2,
      admin: fixture.admin,
      user: fixture.user,
      treasuryConfigId: fixture.treasuryConfigId,
      treasuryVersion: fixture.treasuryVersion,
    });
    return { ...fixture, testData };
  }

  describe("deployBondSuite - Happy Path", () => {
    it("GIVEN valid bond, treasury, and KPI parameters WHEN deploying bond suite THEN success", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const tx = await factorySuite
        .connect(admin)
        .deployBondSuite(mockAtsFactory.address, validBondKpiData, validTreasuryData);

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
    });

    it("GIVEN valid bond suite parameters WHEN deploying bond suite THEN success with BondSuiteDeployed event", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      await expect(
        factorySuite.connect(admin).deployBondSuite(mockAtsFactory.address, validBondKpiData, validTreasuryData),
      )
        .to.emit(factorySuite, "BondSuiteDeployed")
        .withArgs(
          admin.address,
          anyValue, // Bond address (dynamic)
          anyValue, // Treasury address (dynamic)
          anyValue, // BondKpiLinkedRateData struct (complex struct, just verify it's emitted)
          anyValue, // TreasuryData struct
        );
    });

    it("GIVEN valid bond suite parameters WHEN deploying bond suite THEN success with valid contract addresses", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const result = await factorySuite
        .connect(admin)
        .callStatic.deployBondSuite(mockAtsFactory.address, validBondKpiData, validTreasuryData);

      expect(result.bondAddress).to.not.equal(ethers.constants.AddressZero);
      expect(result.treasuryAddress).to.not.equal(ethers.constants.AddressZero);
    });

    it("GIVEN valid bond suite parameters WHEN deploying bond suite THEN success with MockBondDeployed event from ATS factory", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      await expect(
        factorySuite.connect(admin).deployBondSuite(mockAtsFactory.address, validBondKpiData, validTreasuryData),
      ).to.emit(mockAtsFactory, "MockBondDeployed");
    });
  });

  describe("deployBondSuite - Access Control", () => {
    it("GIVEN caller without DEPLOYER role WHEN deploying bond suite THEN fail with AccountHasNoRole", async () => {
      const { factorySuite, mockAtsFactory, unauthorized, accessControl, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      await expect(
        factorySuite.connect(unauthorized).deployBondSuite(mockAtsFactory.address, validBondKpiData, validTreasuryData),
      ).to.be.revertedWithCustomError(accessControl, "AccountHasNoRole");
    });

    it("GIVEN contract is paused WHEN deploying bond suite THEN fail with TokenIsPaused", async () => {
      const { factorySuite, mockAtsFactory, admin, deployer, pause, accessControl, testData } =
        await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      // Grant PAUSER_ROLE to deployer to be able to pause
      await accessControl.connect(deployer).grantRole(PAUSER_ROLE, deployer.address);

      // Pause the contract via PauseFacet
      await pause.connect(deployer).pause();

      await expect(
        factorySuite.connect(admin).deployBondSuite(mockAtsFactory.address, validBondKpiData, validTreasuryData),
      ).to.be.revertedWithCustomError(pause, "TokenIsPaused");
    });
  });

  describe("deployBondSuite - Input Validation", () => {
    it("GIVEN zero bond factory address WHEN deploying bond suite THEN fail with InvalidContractAddress", async () => {
      const { factorySuite, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      await expect(
        factorySuite.connect(admin).deployBondSuite(ethers.constants.AddressZero, validBondKpiData, validTreasuryData),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidContractAddress");
    });

    it("GIVEN treasury data with zero resolver WHEN deploying bond suite THEN fail with InvalidTreasuryData", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, invalidTreasuryData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(mockAtsFactory.address, validBondKpiData, invalidTreasuryData.zeroResolver),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidTreasuryData");
    });

    it("GIVEN treasury data with zero payment token WHEN deploying bond suite THEN fail with InvalidTreasuryData", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, invalidTreasuryData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(mockAtsFactory.address, validBondKpiData, invalidTreasuryData.zeroPaymentToken),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidTreasuryData");
    });

    it("GIVEN treasury data with empty environmental assets array WHEN deploying bond suite THEN success", async () => {
      const { factorySuite, mockAtsFactory, admin, blr, paymentToken, testData } = await loadFixture(setupFixture);
      const { validBondKpiData } = testData;

      const treasuryDataWithEmptyArray = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: TREASURY_CONFIG_VERSION,
        },
        rbacs: createDefaultAdminRbac(admin.address),
        paymentToken: paymentToken.address,
        environmentalAssets: [], // Empty array should be allowed
      };

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(mockAtsFactory.address, validBondKpiData, treasuryDataWithEmptyArray),
      ).to.not.be.reverted;
    });

    it("GIVEN treasury data with zero address in environmental assets array WHEN deploying bond suite THEN fail with InvalidTreasuryData", async () => {
      const { factorySuite, mockAtsFactory, admin, blr, paymentToken, environmentalAssetToken1, testData } =
        await loadFixture(setupFixture);
      const { validBondKpiData } = testData;

      const treasuryDataWithZeroEnvironmentalAsset = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: TREASURY_CONFIG_VERSION,
        },
        rbacs: createDefaultAdminRbac(admin.address),
        paymentToken: paymentToken.address,
        environmentalAssets: [environmentalAssetToken1.address, ethers.constants.AddressZero], // Contains zero address
      };

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(mockAtsFactory.address, validBondKpiData, treasuryDataWithZeroEnvironmentalAsset),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidTreasuryData");
    });

    it("GIVEN treasury data with empty rbacs array WHEN deploying bond suite THEN fail with InvalidTreasuryData", async () => {
      const { factorySuite, mockAtsFactory, admin, blr, paymentToken, environmentalAssetToken1, testData } =
        await loadFixture(setupFixture);
      const { validBondKpiData } = testData;

      const treasuryDataWithEmptyRbacs: IFactorySuite.TreasuryDataStruct = {
        resolver: blr.address,
        resolverProxyConfiguration: { key: ethers.utils.formatBytes32String("treasury"), version: 1 },
        rbacs: [], // Empty RBAC array
        paymentToken: paymentToken.address,
        environmentalAssets: [environmentalAssetToken1.address],
      };

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(mockAtsFactory.address, validBondKpiData, treasuryDataWithEmptyRbacs),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidTreasuryData");
    });

    it("GIVEN bond KPI data with minRate > baseRate WHEN deploying bond suite THEN fail with InvalidInterestRateValues", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const invalidBondKpiData = {
        ...validBondKpiData,
        interestRate: {
          ...validBondKpiData.interestRate,
          minRate: 500, // Higher than baseRate (300)
          baseRate: 300,
          maxRate: 600,
        },
      };

      await expect(
        factorySuite.connect(admin).deployBondSuite(mockAtsFactory.address, invalidBondKpiData, validTreasuryData),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidInterestRateValues");
    });

    it("GIVEN bond KPI data with baseRate > maxRate WHEN deploying bond suite THEN fail with InvalidInterestRateValues", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const invalidBondKpiData = {
        ...validBondKpiData,
        interestRate: {
          ...validBondKpiData.interestRate,
          minRate: 100,
          baseRate: 700, // Higher than maxRate (600)
          maxRate: 600,
        },
      };

      await expect(
        factorySuite.connect(admin).deployBondSuite(mockAtsFactory.address, invalidBondKpiData, validTreasuryData),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidInterestRateValues");
    });

    it("GIVEN bond KPI data with maxDeviationFloor > baseLine WHEN deploying bond suite THEN fail with InvalidImpactDataValues", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const invalidBondKpiData = {
        ...validBondKpiData,
        impactData: {
          ...validBondKpiData.impactData,
          maxDeviationFloor: 150, // Higher than baseLine (100)
          baseLine: 100,
          maxDeviationCap: 200,
        },
      };

      await expect(
        factorySuite.connect(admin).deployBondSuite(mockAtsFactory.address, invalidBondKpiData, validTreasuryData),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidImpactDataValues");
    });

    it("GIVEN bond KPI data with baseLine > maxDeviationCap WHEN deploying bond suite THEN fail with InvalidImpactDataValues", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const invalidBondKpiData = {
        ...validBondKpiData,
        impactData: {
          ...validBondKpiData.impactData,
          maxDeviationFloor: 50,
          baseLine: 250, // Higher than maxDeviationCap (200)
          maxDeviationCap: 200,
        },
      };

      await expect(
        factorySuite.connect(admin).deployBondSuite(mockAtsFactory.address, invalidBondKpiData, validTreasuryData),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidImpactDataValues");
    });
  });

  describe("deployBondSuite - Error Handling", () => {
    it("GIVEN bond factory configured to revert WHEN deploying bond suite THEN fail with BondDeploymentFailed", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      // Configure mock to revert
      await mockAtsFactory.setShouldRevert(true);

      await expect(
        factorySuite.connect(admin).deployBondSuite(mockAtsFactory.address, validBondKpiData, validTreasuryData),
      ).to.be.revertedWithCustomError(factorySuite, "BondDeploymentFailed");
    });

    it("GIVEN reentrant call attempt WHEN deploying bond suite THEN fail with ReentrancyGuard error", async () => {
      const { factorySuite, deployer, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      // Deploy a malicious factory that will attempt reentrancy during bond deployment
      const MockReentrantFactory = await ethers.getContractFactory("MockReentrantFactory");
      const maliciousFactory = await MockReentrantFactory.deploy();
      await maliciousFactory.deployed();

      // Grant DEPLOYER role to the malicious factory so it can pass access control
      // This ensures we're testing the ReentrancyGuard modifier, not access control
      // Note: Must use deployer (who has DEFAULT_ADMIN_ROLE) to grant roles
      const accessControl = AccessControl__factory.connect(factorySuite.address, deployer);
      await accessControl.grantRole(ROLES.DEPLOYER_ROLE, maliciousFactory.address);

      // Configure the malicious factory to attempt reentrancy
      await maliciousFactory.setFactorySuite(factorySuite.address);
      await maliciousFactory.enableReentrancy(validBondKpiData, validTreasuryData);

      // The attack should fail because:
      // 1. First call: deployBondSuite is called → nonReentrant passes → calls malicious factory
      // 2. Malicious factory tries to call deployBondSuite AGAIN (reentrancy)
      // 3. Second call: nonReentrant modifier blocks it with "ReentrancyGuard: reentrant call"
      // 4. The revert is caught by try-catch in _deployBondContract → throws BondDeploymentFailed
      const tx = factorySuite
        .connect(admin)
        .deployBondSuite(maliciousFactory.address, validBondKpiData, validTreasuryData);

      // Verify the transaction reverted due to reentrancy protection
      // The nonReentrant guard blocks the second call, which is caught and wrapped as BondDeploymentFailed
      await expect(tx).to.be.revertedWithCustomError(factorySuite, "BondDeploymentFailed");
    });
  });

  describe("Gas Optimization", () => {
    it("GIVEN valid bond suite parameters WHEN deploying bond suite THEN success with reasonable gas cost", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const tx = await factorySuite
        .connect(admin)
        .deployBondSuite(mockAtsFactory.address, validBondKpiData, validTreasuryData);

      const receipt = await tx.wait();
      // Treasury deployment is expensive, so we allow up to 10M gas
      expect(receipt.gasUsed.lt(ethers.BigNumber.from(MAX_GAS_FOR_TREASURY_KPI_DEPLOYMENT))).to.be.true;
    });
  });

  describe("Edge Cases", () => {
    it("GIVEN treasury data with maximum length environmental assets arrays WHEN deploying bond suite THEN success", async () => {
      const { factorySuite, mockAtsFactory, admin, blr, paymentToken, testData } = await loadFixture(setupFixture);
      const { validBondKpiData } = testData;

      // Create array with multiple environmental asset tokens using TypeChain factory
      const environmentalAssetAddresses = [];
      for (let i = 0; i < 5; i++) {
        const token = await new MockERC721__factory(admin).deploy(`Token${i}`, `T${i}`);
        environmentalAssetAddresses.push(token.address);
      }

      const treasuryDataWithManyTokens = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: TREASURY_CONFIG_VERSION,
        },
        rbacs: createDefaultAdminRbac(admin.address),
        paymentToken: paymentToken.address,
        environmentalAssets: environmentalAssetAddresses,
      };

      const result = await factorySuite
        .connect(admin)
        .callStatic.deployBondSuite(mockAtsFactory.address, validBondKpiData, treasuryDataWithManyTokens);

      expect(result.bondAddress).to.not.equal(ethers.constants.AddressZero);
      expect(result.treasuryAddress).to.not.equal(ethers.constants.AddressZero);
    });

    it("GIVEN treasury data with multiple RBAC entries WHEN deploying bond suite THEN success", async () => {
      const { factorySuite, mockAtsFactory, admin, user, blr, paymentToken, environmentalAssetToken1, testData } =
        await loadFixture(setupFixture);
      const { validBondKpiData } = testData;

      const treasuryDataWithMultipleRbacs = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: TREASURY_CONFIG_VERSION,
        },
        rbacs: [
          {
            role: hashRole(TEST_ROLE_1),
            members: [admin.address],
          },
          {
            role: hashRole(TEST_ROLE_2),
            members: [user.address],
          },
        ],
        paymentToken: paymentToken.address,
        environmentalAssets: [environmentalAssetToken1.address],
      };

      const result = await factorySuite
        .connect(admin)
        .callStatic.deployBondSuite(mockAtsFactory.address, validBondKpiData, treasuryDataWithMultipleRbacs);

      expect(result.bondAddress).to.not.equal(ethers.constants.AddressZero);
      expect(result.treasuryAddress).to.not.equal(ethers.constants.AddressZero);
    });
  });

  describe("deployBondSuite - Treasury Initialization", () => {
    it("GIVEN valid bond suite parameters WHEN deploying bond suite THEN Treasury lifecycle is initialized with bond address", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const { bondAddress, treasury } = await deployBondSuiteAndExtractContracts(
        factorySuite,
        admin,
        mockAtsFactory.address,
        validBondKpiData,
        validTreasuryData,
      );

      // Verify lifecycle was initialized
      expect(await treasury.lifeCycleCashFlowInitialized()).to.equal(true);
      expect(await treasury.bondAddress()).to.equal(bondAddress);
    });

    it("GIVEN valid bond suite parameters WHEN deploying bond suite THEN Treasury portfolio is initialized with payment token", async () => {
      const { factorySuite, mockAtsFactory, admin, paymentToken, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const { treasury } = await deployBondSuiteAndExtractContracts(
        factorySuite,
        admin,
        mockAtsFactory.address,
        validBondKpiData,
        validTreasuryData,
      );

      // Verify portfolio was initialized
      expect(await treasury.portfolioInitialized()).to.equal(true);
      expect(await treasury.paymentToken()).to.equal(paymentToken.address);
    });

    it("GIVEN valid bond suite parameters with environmental assets WHEN deploying bond suite THEN Treasury portfolio is initialized with assets", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const { treasury } = await deployBondSuiteAndExtractContracts(
        factorySuite,
        admin,
        mockAtsFactory.address,
        validBondKpiData,
        validTreasuryData,
      );

      // Verify environmental assets were set
      expect(await treasury.getEnvironmentalAssetsCount()).to.equal(1);
    });

    it("GIVEN valid bond suite parameters with empty environmental assets WHEN deploying bond suite THEN Treasury portfolio is initialized with no assets", async () => {
      const { factorySuite, mockAtsFactory, admin, blr, paymentToken, testData } = await loadFixture(setupFixture);
      const { validBondKpiData } = testData;

      const treasuryDataWithEmptyArray = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: TREASURY_CONFIG_VERSION,
        },
        rbacs: createDefaultAdminRbac(admin.address),
        paymentToken: paymentToken.address,
        environmentalAssets: [],
      };

      const { treasury } = await deployBondSuiteAndExtractContracts(
        factorySuite,
        admin,
        mockAtsFactory.address,
        validBondKpiData,
        treasuryDataWithEmptyArray,
      );

      // Verify portfolio was initialized with no environmental assets
      expect(await treasury.portfolioInitialized()).to.equal(true);
      expect(await treasury.getEnvironmentalAssetsCount()).to.equal(0);
    });

    it("GIVEN valid bond suite parameters with multiple environmental assets WHEN deploying bond suite THEN Treasury portfolio is initialized with all assets", async () => {
      const {
        factorySuite,
        mockAtsFactory,
        admin,
        blr,
        paymentToken,
        environmentalAssetToken1,
        environmentalAssetToken2,
        testData,
      } = await loadFixture(setupFixture);
      const { validBondKpiData } = testData;

      const treasuryDataWithMultipleAssets = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: TREASURY_CONFIG_VERSION,
        },
        rbacs: createDefaultAdminRbac(admin.address),
        paymentToken: paymentToken.address,
        environmentalAssets: [environmentalAssetToken1.address, environmentalAssetToken2.address],
      };

      const { treasury } = await deployBondSuiteAndExtractContracts(
        factorySuite,
        admin,
        mockAtsFactory.address,
        validBondKpiData,
        treasuryDataWithMultipleAssets,
      );

      // Verify portfolio was initialized with all environmental assets
      expect(await treasury.portfolioInitialized()).to.equal(true);
      expect(await treasury.getEnvironmentalAssetsCount()).to.equal(2);
    });
  });

  describe("deployBondSuite - RBAC Configuration", () => {
    it("GIVEN valid bond suite WHEN deployed THEN Treasury has MATURITY_REDEEMER_ROLE on Bond", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const { bondAddress, treasury } = await deployBondSuiteAndExtractContracts(
        factorySuite,
        admin,
        mockAtsFactory.address,
        validBondKpiData,
        validTreasuryData,
      );

      const bond = MockBond__factory.connect(bondAddress, admin);

      expect(await bond.hasRole(ATS_ROLES._MATURITY_REDEEMER_ROLE, treasury.address)).to.equal(true);
    });

    it("GIVEN valid bond suite WHEN deployed THEN FactorySuite has renounced DEFAULT_ADMIN_ROLE", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const { bondAddress } = await deployBondSuiteAndExtractContracts(
        factorySuite,
        admin,
        mockAtsFactory.address,
        validBondKpiData,
        validTreasuryData,
      );

      const bond = MockBond__factory.connect(bondAddress, admin);

      expect(await bond.hasRole(ATS_ROLES._DEFAULT_ADMIN_ROLE, factorySuite.address)).to.equal(false);
    });

    it("GIVEN bondData with admin WHEN deployed THEN original admin retains DEFAULT_ADMIN_ROLE", async () => {
      const { factorySuite, mockAtsFactory, admin, user, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      // Create bondKpiData WITH an explicit admin in RBAC
      const bondKpiDataWithAdmin = {
        ...validBondKpiData,
        bondData: {
          ...validBondKpiData.bondData,
          security: {
            ...validBondKpiData.bondData.security,
            rbacs: createDefaultAdminRbac(user.address), // user is the original admin
          },
        },
      };

      const { bondAddress } = await deployBondSuiteAndExtractContracts(
        factorySuite,
        admin,
        mockAtsFactory.address,
        bondKpiDataWithAdmin,
        validTreasuryData,
      );

      const bond = MockBond__factory.connect(bondAddress, admin);
      // Verify original admin (user) specified in bondData still has admin role
      expect(await bond.hasRole(ATS_ROLES._DEFAULT_ADMIN_ROLE, user.address)).to.equal(true);
    });

    it("GIVEN bondData with non-admin RBAC roles WHEN deployed THEN non-admin roles are preserved", async () => {
      const { factorySuite, mockAtsFactory, admin, user, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      // Create bondKpiData with a non-admin RBAC role
      const CUSTOM_ROLE = hashRole("CUSTOM_ROLE");
      const bondKpiDataWithCustomRole = {
        ...validBondKpiData,
        bondData: {
          ...validBondKpiData.bondData,
          security: {
            ...validBondKpiData.bondData.security,
            rbacs: [
              {
                role: CUSTOM_ROLE,
                members: [user.address],
              },
            ],
          },
        },
      };

      const { bondAddress } = await deployBondSuiteAndExtractContracts(
        factorySuite,
        admin,
        mockAtsFactory.address,
        bondKpiDataWithCustomRole,
        validTreasuryData,
      );

      const bond = MockBond__factory.connect(bondAddress, admin);
      // Verify custom role was preserved
      expect(await bond.hasRole(CUSTOM_ROLE, user.address)).to.equal(true);
    });

    it("GIVEN bondData with admin RBAC with empty members array WHEN deployed THEN FactorySuite is added as admin", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      // Create bondKpiData with DEFAULT_ADMIN_ROLE but empty members array
      const bondKpiDataWithEmptyAdminMembers = {
        ...validBondKpiData,
        bondData: {
          ...validBondKpiData.bondData,
          security: {
            ...validBondKpiData.bondData.security,
            rbacs: [
              {
                role: ethers.constants.HashZero, // DEFAULT_ADMIN_ROLE
                members: [], // Empty array
              },
            ],
          },
        },
      };

      const { bondAddress } = await deployBondSuiteAndExtractContracts(
        factorySuite,
        admin,
        mockAtsFactory.address,
        bondKpiDataWithEmptyAdminMembers,
        validTreasuryData,
      );

      const bond = MockBond__factory.connect(bondAddress, admin);
      // FactorySuite should have been temporarily added as admin (but then revoked at the end)
      expect(await bond.hasRole(ATS_ROLES._DEFAULT_ADMIN_ROLE, factorySuite.address)).to.equal(false);
    });

    it("GIVEN bondData with mixed RBAC roles (admin and non-admin) WHEN deployed THEN all roles are preserved correctly", async () => {
      const { factorySuite, mockAtsFactory, admin, user, deployer, testData } = await loadFixture(setupFixture);
      const { validBondKpiData, validTreasuryData } = testData;

      const CUSTOM_ROLE = hashRole("CUSTOM_ROLE");
      const bondKpiDataWithMixedRoles = {
        ...validBondKpiData,
        bondData: {
          ...validBondKpiData.bondData,
          security: {
            ...validBondKpiData.bondData.security,
            rbacs: [
              {
                role: ethers.constants.HashZero, // DEFAULT_ADMIN_ROLE
                members: [admin.address],
              },
              {
                role: CUSTOM_ROLE,
                members: [user.address, deployer.address],
              },
            ],
          },
        },
      };

      const { bondAddress } = await deployBondSuiteAndExtractContracts(
        factorySuite,
        admin,
        mockAtsFactory.address,
        bondKpiDataWithMixedRoles,
        validTreasuryData,
      );

      const bond = MockBond__factory.connect(bondAddress, admin);
      // Verify admin role
      expect(await bond.hasRole(ATS_ROLES._DEFAULT_ADMIN_ROLE, admin.address)).to.equal(true);
      // Verify custom roles
      expect(await bond.hasRole(CUSTOM_ROLE, user.address)).to.equal(true);
      expect(await bond.hasRole(CUSTOM_ROLE, deployer.address)).to.equal(true);
    });
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {
  createTestDataSets,
  MOCK_ERC721_CONTRACT_NAME,
  TREASURY_CONFIG_VERSION,
  MAX_GAS_FOR_TREASURY_KPI_DEPLOYMENT,
  hashRole,
  TEST_ROLE_1,
  TEST_ROLE_2,
  TEST_KPI_ROLE_1,
  TEST_KPI_ROLE_2,
} from "@test";
import { deployFactorySuiteWithMocksForBusinessLogic } from "@test/fixtures";
import { TREASURY_CONFIG_ID, PAUSER_ROLE } from "@scripts";

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
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      const tx = await factorySuite
        .connect(admin)
        .deployBondSuite(
          mockAtsFactory.address,
          validBondData,
          validFactoryRegulationData,
          validTreasuryData,
          validKpiData,
        );

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
    });

    it("GIVEN valid bond suite parameters WHEN deploying bond suite THEN success with BondSuiteDeployed event", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      )
        .to.emit(factorySuite, "BondSuiteDeployed")
        .withArgs(
          admin.address,
          anyValue, // Bond address (dynamic)
          anyValue, // Treasury address (dynamic)
          anyValue, // KPI address (dynamic)
          anyValue, // BondData struct (complex struct, just verify it's emitted)
          anyValue, // FactoryRegulationData struct
          anyValue, // TreasuryData struct
          anyValue, // KpiData struct
        );
    });

    it("GIVEN valid bond suite parameters WHEN deploying bond suite THEN success with valid contract addresses", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      const result = await factorySuite
        .connect(admin)
        .callStatic.deployBondSuite(
          mockAtsFactory.address,
          validBondData,
          validFactoryRegulationData,
          validTreasuryData,
          validKpiData,
        );

      expect(result.bondAddress).to.not.equal(ethers.constants.AddressZero);
      expect(result.treasuryAddress).to.not.equal(ethers.constants.AddressZero);
      expect(result.kpiAddress).to.not.equal(ethers.constants.AddressZero);
    });

    it("GIVEN valid bond suite parameters WHEN deploying bond suite THEN success with MockBondDeployed event from ATS factory", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      ).to.emit(mockAtsFactory, "MockBondDeployed");
    });
  });

  describe("deployBondSuite - Access Control", () => {
    it("GIVEN caller without DEPLOYER role WHEN deploying bond suite THEN fail with AccountHasNoRole", async () => {
      const { factorySuite, mockAtsFactory, unauthorized, accessControl, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      await expect(
        factorySuite
          .connect(unauthorized)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(accessControl, "AccountHasNoRole");
    });

    it("GIVEN contract is paused WHEN deploying bond suite THEN fail with TokenIsPaused", async () => {
      const { factorySuite, mockAtsFactory, admin, deployer, pause, accessControl, testData } =
        await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      // Grant PAUSER_ROLE to deployer to be able to pause
      await accessControl.connect(deployer).grantRole(PAUSER_ROLE, deployer.address);

      // Pause the contract via PauseFacet
      await pause.connect(deployer).pause();

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(pause, "TokenIsPaused");
    });
  });

  describe("deployBondSuite - Input Validation", () => {
    it("GIVEN zero bond factory address WHEN deploying bond suite THEN fail with InvalidContractAddress", async () => {
      const { factorySuite, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(
            ethers.constants.AddressZero,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidContractAddress");
    });

    it("GIVEN treasury data with zero resolver WHEN deploying bond suite THEN fail with InvalidTreasuryData", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validKpiData, invalidTreasuryData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            invalidTreasuryData.zeroResolver,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidTreasuryData");
    });

    it("GIVEN treasury data with zero payment token WHEN deploying bond suite THEN fail with InvalidTreasuryData", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validKpiData, invalidTreasuryData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            invalidTreasuryData.zeroPaymentToken,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidTreasuryData");
    });

    it("GIVEN KPI data with zero admin address WHEN deploying bond suite THEN fail with InvalidKpiData", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, invalidKpiData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            invalidKpiData,
          ),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidKpiData");
    });

    it("GIVEN treasury data with empty environmental assets array WHEN deploying bond suite THEN success", async () => {
      const { factorySuite, mockAtsFactory, admin, blr, paymentToken, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validKpiData } = testData;

      const treasuryDataWithEmptyArray = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: TREASURY_CONFIG_VERSION,
        },
        rbacs: [],
        paymentToken: paymentToken.address,
        environmentalAssets: [], // Empty array should be allowed
      };

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            treasuryDataWithEmptyArray,
            validKpiData,
          ),
      ).to.not.be.reverted;
    });

    it("GIVEN treasury data with zero address in environmental assets array WHEN deploying bond suite THEN fail with InvalidTreasuryData", async () => {
      const { factorySuite, mockAtsFactory, admin, blr, paymentToken, environmentalAssetToken1, testData } =
        await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validKpiData } = testData;

      const treasuryDataWithZeroEnvironmentalAsset = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: TREASURY_CONFIG_VERSION,
        },
        rbacs: [],
        paymentToken: paymentToken.address,
        environmentalAssets: [environmentalAssetToken1.address, ethers.constants.AddressZero], // Contains zero address
      };

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            treasuryDataWithZeroEnvironmentalAsset,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidTreasuryData");
    });
  });

  describe("deployBondSuite - Error Handling", () => {
    it("GIVEN bond factory configured to revert WHEN deploying bond suite THEN fail with BondDeploymentFailed", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      // Configure mock to revert
      await mockAtsFactory.setShouldRevert(true);

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(factorySuite, "BondDeploymentFailed");
    });
  });

  describe("Gas Optimization", () => {
    it("GIVEN valid bond suite parameters WHEN deploying bond suite THEN success with reasonable gas cost", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      const tx = await factorySuite
        .connect(admin)
        .deployBondSuite(
          mockAtsFactory.address,
          validBondData,
          validFactoryRegulationData,
          validTreasuryData,
          validKpiData,
        );

      const receipt = await tx.wait();
      // Treasury and KPI deployment are expensive, so we allow up to 10M gas
      expect(receipt.gasUsed.lt(ethers.BigNumber.from(MAX_GAS_FOR_TREASURY_KPI_DEPLOYMENT))).to.be.true;
    });
  });

  describe("Edge Cases", () => {
    it("GIVEN treasury data with maximum length environmental assets arrays WHEN deploying bond suite THEN success", async () => {
      const { factorySuite, mockAtsFactory, admin, blr, paymentToken, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validKpiData } = testData;

      // Create array with multiple environmental asset tokens
      const environmentalAssetAddresses = [];
      for (let i = 0; i < 5; i++) {
        const MockERC721 = await ethers.getContractFactory(MOCK_ERC721_CONTRACT_NAME);
        const token = await MockERC721.deploy(`Token${i}`, `T${i}`);
        await token.deployed();
        environmentalAssetAddresses.push(token.address);
      }

      const treasuryDataWithManyTokens = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: TREASURY_CONFIG_VERSION,
        },
        rbacs: [],
        paymentToken: paymentToken.address,
        environmentalAssets: environmentalAssetAddresses,
      };

      const result = await factorySuite
        .connect(admin)
        .callStatic.deployBondSuite(
          mockAtsFactory.address,
          validBondData,
          validFactoryRegulationData,
          treasuryDataWithManyTokens,
          validKpiData,
        );

      expect(result.bondAddress).to.not.equal(ethers.constants.AddressZero);
      expect(result.treasuryAddress).to.not.equal(ethers.constants.AddressZero);
      expect(result.kpiAddress).to.not.equal(ethers.constants.AddressZero);
    });

    it("GIVEN treasury and KPI data with multiple RBAC entries WHEN deploying bond suite THEN success", async () => {
      const { factorySuite, mockAtsFactory, admin, user, blr, paymentToken, environmentalAssetToken1, testData } =
        await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData } = testData;

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

      const kpiDataWithMultipleRbacs = {
        admin: admin.address,
        rbacs: [
          {
            role: hashRole(TEST_KPI_ROLE_1),
            members: [admin.address],
          },
          {
            role: hashRole(TEST_KPI_ROLE_2),
            members: [user.address],
          },
        ],
      };

      const result = await factorySuite
        .connect(admin)
        .callStatic.deployBondSuite(
          mockAtsFactory.address,
          validBondData,
          validFactoryRegulationData,
          treasuryDataWithMultipleRbacs,
          kpiDataWithMultipleRbacs,
        );

      expect(result.bondAddress).to.not.equal(ethers.constants.AddressZero);
      expect(result.treasuryAddress).to.not.equal(ethers.constants.AddressZero);
      expect(result.kpiAddress).to.not.equal(ethers.constants.AddressZero);
    });
  });
});

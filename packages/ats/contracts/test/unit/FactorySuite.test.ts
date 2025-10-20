import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { deployFactorySuiteWithMocksForBusinessLogic } from "@test/fixtures";
import { createTestDataSets } from "@test/helpers/testDataSets";
import { TREASURY_CONFIG_ID } from "@scripts/domain";

describe("FactorySuite - Business Logic Tests", () => {
  async function setupFixture() {
    const fixture = await deployFactorySuiteWithMocksForBusinessLogic();
    const testData = createTestDataSets({
      mockResolver: { address: fixture.blr.address }, // Use real BLR for Treasury/KPI
      paymentToken: fixture.paymentToken,
      erc721Token1: fixture.erc721Token1,
      erc721Token2: fixture.erc721Token2,
      admin: fixture.admin,
      user: fixture.user,
      treasuryConfigId: fixture.treasuryConfigId,
      treasuryVersion: fixture.treasuryVersion,
    });
    return { ...fixture, testData };
  }

  describe("deployBondSuite - Happy Path", () => {
    it("should deploy bond suite successfully with valid parameters", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      const tx = await factorySuite
        .connect(admin)
        .deployBondSuite(mockAtsFactory.address, validBondData, validFactoryRegulationData, validTreasuryData, validKpiData);

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
    });

    it("should emit BondSuiteDeployed event with correct parameters", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(mockAtsFactory.address, validBondData, validFactoryRegulationData, validTreasuryData, validKpiData),
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

    it("should return valid contract addresses", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      const result = await factorySuite
        .connect(admin)
        .callStatic.deployBondSuite(mockAtsFactory.address, validBondData, validFactoryRegulationData, validTreasuryData, validKpiData);

      expect(result.bondAddress).to.not.equal(ethers.constants.AddressZero);
      expect(result.treasuryAddress).to.not.equal(ethers.constants.AddressZero);
      expect(result.KpiAddress).to.not.equal(ethers.constants.AddressZero);
    });

    it("should call ATS factory deployBond method", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(mockAtsFactory.address, validBondData, validFactoryRegulationData, validTreasuryData, validKpiData),
      ).to.emit(mockAtsFactory, "MockBondDeployed");
    });
  });

  describe("deployBondSuite - Access Control", () => {
    it("should revert when caller does not have DEPLOYER role", async () => {
      const { factorySuite, mockAtsFactory, unauthorized, accessControl, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      await expect(
        factorySuite
          .connect(unauthorized)
          .deployBondSuite(mockAtsFactory.address, validBondData, validFactoryRegulationData, validTreasuryData, validKpiData),
      ).to.be.revertedWithCustomError(accessControl, "AccountHasNoRole");
    });

    it("should revert when contract is paused", async () => {
      const { factorySuite, mockAtsFactory, admin, deployer, pause, accessControl, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      // Grant PAUSER_ROLE to deployer to be able to pause
      const PAUSER_ROLE = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb";
      await accessControl.connect(deployer).grantRole(PAUSER_ROLE, deployer.address);

      // Pause the contract via PauseFacet
      await pause.connect(deployer).pause();

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(mockAtsFactory.address, validBondData, validFactoryRegulationData, validTreasuryData, validKpiData),
      ).to.be.revertedWithCustomError(pause, "TokenIsPaused");
    });
  });

  describe("deployBondSuite - Input Validation", () => {
    it("should revert with InvalidContractAddress for zero bond factory address", async () => {
      const { factorySuite, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(ethers.constants.AddressZero, validBondData, validFactoryRegulationData, validTreasuryData, validKpiData),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidContractAddress");
    });

    it("should revert with InvalidTreasuryData for zero resolver", async () => {
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

    it("should revert with InvalidTreasuryData for zero payment token", async () => {
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

    it("should revert with InvalidKpiData for zero admin address", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, invalidKpiData } = testData;

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(mockAtsFactory.address, validBondData, validFactoryRegulationData, validTreasuryData, invalidKpiData),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidKpiData");
    });

    it("should allow empty ERC721 array in treasury data", async () => {
      const { factorySuite, mockAtsFactory, admin, blr, paymentToken, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validKpiData } = testData;

      const treasuryDataWithEmptyArray = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: 1,
        },
        rbacs: [],
        paymentToken: paymentToken.address,
        erc721s: [], // Empty array should be allowed
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

    it("should revert with InvalidTreasuryData for zero address in ERC721 array", async () => {
      const { factorySuite, mockAtsFactory, admin, blr, paymentToken, erc721Token1, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validKpiData } = testData;

      const treasuryDataWithZeroERC721 = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: 1,
        },
        rbacs: [],
        paymentToken: paymentToken.address,
        erc721s: [erc721Token1.address, ethers.constants.AddressZero], // Contains zero address
      };

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            treasuryDataWithZeroERC721,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(factorySuite, "InvalidTreasuryData");
    });
  });

  describe("deployBondSuite - Error Handling", () => {
    it("should revert with BondDeploymentFailed when bond factory deployment fails", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      // Configure mock to revert
      await mockAtsFactory.setShouldRevert(true);

      await expect(
        factorySuite
          .connect(admin)
          .deployBondSuite(mockAtsFactory.address, validBondData, validFactoryRegulationData, validTreasuryData, validKpiData),
      ).to.be.revertedWithCustomError(factorySuite, "BondDeploymentFailed");
    });
  });

  describe("Gas Optimization", () => {
    it("should deploy with reasonable gas cost", async () => {
      const { factorySuite, mockAtsFactory, admin, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validTreasuryData, validKpiData } = testData;

      const tx = await factorySuite
        .connect(admin)
        .deployBondSuite(mockAtsFactory.address, validBondData, validFactoryRegulationData, validTreasuryData, validKpiData);

      const receipt = await tx.wait();
      // Treasury and KPI deployment are expensive, so we allow up to 10M gas
      expect(receipt.gasUsed.lt(ethers.BigNumber.from("10000000"))).to.be.true;
    });
  });

  describe("Edge Cases", () => {
    it("should handle maximum length ERC721 arrays", async () => {
      const { factorySuite, mockAtsFactory, admin, blr, paymentToken, testData } = await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData, validKpiData } = testData;

      // Create array with multiple ERC721 tokens
      const erc721Addresses = [];
      for (let i = 0; i < 5; i++) {
        const MockERC721 = await ethers.getContractFactory("MockERC721");
        const token = await MockERC721.deploy(`Token${i}`, `T${i}`);
        await token.deployed();
        erc721Addresses.push(token.address);
      }

      const treasuryDataWithManyTokens = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: 1,
        },
        rbacs: [],
        paymentToken: paymentToken.address,
        erc721s: erc721Addresses,
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

    it("should handle multiple RBAC entries", async () => {
      const { factorySuite, mockAtsFactory, admin, user, blr, paymentToken, erc721Token1, testData } =
        await loadFixture(setupFixture);
      const { validBondData, validFactoryRegulationData } = testData;

      const treasuryDataWithMultipleRbacs = {
        resolver: blr.address,
        resolverProxyConfiguration: {
          key: TREASURY_CONFIG_ID,
          version: 1,
        },
        rbacs: [
          {
            role: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ROLE_1")),
            members: [admin.address],
          },
          {
            role: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ROLE_2")),
            members: [user.address],
          },
        ],
        paymentToken: paymentToken.address,
        erc721s: [erc721Token1.address],
      };

      const kpiDataWithMultipleRbacs = {
        admin: admin.address,
        rbacs: [
          {
            role: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("KPI_ROLE_1")),
            members: [admin.address],
          },
          {
            role: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("KPI_ROLE_2")),
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

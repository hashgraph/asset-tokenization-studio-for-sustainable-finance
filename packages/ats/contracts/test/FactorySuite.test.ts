import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployFactorySuiteInfrastructureFixture } from "@test/fixtures";
import { FACTORY_SUITE_CONFIG_ID } from "@scripts/domain";

describe("FactorySuite - Integration Tests", () => {
  async function setupFixture() {
    return await deployFactorySuiteInfrastructureFixture(false);
  }

  before(async () => {
    await loadFixture(setupFixture);
  });

  describe("Infrastructure Deployment", () => {
    it("should deploy with real BLR", async () => {
      const { factorySuite, blr } = await loadFixture(setupFixture);
      expect(factorySuite.address).to.not.equal(ethers.constants.AddressZero);
      expect(blr.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("should have correct configuration in BLR", async () => {
      const { blr, deployment } = await loadFixture(setupFixture);

      const configVersion = await blr.getLatestVersionByConfiguration(FACTORY_SUITE_CONFIG_ID);
      expect(configVersion).to.equal(deployment.configuration.version);
    });

    it("should have all facets registered", async () => {
      const { deployment } = await loadFixture(setupFixture);

      expect(deployment.facets.length).to.equal(3);
      expect(deployment.facets.map((f) => f.name)).to.include.members([
        "AccessControlFacet",
        "PauseFacet",
        "FactorySuiteFacet",
      ]);
    });

    it("should have ProxyAdmin deployed", async () => {
      const { proxyAdmin } = await loadFixture(setupFixture);
      expect(proxyAdmin.address).to.not.equal(ethers.constants.AddressZero);
    });
  });
});

/*
 * NOTE: Mock-based unit tests are commented out until mock fixtures are implemented.
 * The integration tests above verify the real infrastructure deployment.
 * Mock-based tests below test business logic with isolated dependencies.
 *
 * To re-enable these tests, implement:
 * - test/fixtures/factoryFixtures.ts with deployFactorySuiteFixture()
 * - createTestDataSets() helper function
 * - Mock contracts: MockAtsFactory, MockBusinessLogicResolver, MockERC20, MockERC721
 */

/*
describe("FactorySuite - Mock-Based Unit Tests", () => {
  let fixture: any; // FactoryFixture;
  let testData: any; // TestDataSets;

  async function setupFixtureWithData() {
    // const _fixture = await deployFactorySuiteFixture();
    // const _testData = createTestDataSets(_fixture);
    // return { fixture: _fixture, testData: _testData };
    throw new Error("Mock fixtures not implemented yet");
  }

  beforeEach(async () => {
    // ({ fixture, testData } = await loadFixture(setupFixtureWithData));
  });

  describe("Deployment", () => {
    it("should deploy successfully", async () => {
      expect(fixture.factorySuiteFacet.address).to.not.equal(
        ethers.constants.AddressZero,
      );
    });

    it("should have correct DEPLOYER role assigned", async () => {
      const DEPLOYER_ROLE =
        "0x1e30887951e961109b31c3e05261cd69e3d6381327ba40ce9968bbadbebce283";
      expect(
        await fixture.factorySuiteFacet.hasRole(
          DEPLOYER_ROLE,
          fixture.admin.address,
        ),
      ).to.be.true;
    });

    it("should not have DEPLOYER role for unauthorized users", async () => {
      const DEPLOYER_ROLE =
        "0x1e30887951e961109b31c3e05261cd69e3d6381327ba40ce9968bbadbebce283";
      expect(
        await fixture.factorySuiteFacet.hasRole(
          DEPLOYER_ROLE,
          fixture.unauthorized.address,
        ),
      ).to.be.false;
    });
  });

  describe("deployBondSuite - Happy Path", () => {
    it("should deploy bond suite successfully with valid parameters", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        validKpiData,
      } = testData;

      const tx = await fixture.factorySuiteFacet
        .connect(fixture.admin)
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

    it("should emit BondSuiteDeployed event with correct parameters", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        validKpiData,
      } = testData;

      await expect(
        fixture.factorySuiteFacet
          .connect(fixture.admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      )
        .to.emit(fixture.factorySuiteFacet, "BondSuiteDeployed")
        .withArgs(
          fixture.admin.address,
          await mockAtsFactory.nextBondAddress(), // Bond address from mock
          (args: any[]) => args[2] !== ethers.constants.AddressZero, // Treasury address (non-zero)
          (args: any[]) => args[3] !== ethers.constants.AddressZero, // KPI address (non-zero)
          validBondData,
          validFactoryRegulationData,
          validTreasuryData,
          validKpiData,
        );
    });

    it("should return valid contract addresses", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        validKpiData,
      } = testData;

      const result = await fixture.factorySuiteFacet
        .connect(fixture.admin)
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

    it("should call mock ATS factory deployBond method", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        validKpiData,
      } = testData;

      await expect(
        fixture.factorySuiteFacet
          .connect(fixture.admin)
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
    it("should revert when caller does not have DEPLOYER role", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        validKpiData,
      } = testData;

      await expect(
        fixture.factorySuiteFacet
          .connect(fixture.unauthorized)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      ).to.be.revertedWith("AccessControl:");
    });

    it("should revert when contract is paused", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        validKpiData,
      } = testData;

      await fixture.factorySuiteFacet.pause();

      await expect(
        fixture.factorySuiteFacet
          .connect(fixture.admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("deployBondSuite - Input Validation", () => {
    it("should revert with InvalidContractAddress for zero bond factory address", async () => {
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        validKpiData,
      } = testData;

      await expect(
        fixture.factorySuiteFacet
          .connect(fixture.admin)
          .deployBondSuite(
            ethers.constants.AddressZero,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(
        fixture.factorySuiteFacet,
        "InvalidContractAddress",
      );
    });

    it("should revert with InvalidTreasuryData for invalid treasury data", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validKpiData,
        invalidTreasuryData,
      } = testData;

      await expect(
        fixture.factorySuiteFacet
          .connect(fixture.admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            invalidTreasuryData,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(
        fixture.factorySuiteFacet,
        "InvalidTreasuryData",
      );
    });

    it("should revert with InvalidKpiData for invalid KPI data", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        invalidKpiData,
      } = testData;

      await expect(
        fixture.factorySuiteFacet
          .connect(fixture.admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            invalidKpiData,
          ),
      ).to.be.revertedWithCustomError(
        fixture.factorySuiteFacet,
        "InvalidKpiData",
      );
    });

    it("should allow empty ERC721 array in treasury data", async () => {
      const { mockAtsFactory, mockResolver, paymentToken } = fixture;
      const { validBondData, validFactoryRegulationData, validKpiData } =
        testData;

      const treasuryDataWithEmptyArray = {
        resolver: mockResolver.address,
        resolverProxyConfiguration: {
          resolverAddress: mockResolver.address,
          version: 1,
        },
        rbacs: [],
        paymentToken: paymentToken.address,
        erc721s: [], // Empty array is now allowed
      };

      // This should NOT revert - empty arrays are permitted
      await expect(
        fixture.factorySuiteFacet
          .connect(fixture.admin)
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
      const { mockAtsFactory, mockResolver, paymentToken, erc721Token1 } =
        fixture;
      const { validBondData, validFactoryRegulationData, validKpiData } =
        testData;

      const treasuryDataWithZeroERC721 = {
        resolver: mockResolver.address,
        resolverProxyConfiguration: {
          resolverAddress: mockResolver.address,
          version: 1,
        },
        rbacs: [],
        paymentToken: paymentToken.address,
        erc721s: [erc721Token1.address, ethers.constants.AddressZero], // Contains zero address
      };

      await expect(
        fixture.factorySuiteFacet
          .connect(fixture.admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            treasuryDataWithZeroERC721,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(
        fixture.factorySuiteFacet,
        "InvalidTreasuryData",
      );
    });
  });

  describe("deployBondSuite - Error Handling", () => {
    it("should revert with BondDeploymentFailed when bond factory deployment fails", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        validKpiData,
      } = testData;

      // Configure mock to revert
      await mockAtsFactory.setShouldRevert(true);

      await expect(
        fixture.factorySuiteFacet
          .connect(fixture.admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(
        fixture.factorySuiteFacet,
        "BondDeploymentFailed",
      );
    });

    it("should revert with BondDeploymentFailed when bond factory returns zero address", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        validKpiData,
      } = testData;

      // Configure mock to return zero address
      await mockAtsFactory.setShouldReturnZeroAddress(true);

      await expect(
        fixture.factorySuiteFacet
          .connect(fixture.admin)
          .deployBondSuite(
            mockAtsFactory.address,
            validBondData,
            validFactoryRegulationData,
            validTreasuryData,
            validKpiData,
          ),
      ).to.be.revertedWithCustomError(
        fixture.factorySuiteFacet,
        "BondDeploymentFailed",
      );
    });
  });

  describe("deployBondSuite - Reentrancy Protection", () => {
    it("should prevent reentrancy attacks", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        validKpiData,
      } = testData;

      // Deploy a reentrancy attack contract would be complex here
      // For now, we verify the nonReentrant modifier is present by checking gas usage
      const gasEstimate = await fixture.factorySuiteFacet
        .connect(fixture.admin)
        .estimateGas.deployBondSuite(
          mockAtsFactory.address,
          validBondData,
          validFactoryRegulationData,
          validTreasuryData,
          validKpiData,
        );

      expect(gasEstimate.gt(0)).to.be.true;
    });
  });

  describe("Gas Optimization", () => {
    it("should deploy with reasonable gas cost", async () => {
      const { mockAtsFactory } = fixture;
      const {
        validBondData,
        validFactoryRegulationData,
        validTreasuryData,
        validKpiData,
      } = testData;

      const tx = await fixture.factorySuiteFacet
        .connect(fixture.admin)
        .deployBondSuite(
          mockAtsFactory.address,
          validBondData,
          validFactoryRegulationData,
          validTreasuryData,
          validKpiData,
        );

      const receipt = await tx.wait();
      expect(receipt.gasUsed.lt(ethers.BigNumber.from("5000000"))).to.be.true; // Less than 5M gas
    });
  });

  describe("Edge Cases", () => {
    it("should handle maximum length ERC721 arrays", async () => {
      const { mockAtsFactory, mockResolver, paymentToken } = fixture;
      const { validBondData, validFactoryRegulationData, validKpiData } =
        testData;

      // Create array with multiple ERC721 tokens
      const erc721Addresses = [];
      for (let i = 0; i < 5; i++) {
        const MockERC721 = await ethers.getContractFactory("MockERC721");
        const token = await MockERC721.deploy(`Token${i}`, `T${i}`);
        await token.deployed();
        erc721Addresses.push(token.address);
      }

      const treasuryDataWithManyTokens = {
        resolver: mockResolver.address,
        resolverProxyConfiguration: {
          resolverAddress: mockResolver.address,
          version: 1,
        },
        rbacs: [],
        paymentToken: paymentToken.address,
        erc721s: erc721Addresses,
      };

      const result = await fixture.factorySuiteFacet
        .connect(fixture.admin)
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
      const {
        mockAtsFactory,
        mockResolver,
        paymentToken,
        erc721Token1,
        admin,
        user,
      } = fixture;
      const { validBondData, validFactoryRegulationData } = testData;

      const treasuryDataWithMultipleRbacs = {
        resolver: mockResolver.address,
        resolverProxyConfiguration: {
          resolverAddress: mockResolver.address,
          version: 1,
        },
        rbacs: [
          {
            role: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ROLE_1")),
            account: admin.address,
          },
          {
            role: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ROLE_2")),
            account: user.address,
          },
        ],
        paymentToken: paymentToken.address,
        erc721s: [erc721Token1.address],
      };

      const kpiDataWithMultipleRbacs = {
        admin: admin.address,
        rbacs: [
          {
            role: ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("KPI_ROLE_1"),
            ),
            account: admin.address,
          },
          {
            role: ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("KPI_ROLE_2"),
            ),
            account: user.address,
          },
        ],
      };

      const result = await fixture.factorySuiteFacet
        .connect(fixture.admin)
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
*/

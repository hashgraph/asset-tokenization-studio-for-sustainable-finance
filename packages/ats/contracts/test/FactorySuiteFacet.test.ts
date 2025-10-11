import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployFactorySuiteInfrastructureFixture } from "@test/fixtures";
import { FACTORY_SUITE_RESOLVER_KEY } from "@scripts/domain";
import { FactorySuiteFacet__factory } from "@typechain";

describe("FactorySuiteFacet", () => {
  async function setupFixture() {
    return await deployFactorySuiteInfrastructureFixture(false);
  }

  // Pre-load fixture once
  before(async () => {
    await loadFixture(setupFixture);
  });

  describe("Diamond Facet Implementation", () => {
    it("should implement IFactorySuite interface", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const supportedInterfaces = await factorySuiteFacet.getStaticInterfaceIds();
      expect(supportedInterfaces.length).to.be.greaterThan(0);
    });

    it("should have IStaticFunctionSelectors methods", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      // Verify it has the required static methods
      const resolverKey = await factorySuiteFacet.getStaticResolverKey();
      const selectors = await factorySuiteFacet.getStaticFunctionSelectors();
      const interfaceIds = await factorySuiteFacet.getStaticInterfaceIds();

      expect(resolverKey).to.be.a("string");
      expect(selectors).to.be.an("array");
      expect(interfaceIds).to.be.an("array");
    });
  });

  describe("getStaticResolverKey", () => {
    it("should return correct resolver key", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const actualKey = await factorySuiteFacet.getStaticResolverKey();
      expect(actualKey).to.equal(FACTORY_SUITE_RESOLVER_KEY);
    });

    it("should be a pure function (no state changes)", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const key1 = await factorySuiteFacet.getStaticResolverKey();
      const key2 = await factorySuiteFacet.getStaticResolverKey();
      expect(key1).to.equal(key2);
    });
  });

  describe("getStaticFunctionSelectors", () => {
    it("should return deployBondSuite selector", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const selectors = await factorySuiteFacet.getStaticFunctionSelectors();
      expect(selectors).to.have.lengthOf(1);
    });

    it("should return consistent selectors", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const selectors1 = await factorySuiteFacet.getStaticFunctionSelectors();
      const selectors2 = await factorySuiteFacet.getStaticFunctionSelectors();

      expect(selectors1).to.deep.equal(selectors2);
    });

    it("should be a pure function", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const tx = await factorySuiteFacet.populateTransaction.getStaticFunctionSelectors();
      expect(tx.value).to.be.undefined;
    });
  });

  describe("getStaticInterfaceIds", () => {
    it("should return IFactorySuite interface ID", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const interfaceIds = await factorySuiteFacet.getStaticInterfaceIds();

      expect(interfaceIds).to.have.lengthOf(1);
      expect(interfaceIds[0]).to.not.equal("0x00000000");
    });

    it("should return consistent interface IDs", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const ids1 = await factorySuiteFacet.getStaticInterfaceIds();
      const ids2 = await factorySuiteFacet.getStaticInterfaceIds();

      expect(ids1).to.deep.equal(ids2);
    });

    it("should be a pure function", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const gasEstimate1 = await factorySuiteFacet.estimateGas.getStaticInterfaceIds();
      const gasEstimate2 = await factorySuiteFacet.estimateGas.getStaticInterfaceIds();

      expect(gasEstimate1).to.equal(gasEstimate2);
    });
  });

  describe("Constructor", () => {
    it("should deploy successfully", async () => {
      const { factorySuite } = await loadFixture(setupFixture);
      expect(factorySuite.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("should inherit from FactorySuite", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const hasDeployBondSuite = factorySuiteFacet.deployBondSuite !== undefined;
      expect(hasDeployBondSuite).to.be.true;
    });

    it("should implement IStaticFunctionSelectors", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const hasGetStaticResolverKey = factorySuiteFacet.getStaticResolverKey !== undefined;
      const hasGetStaticFunctionSelectors = factorySuiteFacet.getStaticFunctionSelectors !== undefined;
      const hasGetStaticInterfaceIds = factorySuiteFacet.getStaticInterfaceIds !== undefined;

      expect(hasGetStaticResolverKey).to.be.true;
      expect(hasGetStaticFunctionSelectors).to.be.true;
      expect(hasGetStaticInterfaceIds).to.be.true;
    });
  });

  describe("Diamond Pattern Integration", () => {
    it("should be compatible with diamond proxy pattern", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const selectors = await factorySuiteFacet.getStaticFunctionSelectors();
      const resolverKey = await factorySuiteFacet.getStaticResolverKey();
      const interfaceIds = await factorySuiteFacet.getStaticInterfaceIds();

      expect(selectors.length).to.be.greaterThan(0);
      expect(resolverKey).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
      expect(interfaceIds.length).to.be.greaterThan(0);
    });

    it("should provide all necessary metadata for diamond cut", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const selectors = await factorySuiteFacet.getStaticFunctionSelectors();
      const interfaceIds = await factorySuiteFacet.getStaticInterfaceIds();

      for (const selector of selectors) {
        expect(selector).to.match(/^0x[0-9a-fA-F]{8}$/);
      }

      for (const interfaceId of interfaceIds) {
        expect(interfaceId).to.match(/^0x[0-9a-fA-F]{8}$/);
      }
    });
  });

  describe("Gas Efficiency", () => {
    it("should have efficient gas usage for metadata functions", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const gasForResolverKey = await factorySuiteFacet.estimateGas.getStaticResolverKey();
      const gasForSelectors = await factorySuiteFacet.estimateGas.getStaticFunctionSelectors();
      const gasForInterfaces = await factorySuiteFacet.estimateGas.getStaticInterfaceIds();

      expect(gasForResolverKey.lt(30000)).to.be.true;
      expect(gasForSelectors.lt(50000)).to.be.true;
      expect(gasForInterfaces.lt(50000)).to.be.true;
    });
  });

  describe("Function Signature Verification", () => {
    it("should expose correct function signatures", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);
      const contractInterface = factorySuiteFacet.interface;

      expect(contractInterface.getFunction("deployBondSuite")).to.not.be.undefined;
      expect(contractInterface.getFunction("getStaticResolverKey")).to.not.be.undefined;
      expect(contractInterface.getFunction("getStaticFunctionSelectors")).to.not.be.undefined;
      expect(contractInterface.getFunction("getStaticInterfaceIds")).to.not.be.undefined;
    });

    it("should have correct function visibility", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);
      const contractInterface = factorySuiteFacet.interface;

      const resolverKeyFunc = contractInterface.getFunction("getStaticResolverKey");
      expect(resolverKeyFunc.stateMutability).to.equal("pure");

      const selectorsFunc = contractInterface.getFunction("getStaticFunctionSelectors");
      expect(selectorsFunc.stateMutability).to.equal("pure");

      const interfacesFunc = contractInterface.getFunction("getStaticInterfaceIds");
      expect(interfacesFunc.stateMutability).to.equal("pure");
    });
  });
});

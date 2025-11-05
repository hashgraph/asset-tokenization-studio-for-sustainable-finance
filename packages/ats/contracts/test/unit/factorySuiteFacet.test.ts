import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployFactorySuiteInfrastructureFixture } from "@test";
import { getFacetDefinition } from "@scripts/domain";
import { FactorySuiteFacet__factory } from "@contract-types";

describe("FactorySuiteFacet", () => {
  async function setupFixture() {
    return await deployFactorySuiteInfrastructureFixture(false);
  }

  // Pre-load fixture once
  before(async () => {
    await loadFixture(setupFixture);
  });

  describe("Diamond Facet Implementation", () => {
    it("GIVEN FactorySuiteFacet deployed WHEN querying static interface IDs THEN success", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      // Static functions are called on deployed facet address, not proxy
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const supportedInterfaces = await factorySuiteFacet.getStaticInterfaceIds();
      expect(supportedInterfaces.length).to.be.greaterThan(0);
    });

    it("GIVEN FactorySuiteFacet deployed WHEN calling static function selector methods THEN success", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      // Static functions are called on deployed facet address, not proxy
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

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
    it("GIVEN FactorySuiteFacet deployed WHEN calling getStaticResolverKey THEN success with correct key", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const actualKey = await factorySuiteFacet.getStaticResolverKey();
      const expectedKey = getFacetDefinition("FactorySuiteFacet")!.resolverKey!.value;
      expect(actualKey).to.equal(expectedKey);
    });

    it("GIVEN FactorySuiteFacet deployed WHEN calling getStaticResolverKey multiple times THEN success with consistent results", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const key1 = await factorySuiteFacet.getStaticResolverKey();
      const key2 = await factorySuiteFacet.getStaticResolverKey();
      expect(key1).to.equal(key2);
    });
  });

  describe("getStaticFunctionSelectors", () => {
    it("GIVEN FactorySuiteFacet deployed WHEN calling getStaticFunctionSelectors THEN success with deployBondSuite selector", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const selectors = await factorySuiteFacet.getStaticFunctionSelectors();
      expect(selectors).to.have.lengthOf(1);
    });

    it("GIVEN FactorySuiteFacet deployed WHEN calling getStaticFunctionSelectors multiple times THEN success with consistent results", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const selectors1 = await factorySuiteFacet.getStaticFunctionSelectors();
      const selectors2 = await factorySuiteFacet.getStaticFunctionSelectors();

      expect(selectors1).to.deep.equal(selectors2);
    });

    it("GIVEN FactorySuiteFacet deployed WHEN populating transaction for getStaticFunctionSelectors THEN success with no value", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const tx = await factorySuiteFacet.populateTransaction.getStaticFunctionSelectors();
      expect(tx.value).to.be.undefined;
    });
  });

  describe("getStaticInterfaceIds", () => {
    it("GIVEN FactorySuiteFacet deployed WHEN calling getStaticInterfaceIds THEN success with IFactorySuite interface ID", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const interfaceIds = await factorySuiteFacet.getStaticInterfaceIds();

      expect(interfaceIds).to.have.lengthOf(1);
      expect(interfaceIds[0]).to.not.equal("0x00000000");
    });

    it("GIVEN FactorySuiteFacet deployed WHEN calling getStaticInterfaceIds multiple times THEN success with consistent results", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const ids1 = await factorySuiteFacet.getStaticInterfaceIds();
      const ids2 = await factorySuiteFacet.getStaticInterfaceIds();

      expect(ids1).to.deep.equal(ids2);
    });

    it("GIVEN FactorySuiteFacet deployed WHEN estimating gas for getStaticInterfaceIds multiple times THEN success with consistent gas estimates", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const gasEstimate1 = await factorySuiteFacet.estimateGas.getStaticInterfaceIds();
      const gasEstimate2 = await factorySuiteFacet.estimateGas.getStaticInterfaceIds();

      expect(gasEstimate1).to.equal(gasEstimate2);
    });
  });

  describe("Constructor", () => {
    it("GIVEN valid deployment parameters WHEN deploying FactorySuiteFacet THEN success", async () => {
      const { facetAddresses } = await loadFixture(setupFixture);
      expect(facetAddresses.FactorySuiteFacet).to.not.equal(ethers.constants.AddressZero);
    });

    it("GIVEN FactorySuiteFacet deployed WHEN checking deployBondSuite method existence THEN success", async () => {
      const { factorySuite, deployer } = await loadFixture(setupFixture);
      // Business logic functions are called through proxy
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(factorySuite.address, deployer);

      const hasDeployBondSuite = factorySuiteFacet.deployBondSuite !== undefined;
      expect(hasDeployBondSuite).to.be.true;
    });

    it("GIVEN FactorySuiteFacet deployed WHEN checking IStaticFunctionSelectors methods THEN success", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      // Static functions are called on deployed facet address
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const hasGetStaticResolverKey = factorySuiteFacet.getStaticResolverKey !== undefined;
      const hasGetStaticFunctionSelectors = factorySuiteFacet.getStaticFunctionSelectors !== undefined;
      const hasGetStaticInterfaceIds = factorySuiteFacet.getStaticInterfaceIds !== undefined;

      expect(hasGetStaticResolverKey).to.be.true;
      expect(hasGetStaticFunctionSelectors).to.be.true;
      expect(hasGetStaticInterfaceIds).to.be.true;
    });
  });

  describe("Diamond Pattern Integration", () => {
    it("GIVEN FactorySuiteFacet deployed WHEN verifying diamond proxy compatibility THEN success with valid metadata", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const selectors = await factorySuiteFacet.getStaticFunctionSelectors();
      const resolverKey = await factorySuiteFacet.getStaticResolverKey();
      const interfaceIds = await factorySuiteFacet.getStaticInterfaceIds();

      expect(selectors.length).to.be.greaterThan(0);
      expect(resolverKey).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
      expect(interfaceIds.length).to.be.greaterThan(0);
    });

    it("GIVEN FactorySuiteFacet deployed WHEN retrieving metadata for diamond cut THEN success with valid selectors and interface IDs", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

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
    it("GIVEN FactorySuiteFacet deployed WHEN calling metadata functions THEN success with efficient gas usage", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);

      const gasForResolverKey = await factorySuiteFacet.estimateGas.getStaticResolverKey();
      const gasForSelectors = await factorySuiteFacet.estimateGas.getStaticFunctionSelectors();
      const gasForInterfaces = await factorySuiteFacet.estimateGas.getStaticInterfaceIds();

      expect(gasForResolverKey.lt(30000)).to.be.true;
      expect(gasForSelectors.lt(50000)).to.be.true;
      expect(gasForInterfaces.lt(50000)).to.be.true;
    });
  });

  describe("Function Signature Verification", () => {
    it("GIVEN FactorySuiteFacet deployed WHEN checking function signatures THEN success with correct exposed functions", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);
      const contractInterface = factorySuiteFacet.interface;

      expect(contractInterface.getFunction("deployBondSuite")).to.not.be.undefined;
      expect(contractInterface.getFunction("getStaticResolverKey")).to.not.be.undefined;
      expect(contractInterface.getFunction("getStaticFunctionSelectors")).to.not.be.undefined;
      expect(contractInterface.getFunction("getStaticInterfaceIds")).to.not.be.undefined;
    });

    it("GIVEN FactorySuiteFacet deployed WHEN checking function visibility THEN success with correct state mutability", async () => {
      const { facetAddresses, deployer } = await loadFixture(setupFixture);
      const factorySuiteFacet = FactorySuiteFacet__factory.connect(facetAddresses.FactorySuiteFacet, deployer);
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

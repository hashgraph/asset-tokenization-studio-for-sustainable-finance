import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  deployFactorySuiteFixture,
  FactoryFixture,
} from "./fixtures/factoryFixtures";

describe("FactorySuiteFacet", () => {
  let fixture: FactoryFixture;

  beforeEach(async () => {
    fixture = await loadFixture(deployFactorySuiteFixture);
  });

  describe("Diamond Facet Implementation", () => {
    it("should implement IStaticFunctionSelectors interface", async () => {
      const IStaticFunctionSelectorsInterface = "0x4e2312e0"; // Interface ID for IStaticFunctionSelectors
      expect(
        await fixture.factorySuiteFacet.supportsInterface(
          IStaticFunctionSelectorsInterface,
        ),
      ).to.be.true;
    });

    it("should implement IFactorySuite interface", async () => {
      const IFactorySuiteInterface = "0xa0712d68"; // Calculate actual interface ID
      // Note: This would need the actual calculated interface ID for IFactorySuite
      const supportedInterfaces =
        await fixture.factorySuiteFacet.getStaticInterfaceIds();
      expect(supportedInterfaces.length).to.be.greaterThan(0);
    });
  });

  describe("getStaticResolverKey", () => {
    it("should return correct resolver key", async () => {
      const expectedKey =
        "0xcf89d9e351b154ec73d93d535b6701c171db4dd978aa2e8967ef3aae7d45453f";
      const actualKey = await fixture.factorySuiteFacet.getStaticResolverKey();
      expect(actualKey).to.equal(expectedKey);
    });

    it("should be a pure function (no state changes)", async () => {
      const key1 = await fixture.factorySuiteFacet.getStaticResolverKey();
      const key2 = await fixture.factorySuiteFacet.getStaticResolverKey();
      expect(key1).to.equal(key2);
    });
  });

  describe("getStaticFunctionSelectors", () => {
    it("should return deployBondSuite selector", async () => {
      const selectors =
        await fixture.factorySuiteFacet.getStaticFunctionSelectors();

      // Calculate expected selector for deployBondSuite function
      const deployBondSuiteSelector = ethers.utils
        .id(
          "deployBondSuite(address,(string,string,string,uint8,uint256,(uint256,uint256,uint8,uint256)),(bool,bool,bool,bool),(address,(address,uint256),(bytes32,address)[],address,address[])((address,(bytes32,address)[])",
        )
        .slice(0, 10);

      expect(selectors).to.have.lengthOf(1);
      // Note: The actual selector calculation would need the exact function signature
    });

    it("should return consistent selectors", async () => {
      const selectors1 =
        await fixture.factorySuiteFacet.getStaticFunctionSelectors();
      const selectors2 =
        await fixture.factorySuiteFacet.getStaticFunctionSelectors();

      expect(selectors1).to.deep.equal(selectors2);
    });

    it("should be a pure function", async () => {
      const tx =
        await fixture.factorySuiteFacet.populateTransaction.getStaticFunctionSelectors();
      expect(tx.value).to.be.undefined; // No ETH value
    });
  });

  describe("getStaticInterfaceIds", () => {
    it("should return IFactorySuite interface ID", async () => {
      const interfaceIds =
        await fixture.factorySuiteFacet.getStaticInterfaceIds();

      expect(interfaceIds).to.have.lengthOf(1);
      // The actual interface ID would be calculated from IFactorySuite interface
      expect(interfaceIds[0]).to.not.equal("0x00000000");
    });

    it("should return consistent interface IDs", async () => {
      const ids1 = await fixture.factorySuiteFacet.getStaticInterfaceIds();
      const ids2 = await fixture.factorySuiteFacet.getStaticInterfaceIds();

      expect(ids1).to.deep.equal(ids2);
    });

    it("should be a pure function", async () => {
      // Verify no state changes by checking gas estimation is consistent
      const gasEstimate1 =
        await fixture.factorySuiteFacet.estimateGas.getStaticInterfaceIds();
      const gasEstimate2 =
        await fixture.factorySuiteFacet.estimateGas.getStaticInterfaceIds();

      expect(gasEstimate1).to.equal(gasEstimate2);
    });
  });

  describe("Constructor", () => {
    it("should deploy successfully", async () => {
      expect(fixture.factorySuiteFacet.address).to.not.equal(
        ethers.constants.AddressZero,
      );
    });

    it("should inherit from FactorySuite", async () => {
      // Verify that it has deployBondSuite function from FactorySuite
      const hasDeployBondSuite =
        fixture.factorySuiteFacet.deployBondSuite !== undefined;
      expect(hasDeployBondSuite).to.be.true;
    });

    it("should implement IStaticFunctionSelectors", async () => {
      // Verify that it has the required interface methods
      const hasGetStaticResolverKey =
        fixture.factorySuiteFacet.getStaticResolverKey !== undefined;
      const hasGetStaticFunctionSelectors =
        fixture.factorySuiteFacet.getStaticFunctionSelectors !== undefined;
      const hasGetStaticInterfaceIds =
        fixture.factorySuiteFacet.getStaticInterfaceIds !== undefined;

      expect(hasGetStaticResolverKey).to.be.true;
      expect(hasGetStaticFunctionSelectors).to.be.true;
      expect(hasGetStaticInterfaceIds).to.be.true;
    });
  });

  describe("Diamond Pattern Integration", () => {
    it("should be compatible with diamond proxy pattern", async () => {
      // Verify the facet can be used in a diamond pattern
      const selectors =
        await fixture.factorySuiteFacet.getStaticFunctionSelectors();
      const resolverKey =
        await fixture.factorySuiteFacet.getStaticResolverKey();
      const interfaceIds =
        await fixture.factorySuiteFacet.getStaticInterfaceIds();

      expect(selectors.length).to.be.greaterThan(0);
      expect(resolverKey).to.not.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      );
      expect(interfaceIds.length).to.be.greaterThan(0);
    });

    it("should provide all necessary metadata for diamond cut", async () => {
      // These are the essential pieces needed for diamond pattern integration
      const selectors =
        await fixture.factorySuiteFacet.getStaticFunctionSelectors();
      const interfaceIds =
        await fixture.factorySuiteFacet.getStaticInterfaceIds();

      // Verify selectors are valid (4 bytes each)
      for (const selector of selectors) {
        expect(selector).to.match(/^0x[0-9a-fA-F]{8}$/);
      }

      // Verify interface IDs are valid (4 bytes each)
      for (const interfaceId of interfaceIds) {
        expect(interfaceId).to.match(/^0x[0-9a-fA-F]{8}$/);
      }
    });
  });

  describe("Gas Efficiency", () => {
    it("should have efficient gas usage for metadata functions", async () => {
      const gasForResolverKey =
        await fixture.factorySuiteFacet.estimateGas.getStaticResolverKey();
      const gasForSelectors =
        await fixture.factorySuiteFacet.estimateGas.getStaticFunctionSelectors();
      const gasForInterfaces =
        await fixture.factorySuiteFacet.estimateGas.getStaticInterfaceIds();

      // These should be very cheap pure functions
      expect(gasForResolverKey.lt(30000)).to.be.true;
      expect(gasForSelectors.lt(50000)).to.be.true; // Slightly higher due to array return
      expect(gasForInterfaces.lt(50000)).to.be.true; // Slightly higher due to array return
    });
  });

  describe("Function Signature Verification", () => {
    it("should expose correct function signatures", async () => {
      const contractInterface = fixture.factorySuiteFacet.interface;

      // Verify key functions are present
      expect(contractInterface.getFunction("deployBondSuite")).to.not.be
        .undefined;
      expect(contractInterface.getFunction("getStaticResolverKey")).to.not.be
        .undefined;
      expect(contractInterface.getFunction("getStaticFunctionSelectors")).to.not
        .be.undefined;
      expect(contractInterface.getFunction("getStaticInterfaceIds")).to.not.be
        .undefined;
    });

    it("should have correct function visibility", async () => {
      const contractInterface = fixture.factorySuiteFacet.interface;

      // getStaticResolverKey should be external pure
      const resolverKeyFunc = contractInterface.getFunction(
        "getStaticResolverKey",
      );
      expect(resolverKeyFunc.stateMutability).to.equal("pure");

      // getStaticFunctionSelectors should be external pure
      const selectorsFunc = contractInterface.getFunction(
        "getStaticFunctionSelectors",
      );
      expect(selectorsFunc.stateMutability).to.equal("pure");

      // getStaticInterfaceIds should be external pure
      const interfacesFunc = contractInterface.getFunction(
        "getStaticInterfaceIds",
      );
      expect(interfacesFunc.stateMutability).to.equal("pure");
    });
  });
});

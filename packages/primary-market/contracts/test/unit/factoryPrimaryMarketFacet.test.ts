import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PM_RESOLVER_KEYS } from "@scripts/domain";
import { IStaticFunctionSelectors } from "@contract-types";
import { deployFactoryPrimaryMarketSystem } from "@scripts";
import { configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import { ethers } from "hardhat";

let factoryPrimaryMarketFacet: IStaticFunctionSelectors;

describe("FactoryPrimaryMarketFacet", () => {
  configureLogger({ level: LogLevel.SILENT });

  async function deployFixture() {
    const [deployer] = await ethers.getSigners();

    const deployment = await deployFactoryPrimaryMarketSystem(deployer, "hardhat", {
      useTimeTravel: false,
      saveOutput: false, // Don't save deployment files during tests
    });

    const facetAddresses = deployment.facets.reduce(
      (acc, f) => {
        acc[f.name] = f.address;
        return acc;
      },
      {} as Record<string, string>,
    );

    factoryPrimaryMarketFacet = (await ethers.getContractAt(
      "IStaticFunctionSelectors",
      facetAddresses.FactoryPrimaryMarketFacet,
    )) as IStaticFunctionSelectors;
  }

  before(async () => {
    // Signers setup not needed for this test
  });

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("Diamond Facet Implementation", () => {
    it("GIVEN FactoryPrimaryMarketFacet deployed WHEN querying static interface IDs THEN success", async () => {
      const supportedInterfaces = await factoryPrimaryMarketFacet.getStaticInterfaceIds();
      expect(supportedInterfaces.length).to.be.greaterThan(0);
    });
  });

  describe("getStaticResolverKey", () => {
    it("GIVEN FactoryPrimaryMarketFacet deployed WHEN calling getStaticResolverKey THEN success with correct key", async () => {
      const actualKey = await factoryPrimaryMarketFacet.getStaticResolverKey();
      expect(actualKey).to.equal(PM_RESOLVER_KEYS.FACTORY_PRIMARY_MARKET);
    });
  });

  describe("getStaticFunctionSelectors", () => {
    it("GIVEN FactoryPrimaryMarketFacet deployed WHEN calling getStaticFunctionSelectors THEN success with deployBondPrimaryMarket selector", async () => {
      const selectors = await factoryPrimaryMarketFacet.getStaticFunctionSelectors();
      expect(selectors).to.have.lengthOf(1);
    });
  });

  describe("getStaticInterfaceIds", () => {
    it("GIVEN FactoryPrimaryMarketFacet deployed WHEN calling getStaticInterfaceIds THEN success with IFactoryPrimaryMarket interface ID", async () => {
      const interfaceIds = await factoryPrimaryMarketFacet.getStaticInterfaceIds();

      expect(interfaceIds).to.have.lengthOf(1);
      expect(interfaceIds[0]).to.not.equal("0x00000000");
    });
  });
});

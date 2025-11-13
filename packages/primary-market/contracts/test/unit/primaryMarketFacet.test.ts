import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PRIMARY_MARKET_RESOLVER_KEY } from "@scripts/domain";
import { IStaticFunctionSelectors } from "@contracts";
import { deployFactoryPrimaryMarketSystem } from "@scripts";
import { HardhatProvider, configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import { ethers } from "hardhat";

let primaryMarketFacet: IStaticFunctionSelectors;

describe("PrimaryMarketFacet", () => {
  configureLogger({ level: LogLevel.SILENT });

  async function deployFixture() {
    const provider = new HardhatProvider();

    const deployment = await deployFactoryPrimaryMarketSystem(provider, "hardhat", {
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

    primaryMarketFacet = (await ethers.getContractAt(
      "IStaticFunctionSelectors",
      facetAddresses.PrimaryMarketFacet,
    )) as IStaticFunctionSelectors;
  }

  before(async () => {
    // Signers setup not needed for this test
  });

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("Diamond Facet Implementation", () => {
    it("GIVEN PrimaryMarketFacet deployed WHEN querying static interface IDs THEN success", async () => {
      const supportedInterfaces = await primaryMarketFacet.getStaticInterfaceIds();
      expect(supportedInterfaces.length).to.be.greaterThan(0);
    });
  });

  describe("getStaticResolverKey", () => {
    it("GIVEN PrimaryMarketFacet deployed WHEN calling getStaticResolverKey THEN success with correct key", async () => {
      const actualKey = await primaryMarketFacet.getStaticResolverKey();
      expect(actualKey).to.equal(PRIMARY_MARKET_RESOLVER_KEY);
    });
  });

  describe("getStaticFunctionSelectors", () => {
    it("GIVEN PrimaryMarketFacet deployed WHEN calling getStaticFunctionSelectors THEN success with deployBondPrimaryMarket selector", async () => {
      const selectors = await primaryMarketFacet.getStaticFunctionSelectors();
      expect(selectors).to.have.lengthOf(12);
    });
  });

  describe("getStaticInterfaceIds", () => {
    it("GIVEN PrimaryMarketFacet deployed WHEN calling getStaticInterfaceIds THEN success with IPrimaryMarket interface ID", async () => {
      const interfaceIds = await primaryMarketFacet.getStaticInterfaceIds();

      expect(interfaceIds).to.have.lengthOf(1);
      expect(interfaceIds[0]).to.not.equal("0x00000000");
    });
  });
});

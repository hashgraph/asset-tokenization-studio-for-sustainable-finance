import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PM_RESOLVER_KEYS } from "@scripts/domain";
import { IStaticFunctionSelectors } from "@contract-types";
import { deployFactoryPrimaryMarketSystem } from "@scripts";
import { ethers } from "hardhat";

let primaryMarketFacet: IStaticFunctionSelectors;

describe("PrimaryMarketFacet", () => {
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

    primaryMarketFacet = (await ethers.getContractAt(
      "IStaticFunctionSelectors",
      facetAddresses.PrimaryMarketFacet,
    )) as IStaticFunctionSelectors;
  }

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
      expect(actualKey).to.equal(PM_RESOLVER_KEYS.PRIMARY_MARKET);
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

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { FACTORY_PRIMARY_MARKET_RESOLVER_KEY } from "@scripts/domain";
import { IStaticFunctionSelectors } from "@contracts";
import { deployFactoryPrimaryMarketSystem } from "@scripts";
import { HardhatProvider, configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import { ethers } from "hardhat";
import { Signer } from "ethers";

let factoryPrimaryMarketFacet: IStaticFunctionSelectors;
let deployer: Signer;
let admin: Signer;
let user: Signer;
let unauthorized: Signer;

describe("FactoryPrimaryMarketFacet", () => {
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

    factoryPrimaryMarketFacet = (await ethers.getContractAt(
      "IStaticFunctionSelectors",
      facetAddresses.FactoryPrimaryMarketFacet,
    )) as IStaticFunctionSelectors;
  }

  before(async () => {
    const signers = await ethers.getSigners();
    [deployer, admin, user, unauthorized] = signers;
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
      expect(actualKey).to.equal(FACTORY_PRIMARY_MARKET_RESOLVER_KEY);
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

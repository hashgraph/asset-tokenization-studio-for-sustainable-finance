import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { FACTORY_PRIMARY_MARKET_RESOLVER_KEY } from "@scripts/domain";
import {
  FactoryPrimaryMarketFacet__factory,
  IFactoryPrimaryMarket,
  IBusinessLogicResolver,
  IStaticFunctionSelectors,
} from "@contracts";
import { deployFactoryPrimaryMarketSystem } from "@scripts";
import { HardhatProvider } from "@hashgraph/asset-tokenization-contracts/scripts";
import { ethers } from "hardhat";
import { Signer } from "ethers";

let factoryPrimaryMarket: IFactoryPrimaryMarket;
let factoryPrimaryMarketFacet: IStaticFunctionSelectors;
let blr: IBusinessLogicResolver;
let deployer: Signer;
let admin: Signer;
let user: Signer;
let unauthorized: Signer;

describe("FactoryPrimaryMarketFacet", () => {
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

    factoryPrimaryMarket = (await ethers.getContractAt(
      "FactoryPrimaryMarket",
      deployment.infrastructure.factoryPrimaryMarket.proxy,
    )) as IFactoryPrimaryMarket;

    factoryPrimaryMarketFacet = (await ethers.getContractAt(
      "IStaticFunctionSelectors",
      facetAddresses.FactoryPrimaryMarketFacet,
    )) as IStaticFunctionSelectors;

    blr = (await ethers.getContractAt(
      "IBusinessLogicResolver",
      deployment.infrastructure.blr.proxy,
    )) as IBusinessLogicResolver;
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

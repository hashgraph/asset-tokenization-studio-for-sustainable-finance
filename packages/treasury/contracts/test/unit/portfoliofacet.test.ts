// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PORTFOLIO_RESOLVER_KEY } from "@scripts/domain";
import { IStaticFunctionSelectors } from "@contracts";
import { deployTreasury } from "../../scripts/workflows/deployTreasurySystemWithNewBlr";
import { configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import { ethers } from "hardhat";

let portfolioFacet: IStaticFunctionSelectors;
let signer_A;

describe("PortfolioFacet", () => {
  configureLogger({ level: LogLevel.SILENT });

  async function deployFixture() {
    const deployment = await deployTreasury(signer_A, "hardhat", {
      useTimeTravel: false,
      saveOutput: false,
    });

    const facetAddresses = deployment.facets.reduce(
      (acc, f) => {
        acc[f.name] = f.address;
        return acc;
      },
      {} as Record<string, string>,
    );

    portfolioFacet = (await ethers.getContractAt(
      "IStaticFunctionSelectors",
      facetAddresses.PortfolioFacet,
    )) as IStaticFunctionSelectors;
  }

  before(async () => {
    [signer_A] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("Diamond Facet Implementation", () => {
    it("GIVEN PortfolioFacet deployed WHEN querying static interface IDs THEN success", async () => {
      const supportedInterfaces = await portfolioFacet.getStaticInterfaceIds();
      expect(supportedInterfaces.length).to.be.greaterThan(0);
    });
  });

  describe("getStaticResolverKey", () => {
    it("GIVEN PortfolioFacet deployed WHEN calling getStaticResolverKey THEN success with correct key", async () => {
      const actualKey = await portfolioFacet.getStaticResolverKey();
      expect(actualKey).to.equal(PORTFOLIO_RESOLVER_KEY);
    });
  });

  describe("getStaticFunctionSelectors", () => {
    it("GIVEN PortfolioFacet deployed WHEN calling getStaticFunctionSelectors THEN success with all selectors", async () => {
      const selectors = await portfolioFacet.getStaticFunctionSelectors();
      expect(selectors).to.have.lengthOf(8);
    });
  });

  describe("getStaticInterfaceIds", () => {
    it("GIVEN PortfolioFacet deployed WHEN calling getStaticInterfaceIds THEN success with IPortfolio interface ID", async () => {
      const interfaceIds = await portfolioFacet.getStaticInterfaceIds();

      expect(interfaceIds).to.have.lengthOf(1);
      expect(interfaceIds[0]).to.not.equal("0x00000000");
    });
  });
});

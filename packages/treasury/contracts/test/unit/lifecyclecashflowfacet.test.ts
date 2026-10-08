// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { LIFE_CYCLE_CASH_FLOW_RESOLVER_KEY } from "@scripts/domain";
import { IStaticFunctionSelectors } from "@contracts";
import { deployTreasury } from "../../scripts/workflows/deployTreasurySystemWithNewBlr";
import { ethers } from "hardhat";

let lifeCycleCashFlowFacet: IStaticFunctionSelectors;
let signer_A;

describe("LifeCycleCashFlowFacet", () => {
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

    lifeCycleCashFlowFacet = (await ethers.getContractAt(
      "IStaticFunctionSelectors",
      facetAddresses.LifeCycleCashFlowFacet,
    )) as IStaticFunctionSelectors;
  }

  before(async () => {
    [signer_A] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("Diamond Facet Implementation", () => {
    it("GIVEN LifeCycleCashFlowFacet deployed WHEN querying static interface IDs THEN success", async () => {
      const supportedInterfaces = await lifeCycleCashFlowFacet.getStaticInterfaceIds();
      expect(supportedInterfaces.length).to.be.greaterThan(0);
    });
  });

  describe("getStaticResolverKey", () => {
    it("GIVEN LifeCycleCashFlowFacet deployed WHEN calling getStaticResolverKey THEN success with correct key", async () => {
      const actualKey = await lifeCycleCashFlowFacet.getStaticResolverKey();
      expect(actualKey).to.equal(LIFE_CYCLE_CASH_FLOW_RESOLVER_KEY);
    });
  });

  describe("getStaticFunctionSelectors", () => {
    it("GIVEN LifeCycleCashFlowFacet deployed WHEN calling getStaticFunctionSelectors THEN success with all selectors", async () => {
      const selectors = await lifeCycleCashFlowFacet.getStaticFunctionSelectors();
      expect(selectors).to.have.lengthOf(6);
    });
  });

  describe("getStaticInterfaceIds", () => {
    it("GIVEN LifeCycleCashFlowFacet deployed WHEN calling getStaticInterfaceIds THEN success with ILifeCycleCashFlow interface ID", async () => {
      const interfaceIds = await lifeCycleCashFlowFacet.getStaticInterfaceIds();

      expect(interfaceIds).to.have.lengthOf(1);
      expect(interfaceIds[0]).to.not.equal("0x00000000");
    });
  });
});

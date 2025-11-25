// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PROCEEDS_MANAGEMENT_RESOLVER_KEY } from "@scripts/domain";
import { IStaticFunctionSelectors } from "@contracts";
import { deployTreasury } from "../../scripts/workflows/deployTreasurySystemWithNewBlr";
import { configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import { ethers } from "hardhat";

let proceedsManagementFacet: IStaticFunctionSelectors;
let signer_A;

describe("ProceedsManagementFacet", () => {
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

    proceedsManagementFacet = (await ethers.getContractAt(
      "IStaticFunctionSelectors",
      facetAddresses.ProceedsManagementFacet,
    )) as IStaticFunctionSelectors;
  }

  before(async () => {
    [signer_A] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("Diamond Facet Implementation", () => {
    it("GIVEN ProceedsManagementFacet deployed WHEN querying static interface IDs THEN success", async () => {
      const supportedInterfaces = await proceedsManagementFacet.getStaticInterfaceIds();
      expect(supportedInterfaces.length).to.be.greaterThan(0);
    });
  });

  describe("getStaticResolverKey", () => {
    it("GIVEN ProceedsManagementFacet deployed WHEN calling getStaticResolverKey THEN success with correct key", async () => {
      const actualKey = await proceedsManagementFacet.getStaticResolverKey();
      expect(actualKey).to.equal(PROCEEDS_MANAGEMENT_RESOLVER_KEY);
    });
  });

  describe("getStaticFunctionSelectors", () => {
    it("GIVEN ProceedsManagementFacet deployed WHEN calling getStaticFunctionSelectors THEN success with all selectors", async () => {
      const selectors = await proceedsManagementFacet.getStaticFunctionSelectors();
      expect(selectors).to.have.lengthOf(3);
    });
  });

  describe("getStaticInterfaceIds", () => {
    it("GIVEN ProceedsManagementFacet deployed WHEN calling getStaticInterfaceIds THEN success with IProceedsManagement interface ID", async () => {
      const interfaceIds = await proceedsManagementFacet.getStaticInterfaceIds();

      expect(interfaceIds).to.have.lengthOf(1);
      expect(interfaceIds[0]).to.not.equal("0x00000000");
    });
  });
});

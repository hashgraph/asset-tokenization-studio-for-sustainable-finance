import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployFactorySuiteInfrastructureFixture } from "@test/fixtures";
import { FACTORY_SUITE_CONFIG_ID } from "@scripts/domain";

describe("FactorySuite - Integration Tests", () => {
  async function setupFixture() {
    return await deployFactorySuiteInfrastructureFixture(false);
  }

  before(async () => {
    await loadFixture(setupFixture);
  });

  describe("Infrastructure Deployment", () => {
    it("should deploy with real BLR", async () => {
      const { factorySuite, blr } = await loadFixture(setupFixture);
      expect(factorySuite.address).to.not.equal(ethers.constants.AddressZero);
      expect(blr.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("should have correct configuration in BLR", async () => {
      const { blr, deployment } = await loadFixture(setupFixture);

      const configVersion = await blr.getLatestVersionByConfiguration(FACTORY_SUITE_CONFIG_ID);
      expect(configVersion).to.equal(deployment.configuration.version);
    });

    it("should have all facets registered", async () => {
      const { deployment } = await loadFixture(setupFixture);

      expect(deployment.facets.length).to.equal(3);
      expect(deployment.facets.map((f) => f.name)).to.include.members([
        "AccessControlFacet",
        "PauseFacet",
        "FactorySuiteFacet",
      ]);
    });

    it("should have ProxyAdmin deployed", async () => {
      const { proxyAdmin } = await loadFixture(setupFixture);
      expect(proxyAdmin.address).to.not.equal(ethers.constants.AddressZero);
    });
  });
});

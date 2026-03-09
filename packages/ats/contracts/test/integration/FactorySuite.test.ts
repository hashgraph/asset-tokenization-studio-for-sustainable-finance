import { expect } from "chai";
import { ZeroAddress } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployFactorySuiteInfrastructureFixture } from "@test";
import { FACTORY_SUITE_CONFIG_ID } from "@scripts/domain";

describe("FactorySuite - Integration Tests", () => {
  async function setupFixture() {
    return await deployFactorySuiteInfrastructureFixture(false);
  }

  before(async () => {
    await loadFixture(setupFixture);
  });

  describe("Infrastructure Deployment", () => {
    it("GIVEN valid infrastructure configuration WHEN deploying factory suite THEN success with real BLR", async () => {
      const { factorySuite, blr } = await loadFixture(setupFixture);
      expect(await factorySuite.getAddress()).to.not.equal(ZeroAddress);
      expect(await blr.getAddress()).to.not.equal(ZeroAddress);
    });

    it("GIVEN deployed factory suite WHEN querying BLR configuration THEN success with correct version", async () => {
      const { blr, deployment } = await loadFixture(setupFixture);

      const configVersion = await blr.getLatestVersionByConfiguration(FACTORY_SUITE_CONFIG_ID);
      expect(configVersion).to.equal(deployment.configuration.version);
    });

    it("GIVEN deployed factory suite WHEN checking facet registration THEN success with all four facets registered", async () => {
      const { deployment } = await loadFixture(setupFixture);

      expect(deployment.facets.length).to.equal(4);
      expect(deployment.facets.map((f) => f.name)).to.include.members([
        "DiamondFacet",
        "AccessControlFacet",
        "PauseFacet",
        "FactorySuiteFacet",
      ]);
    });

    it("GIVEN valid infrastructure configuration WHEN deploying factory suite THEN success with ProxyAdmin deployed", async () => {
      const { proxyAdmin } = await loadFixture(setupFixture);
      expect(await proxyAdmin.getAddress()).to.not.equal(ZeroAddress);
    });
  });
});

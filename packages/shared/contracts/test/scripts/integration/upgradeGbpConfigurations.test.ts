// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import type { Signer } from "ethers";
import { ZeroAddress } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import { FACTORY_SUITE_CONFIG_ID } from "@hashgraph/green-bonds-platform-ats-contracts/scripts";
import { TREASURY_CONFIG_ID } from "@hashgraph/green-bonds-platform-treasury-contracts/scripts";
import {
  FACTORY_PRIMARY_MARKET_CONFIG_ID,
  PRIMARY_MARKET_CONFIG_ID,
} from "@hashgraph/green-bonds-platform-primarymarket-contracts/scripts";
import { upgradeGbpConfigurations } from "@scripts";
import { deployGbpInfrastructureFixture, deployAndUpgradeGbpFixture, deployAndSelectiveUpgradeFixture } from "@test";

describe("upgradeGbpConfigurations Integration Tests", () => {
  async function getConfigVersion(blrAddress: string, configId: string, signer: Signer): Promise<number> {
    const blr = BusinessLogicResolver__factory.connect(blrAddress, signer);
    const version = await blr.getLatestVersionByConfiguration(configId);
    return typeof version === "bigint" ? Number(version) : version;
  }

  // Uses deployAndUpgradeGbpFixture: deploy + upgrade run once, then snapshotted
  describe("Full Upgrade", () => {
    it("should upgrade all 4 domains to version 2", async () => {
      const { deployer, blrAddress, upgradeOutput } = await loadFixture(deployAndUpgradeGbpFixture);

      expect(upgradeOutput.summary.totalDomains).to.equal(4);
      expect(upgradeOutput.summary.successfulUpgrades).to.equal(4);
      expect(upgradeOutput.summary.failedUpgrades).to.equal(0);
      expect(upgradeOutput.summary.allSuccess).to.be.true;

      // Verify BLR reflects v2 for all domain configs
      const v2_factorySuite = await getConfigVersion(blrAddress, FACTORY_SUITE_CONFIG_ID, deployer);
      const v2_treasury = await getConfigVersion(blrAddress, TREASURY_CONFIG_ID, deployer);
      const v2_factoryPm = await getConfigVersion(blrAddress, FACTORY_PRIMARY_MARKET_CONFIG_ID, deployer);
      const v2_primaryMarket = await getConfigVersion(blrAddress, PRIMARY_MARKET_CONFIG_ID, deployer);

      expect(v2_factorySuite).to.equal(2);
      expect(v2_treasury).to.equal(2);
      expect(v2_factoryPm).to.equal(2);
      expect(v2_primaryMarket).to.equal(2);
    });

    it("should have all domain results with correct version and config ID", async () => {
      const { upgradeOutput } = await loadFixture(deployAndUpgradeGbpFixture);

      expect(upgradeOutput.domainResults).to.have.lengthOf(4);
      upgradeOutput.domainResults.forEach((result) => {
        expect(result.success).to.be.true;
        expect(result.version).to.equal(2);
        expect(result.configId).to.be.a("string");
        expect(result.facetsDeployed).to.be.greaterThan(0);
        expect(result.domain).to.be.oneOf(["factorySuite", "treasury", "factoryPrimaryMarket", "primaryMarket"]);
      });
    });

    it("should report zero proxies updated when no proxy addresses provided", async () => {
      const { upgradeOutput } = await loadFixture(deployAndUpgradeGbpFixture);

      expect(upgradeOutput.summary.totalProxiesUpdated).to.equal(0);
      expect(upgradeOutput.summary.totalProxiesFailed).to.equal(0);
    });

    it("should deploy facets for all domains", async () => {
      const { upgradeOutput } = await loadFixture(deployAndUpgradeGbpFixture);

      expect(upgradeOutput.summary.totalFacetsDeployed).to.be.greaterThan(0);
    });
  });

  // Uses deployAndSelectiveUpgradeFixture: deploy + partial upgrade snapshotted
  describe("Selective Upgrade", () => {
    it("should upgrade only specified domains", async () => {
      const { upgradeOutput } = await loadFixture(deployAndSelectiveUpgradeFixture);

      expect(upgradeOutput.domainResults).to.have.lengthOf(2);
      expect(upgradeOutput.summary.totalDomains).to.equal(2);
      expect(upgradeOutput.summary.successfulUpgrades).to.equal(2);

      const domains = upgradeOutput.domainResults.map((r) => r.domain);
      expect(domains).to.have.members(["treasury", "factorySuite"]);
    });

    it("should leave non-specified domains at version 1", async () => {
      const { deployer, blrAddress } = await loadFixture(deployAndSelectiveUpgradeFixture);

      const treasuryVersion = await getConfigVersion(blrAddress, TREASURY_CONFIG_ID, deployer);
      const factorySuiteVersion = await getConfigVersion(blrAddress, FACTORY_SUITE_CONFIG_ID, deployer);
      const factoryPmVersion = await getConfigVersion(blrAddress, FACTORY_PRIMARY_MARKET_CONFIG_ID, deployer);
      const primaryMarketVersion = await getConfigVersion(blrAddress, PRIMARY_MARKET_CONFIG_ID, deployer);

      expect(treasuryVersion).to.equal(2);
      expect(factorySuiteVersion).to.equal(2);
      expect(factoryPmVersion).to.equal(1);
      expect(primaryMarketVersion).to.equal(1);
    });
  });

  describe("BLR Validation", () => {
    it("should reject zero address BLR", async () => {
      const { signers } = await loadFixture(deployGbpInfrastructureFixture);
      const deployer = signers[0];

      await expect(
        upgradeGbpConfigurations(deployer, {
          blrAddress: ZeroAddress,
        }),
      ).to.be.rejected;
    });

    it("should reject non-existent BLR address", async () => {
      const { signers } = await loadFixture(deployGbpInfrastructureFixture);
      const deployer = signers[0];

      await expect(
        upgradeGbpConfigurations(deployer, {
          blrAddress: "0x0000000000000000000000000000000000000001",
        }),
      ).to.be.rejected;
    });
  });

  describe("Output Structure", () => {
    it("should return complete UpgradeGbpConfigurationsOutput with all fields", async () => {
      const { upgradeOutput, blrAddress } = await loadFixture(deployAndUpgradeGbpFixture);

      expect(upgradeOutput).to.have.property("network").that.is.a("string");
      expect(upgradeOutput).to.have.property("timestamp").that.is.a("string");
      expect(upgradeOutput).to.have.property("deployer").that.is.a("string");
      expect(upgradeOutput.deployer).to.be.properAddress;
      expect(upgradeOutput.blr.isExternal).to.be.true;
      expect(upgradeOutput.blr.address).to.equal(blrAddress);

      // Validate timestamp
      expect(upgradeOutput.timestamp).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Validate summary
      const { summary } = upgradeOutput;
      expect(summary.totalDomains).to.be.a("number");
      expect(summary.successfulUpgrades).to.be.a("number");
      expect(summary.failedUpgrades).to.be.a("number");
      expect(summary.totalFacetsDeployed).to.be.a("number");
      expect(summary.totalProxiesUpdated).to.be.a("number");
      expect(summary.totalProxiesFailed).to.be.a("number");
      expect(summary.totalUpgradeTime).to.be.a("number");
      expect(summary.allSuccess).to.be.a("boolean");
    });
  });

  describe("Idempotency", () => {
    it("should support multiple upgrade rounds (v2 → v3)", async function () {
      this.timeout(120_000); // Upgrade is expensive

      const { deployer, blrAddress } = await loadFixture(deployAndUpgradeGbpFixture);

      // State is at v2 from fixture. Run another upgrade → v3
      const output = await upgradeGbpConfigurations(deployer, {
        blrAddress,
        network: "hardhat",
      });

      expect(output.summary.allSuccess).to.be.true;

      const version = await getConfigVersion(blrAddress, FACTORY_SUITE_CONFIG_ID, deployer);
      expect(version).to.equal(3);
    });
  });
});

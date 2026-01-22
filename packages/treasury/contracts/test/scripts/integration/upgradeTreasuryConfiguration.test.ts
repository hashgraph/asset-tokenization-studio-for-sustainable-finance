// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for Treasury configuration upgrade workflow.
 *
 * Tests the complete upgrade workflow including:
 * - Facet deployment (LifeCycleCashFlow, Portfolio, ProceedsManagement)
 * - BLR registration
 * - Configuration creation
 * - Proxy updates (optional)
 *
 * @module test/scripts/integration/upgradeTreasuryConfiguration
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { promises as fs } from "fs";
import { upgradeTreasuryConfiguration } from "@scripts";
import { deployTreasuryInfrastructureFixture } from "@test";
import { IBusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import { deployResolverProxy, configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import { TREASURY_CONFIG_ID } from "@scripts/domain";

describe("upgradeTreasuryConfiguration Integration Tests", () => {
  /**
   * Deploy initial Treasury infrastructure (standard mode).
   */
  async function setupInitialDeploymentStandard() {
    configureLogger({ level: LogLevel.SILENT });
    const fixture = await deployTreasuryInfrastructureFixture(false);

    return {
      deployer: fixture.deployer,
      admin: fixture.admin,
      blrAddress: fixture.deployment.infrastructure.blr.proxy,
      proxyAdminAddress: fixture.deployment.infrastructure.proxyAdmin.address,
      treasuryProxyAddress: fixture.deployment.infrastructure.treasury.proxy,
      blr: fixture.blr,
      deployment: fixture.deployment,
    };
  }

  /**
   * Deploy initial Treasury infrastructure (TimeTravel mode).
   */
  async function setupInitialDeploymentTimeTravel() {
    configureLogger({ level: LogLevel.SILENT });
    const fixture = await deployTreasuryInfrastructureFixture(true);

    return {
      deployer: fixture.deployer,
      admin: fixture.admin,
      blrAddress: fixture.deployment.infrastructure.blr.proxy,
      proxyAdminAddress: fixture.deployment.infrastructure.proxyAdmin.address,
      treasuryProxyAddress: fixture.deployment.infrastructure.treasury.proxy,
      blr: fixture.blr,
      deployment: fixture.deployment,
    };
  }

  /**
   * Query configuration version from BLR.
   */
  async function getConfigVersion(blrAddress: string, configId: string, signer: Signer): Promise<number> {
    const blr = IBusinessLogicResolver__factory.connect(blrAddress, signer);
    const version = await blr.getLatestVersionByConfiguration(configId);
    return version.toNumber();
  }

  /**
   * Query facet address from BLR by resolver key.
   */
  async function getFacetAddress(blrAddress: string, resolverKey: string, signer: Signer): Promise<string> {
    const blr = IBusinessLogicResolver__factory.connect(blrAddress, signer);
    return await blr.resolveLatestBusinessLogic(resolverKey);
  }

  describe("Basic Upgrade - Standard Mode", () => {
    it("should deploy new Treasury facets and create config v2", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);
      const initialVersion = await getConfigVersion(setup.blrAddress, TREASURY_CONFIG_ID, setup.deployer);

      expect(initialVersion).to.equal(1, "Initial version should be 1");

      // Run upgrade
      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        useTimeTravel: false,
      });

      // Verify result structure
      expect(result.summary.success).to.be.true;
      expect(result.network).to.equal("hardhat");
      expect(result.blr.address).to.equal(setup.blrAddress);
      expect(result.blr.isExternal).to.be.true;

      // Verify new version created
      expect(result.configuration.version).to.equal(2);
      expect(result.configuration.configId).to.equal(TREASURY_CONFIG_ID);

      // Verify facets deployed (3 custom facets for Treasury)
      expect(result.facets).to.have.lengthOf(3); // LifeCycleCashFlow, Portfolio, ProceedsManagement
      const facetNames = result.facets.map((f) => f.name);
      expect(facetNames).to.include("LifeCycleCashFlowFacet");
      expect(facetNames).to.include("PortfolioFacet");
      expect(facetNames).to.include("ProceedsManagementFacet");

      // Verify summary
      expect(result.summary.totalFacetsDeployed).to.equal(3);
      expect(result.summary.configurationsCreated).to.equal(1);
      expect(result.summary.proxiesUpdated).to.equal(0);
      expect(result.summary.proxiesFailed).to.equal(0);
      expect(result.summary.deploymentTime).to.be.greaterThan(0);

      // Verify config version in BLR
      const newVersion = await getConfigVersion(setup.blrAddress, TREASURY_CONFIG_ID, setup.deployer);
      expect(newVersion).to.equal(2);
    });

    it("should register new facets in BLR", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      // Get initial facet addresses
      const initialFacets = setup.deployment.facets.filter(
        (f) =>
          f.name === "LifeCycleCashFlowFacet" || f.name === "PortfolioFacet" || f.name === "ProceedsManagementFacet",
      );
      expect(initialFacets).to.have.lengthOf(3);

      // Run upgrade
      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
      });

      // Query new facet addresses from BLR
      for (const facet of result.facets) {
        const newFacetAddress = await getFacetAddress(setup.blrAddress, facet.key, setup.deployer);
        expect(newFacetAddress).to.be.properAddress;

        // Verify it's different from initial deployment
        const initialFacet = initialFacets.find((f) => f.name === facet.name);
        expect(newFacetAddress).to.not.equal(initialFacet?.address, `${facet.name} should have different address`);
      }
    });

    it("should include shared facets in configuration", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
      });

      // Configuration should have 6 facets total (Diamond, AccessControl, Pause + 3 Treasury custom)
      expect(result.configuration.facetCount).to.equal(6);

      // Verify facet keys include shared and custom facets
      const keys = result.configuration.facetKeys.map((f) => f.key);
      expect(keys).to.have.lengthOf(6);
    });
  });

  describe("TimeTravel Upgrade Mode", () => {
    it("should deploy Treasury facets and TimeTravelFacet", async () => {
      const setup = await loadFixture(setupInitialDeploymentTimeTravel);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        useTimeTravel: true,
      });

      // Should deploy 4 new facets (3 Treasury + 1 TimeTravel)
      expect(result.facets).to.have.lengthOf(4);

      const facetNames = result.facets.map((f: { name: string; address: string; key: string }) => f.name);
      expect(facetNames).to.include("LifeCycleCashFlowFacet");
      expect(facetNames).to.include("PortfolioFacet");
      expect(facetNames).to.include("ProceedsManagementFacet");
      expect(facetNames).to.include("TimeTravelFacet");

      // Configuration should have 7 facets total (Diamond, AccessControl, Pause + 3 Treasury + TimeTravel)
      expect(result.configuration.facetCount).to.equal(7);
    });

    it("should create version 2 with TimeTravel facets", async () => {
      const setup = await loadFixture(setupInitialDeploymentTimeTravel);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        useTimeTravel: true,
      });

      expect(result.configuration.version).to.equal(2);

      const newVersion = await getConfigVersion(setup.blrAddress, TREASURY_CONFIG_ID, setup.deployer);
      expect(newVersion).to.equal(2);
    });
  });

  describe("Proxy Updates", () => {
    it("should update single proxy to new version", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      // Verify initial configuration version in BLR
      const initialVersion = await getConfigVersion(setup.blrAddress, TREASURY_CONFIG_ID, setup.deployer);
      expect(initialVersion).to.equal(1);

      // Run upgrade with proxy update
      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        proxyAddresses: [setup.treasuryProxyAddress],
      });

      // Verify proxy update result
      expect(result.proxyUpdates).to.exist;
      expect(result.proxyUpdates).to.have.lengthOf(1);
      expect(result.proxyUpdates![0].success).to.be.true;
      expect(result.proxyUpdates![0].proxyAddress).to.equal(setup.treasuryProxyAddress);
      expect(result.proxyUpdates![0].previousVersion).to.equal(1); // Proxy deployed with config version 1
      expect(result.proxyUpdates![0].newVersion).to.equal(2);
      expect(result.proxyUpdates![0].transactionHash).to.be.properHex(64); // 64 hex digits (0x + 64 = 66 total)

      // Verify summary
      expect(result.summary.proxiesUpdated).to.equal(1);
      expect(result.summary.proxiesFailed).to.equal(0);
    });

    it("should update multiple proxies in batch", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      // Deploy second proxy
      const secondProxyResult = await deployResolverProxy(setup.deployer, {
        blrAddress: setup.blrAddress,
        configurationId: TREASURY_CONFIG_ID,
        version: 1,
        rbac: [
          {
            role: "0x0000000000000000000000000000000000000000000000000000000000000000",
            members: [await setup.deployer.getAddress()],
          },
        ],
        network: "hardhat",
      });

      const secondProxyAddress = secondProxyResult.proxyAddress!;

      // Run upgrade with both proxies
      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        proxyAddresses: [setup.treasuryProxyAddress, secondProxyAddress],
      });

      // Verify both proxies updated
      expect(result.proxyUpdates).to.have.lengthOf(2);
      expect(result.proxyUpdates!.every((u) => u.success)).to.be.true;
      expect(result.summary.proxiesUpdated).to.equal(2);
      expect(result.summary.proxiesFailed).to.equal(0);

      // Verify each proxy update with correct previous version
      // First proxy: deployed with config version 1
      expect(result.proxyUpdates![0].previousVersion).to.equal(1);
      expect(result.proxyUpdates![0].newVersion).to.equal(2);

      // Second proxy: deployed with version 1
      expect(result.proxyUpdates![1].previousVersion).to.equal(1);
      expect(result.proxyUpdates![1].newVersion).to.equal(2);
    });

    it("should handle continue-on-error for invalid proxy", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);
      const invalidProxyAddress = "0x0000000000000000000000000000000000000001";

      // Run upgrade with valid + invalid proxies
      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        proxyAddresses: [setup.treasuryProxyAddress, invalidProxyAddress],
      });

      // Verify results
      expect(result.proxyUpdates).to.have.lengthOf(2);

      const validUpdate = result.proxyUpdates!.find((u) => u.proxyAddress === setup.treasuryProxyAddress);
      const invalidUpdate = result.proxyUpdates!.find((u) => u.proxyAddress === invalidProxyAddress);

      expect(validUpdate?.success).to.be.true;
      expect(invalidUpdate?.success).to.be.false;
      expect(invalidUpdate?.error).to.exist;

      // Verify summary
      expect(result.summary.proxiesUpdated).to.equal(1);
      expect(result.summary.proxiesFailed).to.equal(1);

      // Workflow should still succeed
      expect(result.summary.success).to.be.true;
    });
  });

  describe("Error Handling", () => {
    it("should fail with invalid BLR address", async () => {
      const [deployer] = await ethers.getSigners();

      await expect(
        upgradeTreasuryConfiguration(deployer, "hardhat", {
          blrAddress: "0x0000000000000000000000000000000000000000",
        }),
      ).to.be.rejectedWith("Invalid BLR address");
    });

    it("should fail if BLR not accessible", async () => {
      const [deployer] = await ethers.getSigners();
      const fakeBlrAddress = "0x0000000000000000000000000000000000000001";

      await expect(
        upgradeTreasuryConfiguration(deployer, "hardhat", {
          blrAddress: fakeBlrAddress,
        }),
      ).to.be.rejected;
    });
  });

  describe("Configuration Options", () => {
    it("should use network default confirmations when not specified", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      // Don't provide confirmations - should use hardhat default (0)
      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        // No confirmations option - uses network default
      });

      expect(result.summary.success).to.be.true;
      // Workflow uses 0 confirmations on hardhat (instant mining)
    });

    it("should work with verbose logging", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        verbose: true,
      });

      expect(result.summary.success).to.be.true;
    });

    it("should work with retry enabled", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        enableRetry: true,
      });

      expect(result.summary.success).to.be.true;
    });

    it("should work with verification enabled", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        verifyDeployment: true,
      });

      expect(result.summary.success).to.be.true;
    });
  });

  describe("Output Validation", () => {
    it("should return complete output structure", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
      });

      // Verify all required fields
      expect(result).to.have.property("network");
      expect(result).to.have.property("timestamp");
      expect(result).to.have.property("deployer");
      expect(result).to.have.property("blr");
      expect(result).to.have.property("facets");
      expect(result).to.have.property("configuration");
      expect(result).to.have.property("summary");

      // Verify BLR info
      expect(result.blr.address).to.be.properAddress;
      expect(result.blr.isExternal).to.be.true;

      // Verify facets array
      expect(result.facets).to.be.an("array");
      result.facets.forEach((facet) => {
        expect(facet).to.have.property("name");
        expect(facet).to.have.property("address");
        expect(facet).to.have.property("key");
        expect(facet.address).to.be.properAddress;
      });

      // Verify configuration
      expect(result.configuration.configId).to.equal(TREASURY_CONFIG_ID);
      expect(result.configuration.version).to.be.a("number");
      expect(result.configuration.facetCount).to.be.a("number");
      expect(result.configuration.facetKeys).to.be.an("array");

      // Verify summary
      expect(result.summary.totalFacetsDeployed).to.be.a("number");
      expect(result.summary.configurationsCreated).to.equal(1);
      expect(result.summary.deploymentTime).to.be.greaterThan(0);
      expect(result.summary.success).to.be.true;
    });

    it("should include deployment time metrics", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
      });

      expect(result.summary.deploymentTime).to.be.a("number");
      expect(result.summary.deploymentTime).to.be.greaterThan(0);
    });

    it("should include ISO 8601 timestamp", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
      });

      const timestamp = new Date(result.timestamp);
      expect(timestamp.toISOString()).to.equal(result.timestamp);
    });
  });

  describe("Idempotency", () => {
    it("should allow multiple upgrades to create additional versions", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      // First upgrade (v1 -> v2)
      const result1 = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
      });
      expect(result1.configuration.version).to.equal(2);

      // Second upgrade (v2 -> v3)
      const result2 = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
      });
      expect(result2.configuration.version).to.equal(3);

      // Third upgrade (v3 -> v4)
      const result3 = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
      });
      expect(result3.configuration.version).to.equal(4);
    });
  });

  describe("Shared Facet Handling", () => {
    it("should query shared facets from BLR", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
      });

      // Configuration should include shared facets (Diamond, AccessControl, Pause) + 3 Treasury custom
      const facetKeys = result.configuration.facetKeys.map((f) => f.key);

      // Should have 6 keys total
      expect(facetKeys).to.have.lengthOf(6);

      // Verify Diamond, AccessControl and Pause are included
      const diamondAddress = await getFacetAddress(setup.blrAddress, facetKeys[0], setup.deployer);
      const accessControlAddress = await getFacetAddress(setup.blrAddress, facetKeys[1], setup.deployer);
      const pauseAddress = await getFacetAddress(setup.blrAddress, facetKeys[2], setup.deployer);

      expect(diamondAddress).to.be.properAddress;

      expect(accessControlAddress).to.be.properAddress;
      expect(pauseAddress).to.be.properAddress;
    });

    it("should not deploy shared facets (only Treasury-specific)", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        useTimeTravel: false,
      });

      // Should only deploy 3 new facets (Treasury custom facets)
      expect(result.facets).to.have.lengthOf(3);

      // But configuration should have 6 facets total (Diamond, AccessControl, Pause + 3 Treasury custom)
      expect(result.configuration.facetCount).to.equal(6);
    });
  });

  describe("Output File Saving", () => {
    afterEach(async () => {
      // Clean up deployment files after each test
      try {
        const files = await fs.readdir("deployments/hardhat").catch(() => []);
        for (const file of files) {
          if (file.includes("treasury-upgrade")) {
            await fs.unlink(`deployments/hardhat/${file}`);
          }
        }
      } catch (_error) {
        // Ignore cleanup errors
      }
    });

    it("should not save output by default (saveOutput=false)", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const _result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
      });

      expect(result.summary.success).to.be.true;

      // Check no file created
      const files = await fs.readdir("deployments/hardhat").catch(() => []);
      const upgradeFiles = files.filter((f) => f.includes("treasury-upgrade"));
      expect(upgradeFiles).to.have.lengthOf(0);
    });

    it("should save output to default path when saveOutput=true", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        saveOutput: true,
      });

      expect(result.summary.success).to.be.true;

      // Check file exists
      const files = await fs.readdir("deployments/hardhat");
      const upgradeFiles = files.filter((f) => f.includes("treasury-upgrade"));
      expect(upgradeFiles).to.have.lengthOf(1);

      // Verify JSON structure
      const filePath = `deployments/hardhat/${upgradeFiles[0]}`;
      const savedData = JSON.parse(await fs.readFile(filePath, "utf-8"));
      expect(savedData.network).to.equal("hardhat");
      expect(savedData.summary.success).to.be.true;
    });

    it("should save to custom path when outputPath provided", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);
      const customPath = "test-output/custom-upgrade.json";

      const result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        saveOutput: true,
        outputPath: customPath,
      });

      expect(result.summary.success).to.be.true;

      const fileExists = await fs
        .access(customPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).to.be.true;

      // Cleanup
      await fs.unlink(customPath);
      await fs.rmdir("test-output");
    });

    it("should save complete upgrade output with all required fields", async () => {
      const setup = await loadFixture(setupInitialDeploymentStandard);

      const _result = await upgradeTreasuryConfiguration(setup.deployer, "hardhat", {
        blrAddress: setup.blrAddress,
        saveOutput: true,
      });

      const files = await fs.readdir("deployments/hardhat");
      const upgradeFiles = files.filter((f) => f.includes("treasury-upgrade"));
      const filePath = `deployments/hardhat/${upgradeFiles[0]}`;

      const savedData = JSON.parse(await fs.readFile(filePath, "utf-8"));

      // Validate structure
      expect(savedData).to.have.property("network");
      expect(savedData).to.have.property("timestamp");
      expect(savedData).to.have.property("deployer");
      expect(savedData).to.have.property("blr");
      expect(savedData).to.have.property("facets");
      expect(savedData).to.have.property("configuration");
      expect(savedData).to.have.property("summary");

      expect(savedData.summary).to.have.property("totalFacetsDeployed");
      expect(savedData.summary).to.have.property("configurationsCreated");
      expect(savedData.summary).to.have.property("success");
      expect(savedData.summary.success).to.be.true;
    });
  });
});

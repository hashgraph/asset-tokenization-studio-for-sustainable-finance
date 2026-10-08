// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import { BOND_CONFIG_ID } from "@hashgraph/asset-tokenization-contracts/scripts";
import { FACTORY_SUITE_CONFIG_ID } from "@hashgraph/green-bonds-platform-ats-contracts/scripts";
import { TREASURY_CONFIG_ID } from "@hashgraph/green-bonds-platform-treasury-contracts/scripts";
import {
  FACTORY_PRIMARY_MARKET_CONFIG_ID,
  PRIMARY_MARKET_CONFIG_ID,
} from "@hashgraph/green-bonds-platform-primarymarket-contracts/scripts";
import { deployGbpInfrastructureFixture, deployGbpInfrastructureTimeTravelFixture } from "@test";

describe("deployGbpInfrastructure Integration Tests", () => {
  async function getConfigVersion(blrAddress: string, configId: string, signer: Signer): Promise<number> {
    const blr = BusinessLogicResolver__factory.connect(blrAddress, signer);
    const version = await blr.getLatestVersionByConfiguration(configId);
    return typeof version === "bigint" ? Number(version) : version;
  }

  describe("Complete Deployment", () => {
    it("should deploy with all domain results returning success: true", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);

      expect(result.bondDeployment.summary.success).to.equal(true);
      expect(result.treasuryDeployment.summary.success).to.equal(true);
      expect(result.factorySuiteDeployment.summary.success).to.equal(true);
      expect(result.primaryMarketDeployment.summary.success).to.equal(true);
    });

    it("should return a valid DeploymentResult object with all required fields", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);

      expect(result).to.have.property("proxyAdmin");
      expect(result).to.have.property("blr");
      expect(result).to.have.property("blrImplementationAddress");
      expect(result).to.have.property("bondDeployment");
      expect(result).to.have.property("treasuryDeployment");
      expect(result).to.have.property("factorySuiteDeployment");
      expect(result).to.have.property("primaryMarketDeployment");
    });

    it("should create all domain configs at version 1", async () => {
      const { result, deployer } = await loadFixture(deployGbpInfrastructureFixture);

      const bondVersion = await getConfigVersion(result.blr, BOND_CONFIG_ID, deployer);
      const treasuryVersion = await getConfigVersion(result.blr, TREASURY_CONFIG_ID, deployer);
      const factorySuiteVersion = await getConfigVersion(result.blr, FACTORY_SUITE_CONFIG_ID, deployer);
      const factoryPMVersion = await getConfigVersion(result.blr, FACTORY_PRIMARY_MARKET_CONFIG_ID, deployer);
      const pmVersion = await getConfigVersion(result.blr, PRIMARY_MARKET_CONFIG_ID, deployer);

      expect(bondVersion).to.equal(1);
      expect(treasuryVersion).to.equal(1);
      expect(factorySuiteVersion).to.equal(1);
      expect(factoryPMVersion).to.equal(1);
      expect(pmVersion).to.equal(1);
    });
  });

  describe("Infrastructure", () => {
    it("should deploy ProxyAdmin with valid address", async () => {
      const { result, proxyAdminAddress } = await loadFixture(deployGbpInfrastructureFixture);

      expect(proxyAdminAddress).to.be.properAddress;
      expect(result.proxyAdmin).to.equal(proxyAdminAddress);
    });

    it("should deploy BLR proxy with valid address", async () => {
      const { result, blrAddress } = await loadFixture(deployGbpInfrastructureFixture);

      expect(blrAddress).to.be.properAddress;
      expect(result.blr).to.equal(blrAddress);
    });

    it("should deploy BLR implementation with valid address different from proxy", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);

      expect(result.blrImplementationAddress).to.be.properAddress;
      expect(result.blrImplementationAddress).to.not.equal(ethers.ZeroAddress);
      expect(result.blr).to.not.equal(result.blrImplementationAddress);
    });
  });

  describe("BLR Configuration Verification", () => {
    it("should register BOND configuration (ID 2) at version 1", async () => {
      const { result, deployer } = await loadFixture(deployGbpInfrastructureFixture);
      const version = await getConfigVersion(result.blr, BOND_CONFIG_ID, deployer);
      expect(version).to.equal(1);
    });

    it("should register TREASURY configuration (ID 20000) at version 1", async () => {
      const { result, deployer } = await loadFixture(deployGbpInfrastructureFixture);
      const version = await getConfigVersion(result.blr, TREASURY_CONFIG_ID, deployer);
      expect(version).to.equal(1);
    });

    it("should register FACTORY_SUITE configuration (ID 30000) at version 1", async () => {
      const { result, deployer } = await loadFixture(deployGbpInfrastructureFixture);
      const version = await getConfigVersion(result.blr, FACTORY_SUITE_CONFIG_ID, deployer);
      expect(version).to.equal(1);
    });

    it("should register FACTORY_PRIMARY_MARKET configuration (ID 10000) at version 1", async () => {
      const { result, deployer } = await loadFixture(deployGbpInfrastructureFixture);
      const version = await getConfigVersion(result.blr, FACTORY_PRIMARY_MARKET_CONFIG_ID, deployer);
      expect(version).to.equal(1);
    });

    it("should register PRIMARY_MARKET configuration (ID 10001) at version 1", async () => {
      const { result, deployer } = await loadFixture(deployGbpInfrastructureFixture);
      const version = await getConfigVersion(result.blr, PRIMARY_MARKET_CONFIG_ID, deployer);
      expect(version).to.equal(1);
    });
  });

  describe("Proxy Verification", () => {
    it("should deploy ATS Factory proxy", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);
      const factoryProxy = result.bondDeployment.infrastructure.factory.proxy;
      expect(factoryProxy).to.be.properAddress;
      expect(factoryProxy).to.not.equal(ethers.ZeroAddress);
    });

    it("should deploy FactorySuite proxy", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);
      const factorySuiteProxy = result.factorySuiteDeployment.infrastructure.factorySuite.proxy;
      expect(factorySuiteProxy).to.be.properAddress;
      expect(factorySuiteProxy).to.not.equal(ethers.ZeroAddress);
    });

    it("should deploy FactoryPrimaryMarket proxy", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);
      const factoryPMProxy = result.primaryMarketDeployment.infrastructure.factoryPrimaryMarket.proxy;
      expect(factoryPMProxy).to.be.properAddress;
      expect(factoryPMProxy).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Shared Facet Reuse", () => {
    it("should include AccessControlFacet, PauseFacet, and DiamondFacet with valid addresses", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);

      const bondFacets = result.bondDeployment.facets;
      const accessControl = bondFacets.find((f) => f.name === "AccessControlFacet");
      const pause = bondFacets.find((f) => f.name === "PauseFacet");
      const diamond = bondFacets.find((f) => f.name === "DiamondFacet");

      expect(accessControl).to.exist;
      expect(accessControl?.address).to.be.properAddress;
      expect(pause).to.exist;
      expect(pause?.address).to.be.properAddress;
      expect(diamond).to.exist;
      expect(diamond?.address).to.be.properAddress;
    });

    it("should have all bond facets with valid addresses and metadata", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);

      const facets = result.bondDeployment.facets;
      expect(facets.length).to.be.greaterThan(0);

      facets.forEach((facet) => {
        expect(facet.address).to.be.properAddress;
        expect(facet.name).to.be.a("string").and.not.empty;
        expect(facet.key).to.be.a("string").and.not.empty;
      });
    });
  });

  describe("Output Structure", () => {
    it("should have correct bondDeployment structure", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);

      const bd = result.bondDeployment;
      expect(bd.summary.success).to.equal(true);
      expect(bd.summary.totalFacets).to.be.a("number");
      expect(bd.configurations.bond.version).to.equal(1);
      expect(bd.infrastructure.factory.proxy).to.be.properAddress;
    });

    it("should have correct treasuryDeployment structure", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);

      const td = result.treasuryDeployment;
      expect(td.summary.success).to.equal(true);
      expect(td.summary.totalFacets).to.be.a("number");
      expect(td.configuration.version).to.equal(1);
      expect(td.configuration).to.have.property("configId");
    });

    it("should have correct factorySuiteDeployment structure", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);

      const fsd = result.factorySuiteDeployment;
      expect(fsd.summary.success).to.equal(true);
      expect(fsd.configuration.version).to.equal(1);
      expect(fsd.infrastructure.factorySuite.proxy).to.be.properAddress;
      expect(fsd.infrastructure.blr).to.have.property("proxy");
    });

    it("should have correct primaryMarketDeployment structure", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureFixture);

      const pmd = result.primaryMarketDeployment;
      expect(pmd.summary.success).to.equal(true);
      expect(pmd.configuration.version).to.equal(1);
      expect(pmd.primaryMarketConfiguration.version).to.equal(1);
      expect(pmd.infrastructure.factoryPrimaryMarket.proxy).to.be.properAddress;
      expect(pmd.infrastructure.blr).to.have.property("proxy");
    });
  });

  // TimeTravel mode: GBP domain packages (Treasury, PrimaryMarket) don't have
  // TimeTravel facet variants. Only upstream ATS BOND facets support TimeTravel.
  // Enable these tests once GBP domains add TimeTravel facet support.
  describe.skip("TimeTravel Mode", () => {
    it("should deploy successfully with TimeTravel facets", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureTimeTravelFixture);

      expect(result.bondDeployment.summary.success).to.equal(true);
      expect(result.treasuryDeployment.summary.success).to.equal(true);
      expect(result.factorySuiteDeployment.summary.success).to.equal(true);
      expect(result.primaryMarketDeployment.summary.success).to.equal(true);
    });

    it("should deploy valid infrastructure in TimeTravel mode", async () => {
      const { result } = await loadFixture(deployGbpInfrastructureTimeTravelFixture);

      expect(result.proxyAdmin).to.be.properAddress;
      expect(result.blr).to.be.properAddress;
      expect(result.blrImplementationAddress).to.be.properAddress;
    });

    it("should register all configurations in TimeTravel mode", async () => {
      const { result, deployer } = await loadFixture(deployGbpInfrastructureTimeTravelFixture);

      const bondVersion = await getConfigVersion(result.blr, BOND_CONFIG_ID, deployer);
      const treasuryVersion = await getConfigVersion(result.blr, TREASURY_CONFIG_ID, deployer);
      const factorySuiteVersion = await getConfigVersion(result.blr, FACTORY_SUITE_CONFIG_ID, deployer);
      const factoryPMVersion = await getConfigVersion(result.blr, FACTORY_PRIMARY_MARKET_CONFIG_ID, deployer);
      const pmVersion = await getConfigVersion(result.blr, PRIMARY_MARKET_CONFIG_ID, deployer);

      expect(bondVersion).to.equal(1);
      expect(treasuryVersion).to.equal(1);
      expect(factorySuiteVersion).to.equal(1);
      expect(factoryPMVersion).to.equal(1);
      expect(pmVersion).to.equal(1);
    });
  });
});

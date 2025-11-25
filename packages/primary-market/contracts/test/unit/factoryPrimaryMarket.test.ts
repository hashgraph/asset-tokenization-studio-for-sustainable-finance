import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PRIMARY_MARKET_CONFIG_ID } from "@scripts/domain";
import { IFactoryPrimaryMarket, IBusinessLogicResolver, IAccessControl } from "@contract-types";
import { IPause, IPause__factory } from "@hashgraph/asset-tokenization-contracts";
import { deployFactoryPrimaryMarketSystem, PM_ROLES, ATS_ROLES } from "@scripts";
import { ADDRESS_ZERO, configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import { ethers } from "hardhat";
import { Signer } from "ethers";

let factoryPrimaryMarket: IFactoryPrimaryMarket;
let blr: IBusinessLogicResolver;
let accessControl: IAccessControl;
let pause: IPause;
let admin: Signer;
let unauthorized: Signer;
let adminAddress: string;
let RBACS: { role: string; members: string[] }[];
let RESOLVER_PROXY_CONFIG: { key: string; version: number };

describe("FactoryPrimaryMarket", () => {
  configureLogger({ level: LogLevel.SILENT });

  async function deployFixture() {
    const [deployer] = await ethers.getSigners();

    const deployment = await deployFactoryPrimaryMarketSystem(deployer, "hardhat", {
      useTimeTravel: false,
      saveOutput: false, // Don't save deployment files during tests
    });

    factoryPrimaryMarket = (await ethers.getContractAt(
      "IFactoryPrimaryMarket",
      deployment.infrastructure.factoryPrimaryMarket.proxy,
    )) as IFactoryPrimaryMarket;

    accessControl = (await ethers.getContractAt(
      "IAccessControl",
      deployment.infrastructure.factoryPrimaryMarket.proxy,
    )) as IAccessControl;

    blr = (await ethers.getContractAt(
      "IBusinessLogicResolver",
      deployment.infrastructure.blr.proxy,
    )) as IBusinessLogicResolver;

    await accessControl.grantRole(PM_ROLES.DEPLOYER_ROLE, adminAddress);
  }

  before(async () => {
    const signers = await ethers.getSigners();
    [, admin, , unauthorized] = signers;
    adminAddress = await admin.getAddress();
    RBACS = [
      {
        role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
        members: [adminAddress],
      },
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [adminAddress],
      },
    ];
    RESOLVER_PROXY_CONFIG = {
      key: PRIMARY_MARKET_CONFIG_ID,
      version: 0,
    };
  });

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("Deploying Primary Market", () => {
    it("GIVEN an unauthorized account WHEN deploying new primary market THEN fail", async () => {
      await expect(
        factoryPrimaryMarket.connect(unauthorized).deployPrimaryMarket(blr.address, RESOLVER_PROXY_CONFIG, RBACS),
      ).to.be.revertedWithCustomError(accessControl, "AccountHasNoRole");
    });

    it("GIVEN a resolver as address(0) WHEN deploying new primary market THEN fail", async () => {
      await expect(
        factoryPrimaryMarket.connect(admin).deployPrimaryMarket(ADDRESS_ZERO, RESOLVER_PROXY_CONFIG, RBACS),
      ).to.be.revertedWithCustomError(factoryPrimaryMarket, "InvalidResolverAddress");
    });

    it("GIVEN an rbac with empty/zero admin WHEN deploying new primary market THEN fail", async () => {
      const wrongRbac: any = [
        {
          role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
          members: [ADDRESS_ZERO],
        },
        {
          role: ATS_ROLES.PAUSER_ROLE,
          members: [adminAddress],
        },
        {
          role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
          members: [],
        },
      ];

      await expect(
        factoryPrimaryMarket.connect(admin).deployPrimaryMarket(blr.address, RESOLVER_PROXY_CONFIG, wrongRbac),
      ).to.be.revertedWithCustomError(factoryPrimaryMarket, "NoInitialAdmins");
    });

    it("GIVEN an rbac with no admin WHEN deploying new primary market THEN fail", async () => {
      const wrongRbac: any = [
        {
          role: ATS_ROLES.PAUSER_ROLE,
          members: [adminAddress],
        },
      ];

      await expect(
        factoryPrimaryMarket.connect(admin).deployPrimaryMarket(blr.address, RESOLVER_PROXY_CONFIG, wrongRbac),
      ).to.be.revertedWithCustomError(factoryPrimaryMarket, "NoInitialAdmins");
    });

    it("GIVEN an empty rbac WHEN deploying new primary market THEN fail", async () => {
      const wrongRbac: any = [];

      await expect(
        factoryPrimaryMarket.connect(admin).deployPrimaryMarket(blr.address, RESOLVER_PROXY_CONFIG, wrongRbac),
      ).to.be.revertedWithCustomError(factoryPrimaryMarket, "NoInitialAdmins");
    });

    it("GIVEN an authorized user WHEN deploying new primary market THEN success", async () => {
      const primaryMarketAddress = await factoryPrimaryMarket
        .connect(admin)
        .callStatic.deployPrimaryMarket(blr.address, RESOLVER_PROXY_CONFIG, RBACS);

      const tx = await factoryPrimaryMarket
        .connect(admin)
        .deployPrimaryMarket(blr.address, RESOLVER_PROXY_CONFIG, RBACS);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "PrimaryMarketDeployed");

      expect(event).to.not.be.undefined;
      expect(event?.args?.operator).to.equal(adminAddress);
      expect(event?.args?.primaryMarketAddress).to.equal(primaryMarketAddress);
      expect(event?.args?.resolver).to.equal(blr.address);
      expect(event?.args?.resolverProxyConfiguration.key).to.equal(RESOLVER_PROXY_CONFIG.key);
      expect(event?.args?.resolverProxyConfiguration.version).to.equal(RESOLVER_PROXY_CONFIG.version);
      for (let i = 0; i < RBACS.length; i++) {
        expect(event?.args?.rbacs[i].role).to.equal(RBACS[i].role);
        expect(event?.args?.rbacs[i].members).to.deep.equal(RBACS[i].members);
      }
    });

    it("GIVEN paused factory WHEN deploying new primary market THEN fail", async () => {
      // Grant PAUSER_ROLE to admin
      await accessControl.grantRole(ATS_ROLES.PAUSER_ROLE, adminAddress);

      // Pause the factory
      pause = IPause__factory.connect(factoryPrimaryMarket.address, admin);
      await pause.connect(admin).pause();

      await expect(
        factoryPrimaryMarket.connect(admin).deployPrimaryMarket(blr.address, RESOLVER_PROXY_CONFIG, RBACS),
      ).to.be.revertedWithCustomError(pause, "TokenIsPaused");
    });
  });
});

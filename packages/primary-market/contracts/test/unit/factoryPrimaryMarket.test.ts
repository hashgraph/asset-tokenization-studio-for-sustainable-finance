import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PRIMARY_MARKET_CONFIG_ID } from "@scripts/domain";
import { IFactoryPrimaryMarket, IBusinessLogicResolver, IAccessControl } from "@contracts";
import { DEFAULT_ADMIN_ROLE, deployFactoryPrimaryMarketSystem, PM_DEPLOYER_ROLE } from "@scripts";
import {
  ADDRESS_ZERO,
  HardhatProvider,
  configureLogger,
  LogLevel,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

let factoryPrimaryMarket: IFactoryPrimaryMarket;
let blr: IBusinessLogicResolver;
let accessControl: IAccessControl;
let admin: Signer;
let unauthorized: Signer;
let adminAddress: string;
let RBACS: { role: string; members: string[] }[];
let RESOLVER_PROXY_CONFIG: { key: string; version: number };

describe("FactoryPrimaryMarket", () => {
  configureLogger({ level: LogLevel.SILENT });

  async function deployFixture() {
    const provider = new HardhatProvider();

    const deployment = await deployFactoryPrimaryMarketSystem(provider, "hardhat", {
      useTimeTravel: false,
      saveOutput: false, // Don't save deployment files during tests
    });

    factoryPrimaryMarket = (await ethers.getContractAt(
      "FactoryPrimaryMarket",
      deployment.infrastructure.factoryPrimaryMarket.proxy,
    )) as IFactoryPrimaryMarket;

    accessControl = (await ethers.getContractAt(
      "AccessControl",
      deployment.infrastructure.factoryPrimaryMarket.proxy,
    )) as IAccessControl;

    blr = (await ethers.getContractAt(
      "IBusinessLogicResolver",
      deployment.infrastructure.blr.proxy,
    )) as IBusinessLogicResolver;

    await accessControl.grantRole(PM_DEPLOYER_ROLE, adminAddress);
  }

  before(async () => {
    const signers = await ethers.getSigners();
    [, admin, , unauthorized] = signers;
    adminAddress = await admin.getAddress();
    RBACS = [
      {
        role: DEFAULT_ADMIN_ROLE,
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
      ).to.be.revertedWithCustomError(factoryPrimaryMarket, "AccountHasNoRole");
    });

    it("GIVEN a resolver as address(0) WHEN deploying new primary market THEN fail", async () => {
      await expect(
        factoryPrimaryMarket.connect(admin).deployPrimaryMarket(ADDRESS_ZERO, RESOLVER_PROXY_CONFIG, RBACS),
      ).to.be.revertedWithCustomError(factoryPrimaryMarket, "InvalidResolverAddress");
    });

    it("GIVEN an empty rbac WHEN deploying new primary market THEN fail", async () => {
      const wrongRbac: any = [];

      await expect(
        factoryPrimaryMarket.connect(admin).deployPrimaryMarket(blr.address, RESOLVER_PROXY_CONFIG, wrongRbac),
      ).to.be.revertedWithCustomError(factoryPrimaryMarket, "NoInitialAdmins");
    });

    it("GIVEN an authorized user WHEN deploying new primary market THEN success", async () => {
      await expect(factoryPrimaryMarket.connect(admin).deployPrimaryMarket(blr.address, RESOLVER_PROXY_CONFIG, RBACS))
        .to.emit(factoryPrimaryMarket, "PrimaryMarketDeployed")
        .withArgs(adminAddress, anyValue, blr.address, anyValue, anyValue);
    });
  });
});

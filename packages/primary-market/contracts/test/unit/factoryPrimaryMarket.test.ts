import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PRIMARY_MARKET_CONFIG_ID } from "@scripts/domain";
import { IFactoryPrimaryMarket, IBusinessLogicResolver, IAccessControl } from "@contract-types";
import { IPause, IPause__factory } from "@hashgraph/asset-tokenization-contracts";
import { deployFactoryPrimaryMarketSystem, ATS_ROLES, PM_ROLES } from "@scripts";
import { ethers } from "hardhat";
import type { Signer } from "ethers";

function findEventInReceipt(receipt: any, eventName: string, iface: any): any {
  return receipt?.logs
    .map((log: any) => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e: any) => e?.name === eventName);
}

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
    await accessControl.grantRole(PM_ROLES.DEPLOYER_ROLE, adminAddress);
  });

  describe("Deploying Primary Market", () => {
    it("GIVEN an unauthorized account WHEN deploying new primary market THEN fail", async () => {
      await expect(
        factoryPrimaryMarket
          .connect(unauthorized)
          .deployPrimaryMarket(await blr.getAddress(), RESOLVER_PROXY_CONFIG, RBACS),
      ).to.be.revertedWithCustomError(accessControl, "AccountHasNoRole");
    });

    it("GIVEN a resolver as address(0) WHEN deploying new primary market THEN fail", async () => {
      await expect(
        factoryPrimaryMarket.connect(admin).deployPrimaryMarket(ethers.ZeroAddress, RESOLVER_PROXY_CONFIG, RBACS),
      ).to.be.revertedWithCustomError(factoryPrimaryMarket, "InvalidResolverAddress");
    });

    it("GIVEN an rbac with empty/zero admin WHEN deploying new primary market THEN fail", async () => {
      const wrongRbac: any = [
        {
          role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
          members: [ethers.ZeroAddress],
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
        factoryPrimaryMarket
          .connect(admin)
          .deployPrimaryMarket(await blr.getAddress(), RESOLVER_PROXY_CONFIG, wrongRbac),
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
        factoryPrimaryMarket
          .connect(admin)
          .deployPrimaryMarket(await blr.getAddress(), RESOLVER_PROXY_CONFIG, wrongRbac),
      ).to.be.revertedWithCustomError(factoryPrimaryMarket, "NoInitialAdmins");
    });

    it("GIVEN an empty rbac WHEN deploying new primary market THEN fail", async () => {
      const wrongRbac: any = [];

      await expect(
        factoryPrimaryMarket
          .connect(admin)
          .deployPrimaryMarket(await blr.getAddress(), RESOLVER_PROXY_CONFIG, wrongRbac),
      ).to.be.revertedWithCustomError(factoryPrimaryMarket, "NoInitialAdmins");
    });

    it("GIVEN an authorized user WHEN deploying new primary market THEN success", async () => {
      const primaryMarketAddress = await factoryPrimaryMarket
        .connect(admin)
        .deployPrimaryMarket.staticCall(await blr.getAddress(), RESOLVER_PROXY_CONFIG, RBACS);

      const tx = await factoryPrimaryMarket
        .connect(admin)
        .deployPrimaryMarket(await blr.getAddress(), RESOLVER_PROXY_CONFIG, RBACS);
      const receipt = await tx.wait();
      const event = findEventInReceipt(receipt, "PrimaryMarketDeployed", factoryPrimaryMarket.interface);

      expect(event).to.not.be.undefined;
      expect(event?.args[0]).to.equal(adminAddress);
      expect(event?.args[1]).to.equal(primaryMarketAddress);
      expect(event?.args[2]).to.equal(await blr.getAddress());
      expect(event?.args[3].key).to.equal(RESOLVER_PROXY_CONFIG.key);
      expect(event?.args[3].version).to.equal(RESOLVER_PROXY_CONFIG.version);
      for (let i = 0; i < RBACS.length; i++) {
        expect(event?.args[4][i].role).to.equal(RBACS[i].role);
        expect(event?.args[4][i].members).to.deep.equal(RBACS[i].members);
      }
    });

    it("GIVEN paused factory WHEN deploying new primary market THEN fail", async () => {
      // Grant PAUSER_ROLE to admin
      await accessControl.grantRole(ATS_ROLES.PAUSER_ROLE, adminAddress);

      // Pause the factory
      pause = IPause__factory.connect(await factoryPrimaryMarket.getAddress(), admin);
      await pause.connect(admin).pause();

      await expect(
        factoryPrimaryMarket.connect(admin).deployPrimaryMarket(await blr.getAddress(), RESOLVER_PROXY_CONFIG, RBACS),
      ).to.be.revertedWithCustomError(pause, "TokenIsPaused");
    });
  });
});

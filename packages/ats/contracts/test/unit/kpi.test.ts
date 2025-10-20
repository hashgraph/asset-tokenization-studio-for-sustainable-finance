import { Kpi } from "@contracts/contracts";
import { ProxyAdmin } from "@contracts/index";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { KPI_DATA_MANAGER_ROLE, PAUSER_ROLE } from "@scripts/constants";
import { deployProxyAdmin } from "@scripts/proxy/deployProxy";
import { getImplementationAddress } from "@scripts/utils";
import { IResolverProxy } from "@contracts/contracts/Kpi";
import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import { upgradeKpiProxy } from "@scripts/domain/kpi/upgradeKpi";
import { deployKpi } from "@scripts/domain/kpi/kpiDeploy";
import { HardhatProvider } from "@hashgraph/asset-tokenization-contracts/scripts";

describe("Kpi", () => {
  let kpi: Kpi;
  let proxyAdmin: ProxyAdmin;
  let unknownSigner: Signer;
  let owner: Signer;
  let rbac: IResolverProxy.RbacStruct[];

  async function deployFixture() {
    rbac = [
      {
        role: KPI_DATA_MANAGER_ROLE,
        members: [await owner.getAddress()],
      },
      { role: PAUSER_ROLE, members: [await owner.getAddress()] },
    ];
    proxyAdmin = await deployProxyAdmin();

    const provider = new HardhatProvider();
    kpi = (await deployKpi(provider, proxyAdmin, rbac)).kpi;
  }
  before(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
    unknownSigner = signers[signers.length - 1];
  });
  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("initialize", () => {
    it("cant initialize twice", async () => {
      await expect(kpi.initialize(rbac)).to.be.revertedWithCustomError(kpi, "AlreadyInitialized");
    });
  });

  describe("addKpiData", () => {
    it("successfully adds Kpi data emit KpiDataAdded", async () => {
      await expect(kpi.addKpiData(1, 100)).to.emit(kpi, "KpiDataAdded").withArgs(1, 100);
    });

    it("reverts with InvalidDate if date is 0", async () => {
      await expect(kpi.addKpiData(0, 100)).to.be.revertedWithCustomError(kpi, "InvalidDate");
    });
    it("reverts with InvalidDate if date is in the future", async () => {
      const now = Math.floor(Date.now() / 1000) + 1000;
      await expect(kpi.addKpiData(now, 100)).to.be.revertedWithCustomError(kpi, "InvalidDate");
    });

    it("reverts if not owner", async () => {
      await expect(kpi.connect(unknownSigner).addKpiData(1, 100)).to.be.revertedWithCustomError(
        kpi,
        "AccountHasNoRole",
      );
    });

    it("reverts if paused", async () => {
      await kpi.pause();
      await expect(kpi.addKpiData(1, 100)).to.be.revertedWithCustomError(kpi, "TokenIsPaused");
    });

    it("allows after unpause", async () => {
      await kpi.pause();
      await kpi.unpause();
      await expect(kpi.addKpiData(2, 200)).to.emit(kpi, "KpiDataAdded").withArgs(2, 200);
    });
  });
  describe("pause/unpause", () => {
    it("only owner can pause", async () => {
      await expect(kpi.connect(unknownSigner).pause()).to.be.revertedWithCustomError(kpi, "AccountHasNoRole");
      await expect(kpi.pause()).to.emit(kpi, "TokenPaused");
    });

    it("only owner can unpause", async () => {
      await kpi.pause();
      await expect(kpi.connect(unknownSigner).unpause()).to.be.revertedWithCustomError(kpi, "AccountHasNoRole");
      await expect(kpi.unpause()).to.emit(kpi, "TokenUnpaused");
    });

    it("pause disables addKpiData", async () => {
      await kpi.pause();
      await expect(kpi.addKpiData(1, 100)).to.be.revertedWithCustomError(kpi, "TokenIsPaused");
    });

    it("unpause enables addKpiData", async () => {
      await kpi.pause();
      await kpi.unpause();
      await expect(kpi.addKpiData(1, 100)).to.emit(kpi, "KpiDataAdded");
    });
  });
  describe("getKpiData", () => {
    async function addTestData() {
      await kpi.addKpiData(10, 100);
      await kpi.addKpiData(20, 200);
      await kpi.addKpiData(30, 300);
    }

    it("returns the aggregated value in range", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(10, 30);
      expect(agg.kpiAggregatedValue).to.equal(600);
    });

    it("returns 0 if no data in range", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(40, 50);
      expect(agg.kpiAggregatedValue).to.equal(0);
    });
    it("returns 0 if there are no Kpi records", async () => {
      const agg = await kpi.getKpiData(1, 100);
      expect(agg.kpiAggregatedValue).to.equal(0);
    });

    it("returns the aggregated value in range when the toDate is not the last", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(10, 20);
      expect(agg.kpiAggregatedValue).to.equal(300);
    });

    it("reverts with InvalidDate if fromDate is 0", async () => {
      await expect(kpi.getKpiData(0, 30)).to.be.revertedWithCustomError(kpi, "InvalidDate");
    });

    it("reverts with InvalidDate if toDate is 0", async () => {
      await expect(kpi.getKpiData(10, 0)).to.be.revertedWithCustomError(kpi, "InvalidDate");
    });

    it("reverts with InvalidDateRange if fromDate > toDate", async () => {
      await expect(kpi.getKpiData(30, 10)).to.be.revertedWithCustomError(kpi, "InvalidDateRange");
    });
  });

  describe("upgradability", () => {
    it("upgrades the implementation and preserves storage", async () => {
      await kpi.addKpiData(1, 123);
      const before = await kpi.getKpiData(1, 1);
      expect(before.kpiAggregatedValue).to.equal(123);
      const originalImplementationAddress = await getImplementationAddress(kpi.address);

      await upgradeKpiProxy(new HardhatProvider(), proxyAdmin, kpi.address);

      const newImplementationAddress = await getImplementationAddress(kpi.address);

      expect(newImplementationAddress).to.not.equal(originalImplementationAddress);

      const after = await kpi.getKpiData(1, 1);
      expect(after.kpiAggregatedValue).to.equal(123);

      await kpi.addKpiData(2, 200);
      const agg = await kpi.getKpiData(1, 2);
      expect(agg.kpiAggregatedValue).to.equal(323);
    });
  });
});

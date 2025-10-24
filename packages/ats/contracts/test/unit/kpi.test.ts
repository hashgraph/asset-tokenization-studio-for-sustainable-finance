import { Kpi } from "@contracts/contracts";
import { ProxyAdmin } from "@contracts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { KPI_DATA_MANAGER_ROLE, PAUSER_ROLE } from "@scripts/domain";
import { deployProxyAdmin } from "@scripts";
import { getImplementationAddress } from "@scripts";
import { IResolverProxy } from "@contracts/contracts/Kpi";
import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import { upgradeKpiProxy } from "@scripts/domain";
import { deployKpi } from "@scripts/domain";
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
    it("GIVEN KPI contract already initialized WHEN calling initialize again THEN fail with AlreadyInitialized", async () => {
      await expect(kpi.initialize(rbac)).to.be.revertedWithCustomError(kpi, "AlreadyInitialized");
    });
  });

  describe("addKpiData", () => {
    it("GIVEN valid date and value WHEN adding KPI data THEN success with KpiDataAdded event", async () => {
      await expect(kpi.addKpiData(1, 100)).to.emit(kpi, "KpiDataAdded").withArgs(1, 100);
    });

    it("GIVEN date is 0 WHEN adding KPI data THEN fail with InvalidDate", async () => {
      await expect(kpi.addKpiData(0, 100)).to.be.revertedWithCustomError(kpi, "InvalidDate");
    });
    it("GIVEN date is in the future WHEN adding KPI data THEN fail with InvalidDate", async () => {
      const now = Math.floor(Date.now() / 1000) + 1000;
      await expect(kpi.addKpiData(now, 100)).to.be.revertedWithCustomError(kpi, "InvalidDate");
    });

    it("GIVEN caller without KPI_DATA_MANAGER_ROLE WHEN adding KPI data THEN fail with AccountHasNoRole", async () => {
      await expect(kpi.connect(unknownSigner).addKpiData(1, 100)).to.be.revertedWithCustomError(
        kpi,
        "AccountHasNoRole",
      );
    });

    it("GIVEN contract is paused WHEN adding KPI data THEN fail with TokenIsPaused", async () => {
      await kpi.pause();
      await expect(kpi.addKpiData(1, 100)).to.be.revertedWithCustomError(kpi, "TokenIsPaused");
    });

    it("GIVEN contract was paused and then unpaused WHEN adding KPI data THEN success with KpiDataAdded event", async () => {
      await kpi.pause();
      await kpi.unpause();
      await expect(kpi.addKpiData(2, 200)).to.emit(kpi, "KpiDataAdded").withArgs(2, 200);
    });
  });
  describe("pause/unpause", () => {
    it("GIVEN owner and non-owner WHEN calling pause THEN success for owner and fail with AccountHasNoRole for non-owner", async () => {
      await expect(kpi.connect(unknownSigner).pause()).to.be.revertedWithCustomError(kpi, "AccountHasNoRole");
      await expect(kpi.pause()).to.emit(kpi, "TokenPaused");
    });

    it("GIVEN contract is paused and owner and non-owner WHEN calling unpause THEN success for owner and fail with AccountHasNoRole for non-owner", async () => {
      await kpi.pause();
      await expect(kpi.connect(unknownSigner).unpause()).to.be.revertedWithCustomError(kpi, "AccountHasNoRole");
      await expect(kpi.unpause()).to.emit(kpi, "TokenUnpaused");
    });

    it("GIVEN contract is paused WHEN calling addKpiData THEN fail with TokenIsPaused", async () => {
      await kpi.pause();
      await expect(kpi.addKpiData(1, 100)).to.be.revertedWithCustomError(kpi, "TokenIsPaused");
    });

    it("GIVEN contract was paused and then unpaused WHEN calling addKpiData THEN success with KpiDataAdded event", async () => {
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

    it("GIVEN KPI data exists in range WHEN calling getKpiData THEN success with aggregated value", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(10, 30);
      expect(agg.kpiAggregatedValue).to.equal(600);
    });

    it("GIVEN no KPI data in range WHEN calling getKpiData THEN success with zero value", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(40, 50);
      expect(agg.kpiAggregatedValue).to.equal(0);
    });
    it("GIVEN no KPI records exist WHEN calling getKpiData THEN success with zero value", async () => {
      const agg = await kpi.getKpiData(1, 100);
      expect(agg.kpiAggregatedValue).to.equal(0);
    });

    it("GIVEN KPI data exists and toDate is not the last WHEN calling getKpiData THEN success with aggregated value in range", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(10, 20);
      expect(agg.kpiAggregatedValue).to.equal(300);
    });

    it("GIVEN fromDate is 0 WHEN calling getKpiData THEN fail with InvalidDate", async () => {
      await expect(kpi.getKpiData(0, 30)).to.be.revertedWithCustomError(kpi, "InvalidDate");
    });

    it("GIVEN toDate is 0 WHEN calling getKpiData THEN fail with InvalidDate", async () => {
      await expect(kpi.getKpiData(10, 0)).to.be.revertedWithCustomError(kpi, "InvalidDate");
    });

    it("GIVEN fromDate greater than toDate WHEN calling getKpiData THEN fail with InvalidDateRange", async () => {
      await expect(kpi.getKpiData(30, 10)).to.be.revertedWithCustomError(kpi, "InvalidDateRange");
    });
  });

  describe("upgradability", () => {
    it("GIVEN KPI proxy with existing data WHEN upgrading implementation THEN success with preserved storage", async () => {
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

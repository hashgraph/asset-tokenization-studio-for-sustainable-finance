import { ethers } from "hardhat";
import { Signer } from "ethers";
import { expect } from "chai";
import { ProxyAdmin, Kpi } from "@contract-types";
import { IResolverProxy } from "@contract-types/contracts/Kpi";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ROLES, PAUSER_ROLE, upgradeKpiProxy, deployKpi } from "@scripts/domain";
import { getImplementationAddress } from "@scripts";
import { deployProxyAdmin } from "@hashgraph/asset-tokenization-contracts/scripts";

describe("Kpi", () => {
  let kpi: Kpi;
  let proxyAdmin: ProxyAdmin;
  let unknownSigner: Signer;
  let owner: Signer;
  let rbac: IResolverProxy.RbacStruct[];

  async function deployFixture() {
    rbac = [
      {
        role: ROLES.KPI_DATA_MANAGER_ROLE,
        members: [await owner.getAddress()],
      },
      { role: PAUSER_ROLE, members: [await owner.getAddress()] },
    ];
    proxyAdmin = await deployProxyAdmin(owner);

    kpi = (await deployKpi(owner, proxyAdmin, rbac)).kpi;
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

    it("Given date already exists WHEN adding KPI data THEN fail with KpiDataAlreadyExists", async () => {
      await kpi.addKpiData(1, 100);
      await expect(kpi.addKpiData(1, 300)).to.be.revertedWithCustomError(kpi, "KpiDataAlreadyExists");
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

    it("GIVEN KPI data added slightly out of order within retry window WHEN adding intermediate dates THEN data is correctly reordered and aggregation works", async () => {
      await kpi.addKpiData(100, 100);
      await kpi.addKpiData(200, 200);
      await kpi.addKpiData(300, 300);
      await kpi.addKpiData(500, 500);
      // Insert 400 within retry window (1 position back)
      await kpi.addKpiData(400, 400);

      expect(await kpi.getKpiData(100, 500)).to.equal(1500);
      expect(await kpi.getKpiData(300, 500)).to.equal(1200);
    });

    it("GIVEN multiple KPI entries WHEN inserting at beginning THEN data is correctly ordered", async () => {
      await kpi.addKpiData(200, 200);
      await kpi.addKpiData(300, 300);
      await kpi.addKpiData(400, 400);
      await kpi.addKpiData(500, 500);
      await kpi.addKpiData(600, 600);
      await kpi.addKpiData(700, 700);
      // Insert at beginning
      await expect(kpi.addKpiData(100, 100)).to.emit(kpi, "KpiDataAdded").withArgs(100, 100);
      expect(await kpi.getKpiData(100, 700)).to.equal(2800);
    });

    it("GIVEN multiple KPI entries WHEN inserting in middle THEN data is correctly reordered", async () => {
      await kpi.addKpiData(10, 100);
      await kpi.addKpiData(30, 300);
      await kpi.addKpiData(20, 200);

      expect(await kpi.getKpiData(10, 30)).to.equal(600);
      expect(await kpi.getKpiData(15, 25)).to.equal(200);
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
    [10, 20, 30]; //30 =>2
    it("GIVEN KPI data exists in range WHEN calling getKpiData THEN success with aggregated value", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(10, 30);
      expect(agg).to.equal(600);
    });

    it("GIVEN KPI data exists in range not exact WHEN calling getKpiData THEN success with aggregated value", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(10, 25);
      expect(agg).to.equal(300);
      const agg2 = await kpi.getKpiData(15, 30);
      expect(agg2).to.equal(500);
    });

    it("GIVEN KPI data one register exact range WHEN calling getKpiData THEN success with the unique value", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(10, 10);
      expect(agg).to.equal(100);
    });

    it("GIVEN KPI data one register wide range WHEN calling getKpiData THEN success with the unique value", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(1, 15);
      expect(agg).to.equal(100);
    });

    it("GIVEN KPI data range before timestamp WHEN calling getKpiData THEN success with zero value", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(1, 9);
      expect(agg).to.equal(0);
    });

    it("GIVEN no KPI data in range after timestamp WHEN calling getKpiData THEN success with zero value", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(40, 50);
      expect(agg).to.equal(0);
    });
		
    it("GIVEN no KPI records exist WHEN calling getKpiData THEN success with zero value", async () => {
      const agg = await kpi.getKpiData(1, 100);
      expect(agg).to.equal(0);
    });

    it("GIVEN KPI data exists and toDate is not the last WHEN calling getKpiData THEN success with aggregated value in range", async () => {
      await addTestData();
      const agg = await kpi.getKpiData(10, 20);
      expect(agg).to.equal(300);
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

    it("GIVEN KPI at exact fromDate boundary WHEN querying range THEN include fromDate value", async () => {
      await kpi.addKpiData(1, 100);
      await kpi.addKpiData(15, 150);
      await kpi.addKpiData(20, 200);
      // Query from 1 to 16 should include KPIs at 1 and 15
      const agg = await kpi.getKpiData(1, 16);
      expect(agg).to.equal(250); // 100 + 150
    });

    it("GIVEN KPI after fromDate boundary WHEN querying range THEN exclude data before fromDate", async () => {
      await kpi.addKpiData(1, 100);
      await kpi.addKpiData(15, 150);
      await kpi.addKpiData(20, 200);
      // Query from 2 to 16 should only include KPI at 15 (excludes 1, excludes 20)
      const agg = await kpi.getKpiData(2, 16);
      expect(agg).to.equal(150); // Only 15
    });

    it("GIVEN KPI at exact toDate boundary WHEN querying range THEN include toDate value", async () => {
      await kpi.addKpiData(1, 100);
      await kpi.addKpiData(15, 150);
      await kpi.addKpiData(20, 200);
      // Query from 10 to 20 should include KPIs at 15 and 20
      const agg = await kpi.getKpiData(10, 20);
      expect(agg).to.equal(350); // 150 + 200
    });

    it("GIVEN multiple KPIs WHEN fromDate and toDate are both non-exact THEN include only values within range", async () => {
      await kpi.addKpiData(5, 50);
      await kpi.addKpiData(10, 100);
      await kpi.addKpiData(15, 150);
      await kpi.addKpiData(20, 200);
      await kpi.addKpiData(25, 250);
      // Query from 8 to 22 should include 10, 15, 20 (exclude 5 and 25)
      const agg = await kpi.getKpiData(8, 22);
      expect(agg).to.equal(450); // 100 + 150 + 200
    });

    it("GIVEN fromDate equals toDate with NO exact data WHEN querying THEN return zero", async () => {
      await kpi.addKpiData(10, 100);
      await kpi.addKpiData(20, 200);
      // Query for timestamp 15 (between 10 and 20, but no data at 15)
      const agg = await kpi.getKpiData(15, 15);
      expect(agg).to.equal(0);
    });

    it("GIVEN single KPI data point WHEN querying ranges around it THEN only include when in range", async () => {
      await kpi.addKpiData(100, 1000);
      // Before the data point
      expect(await kpi.getKpiData(1, 99)).to.equal(0);
      // Exactly at the data point
      expect(await kpi.getKpiData(100, 100)).to.equal(1000);
      // Range including the data point
      expect(await kpi.getKpiData(50, 150)).to.equal(1000);
      // After the data point
      expect(await kpi.getKpiData(101, 200)).to.equal(0);
    });

    it("GIVEN data at boundaries WHEN querying exact boundaries THEN include boundary values", async () => {
      await kpi.addKpiData(10, 100);
      await kpi.addKpiData(20, 200);
      await kpi.addKpiData(30, 300);
      // Exact match at both boundaries
      expect(await kpi.getKpiData(10, 30)).to.equal(600);
      // First boundary exact, second not
      expect(await kpi.getKpiData(10, 25)).to.equal(300);
      // First boundary not exact, second exact
      expect(await kpi.getKpiData(15, 30)).to.equal(500);
    });
  });

  describe("setMinValidDate", () => {
    it("GIVEN admin WHEN setting minValidDate THEN success with MinValidDateUpdated event", async () => {
      const minDate = 1000;
      await expect(kpi.setMinValidDate(minDate)).to.emit(kpi, "MinValidDateUpdated").withArgs(minDate);
    });

    it("GIVEN non-admin WHEN setting minValidDate THEN fail with AccountHasNoRole", async () => {
      await expect(kpi.connect(unknownSigner).setMinValidDate(1000)).to.be.revertedWithCustomError(
        kpi,
        "AccountHasNoRole",
      );
    });

    it("GIVEN minValidDate is set WHEN adding KPI data before minimum THEN fail with DateBeforeMinimum", async () => {
      const minDate = 1000;
      await kpi.setMinValidDate(minDate);
      await expect(kpi.addKpiData(999, 100)).to.be.revertedWithCustomError(kpi, "DateBeforeMinimum").withArgs(999, minDate);
    });

    it("GIVEN minValidDate is set WHEN adding KPI data at exact minimum THEN success", async () => {
      const minDate = 1000;
      await kpi.setMinValidDate(minDate);
      await expect(kpi.addKpiData(1000, 100)).to.emit(kpi, "KpiDataAdded").withArgs(1000, 100);
    });

    it("GIVEN minValidDate is set WHEN adding KPI data after minimum THEN success", async () => {
      const minDate = 1000;
      await kpi.setMinValidDate(minDate);
      await expect(kpi.addKpiData(2000, 200)).to.emit(kpi, "KpiDataAdded").withArgs(2000, 200);
    });

    it("GIVEN minValidDate is set to 0 WHEN adding KPI data with any valid past date THEN success", async () => {
      await kpi.setMinValidDate(1000);
      await kpi.setMinValidDate(0); // Disable minimum
      await expect(kpi.addKpiData(100, 100)).to.emit(kpi, "KpiDataAdded").withArgs(100, 100);
    });

    it("GIVEN contract is paused WHEN setting minValidDate THEN fail with TokenIsPaused", async () => {
      await kpi.pause();
      await expect(kpi.setMinValidDate(1000)).to.be.revertedWithCustomError(kpi, "TokenIsPaused");
    });
  });

  describe("upgradability", () => {
    it("GIVEN KPI proxy with existing data WHEN upgrading implementation THEN success with preserved storage", async () => {
      await kpi.addKpiData(1, 123);
      const before = await kpi.getKpiData(1, 1);
      expect(before).to.equal(123);
      const originalImplementationAddress = await getImplementationAddress(kpi.address);

      await upgradeKpiProxy(owner, proxyAdmin, kpi.address);

      const newImplementationAddress = await getImplementationAddress(kpi.address);

      expect(newImplementationAddress).to.not.equal(originalImplementationAddress);

      const after = await kpi.getKpiData(1, 1);
      expect(after).to.equal(123);

      await kpi.addKpiData(2, 200);
      const agg = await kpi.getKpiData(1, 2);
      expect(agg).to.equal(323);
    });
  });
});

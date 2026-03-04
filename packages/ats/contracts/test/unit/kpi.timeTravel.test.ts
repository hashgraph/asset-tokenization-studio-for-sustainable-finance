import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ROLES, PAUSER_ROLE } from "@scripts/domain";
import { deployProxyAdmin } from "@hashgraph/asset-tokenization-contracts/scripts";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { KpiTimeTravel__factory, TransparentUpgradeableProxy__factory } from "@contract-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * TimeTravel tests for KPI contract - validates time-dependent logic with deterministic timestamps
 *
 * Uses KpiTimeTravel contract variant to mock blockchain timestamps and test:
 * - Past date validation (date < block.timestamp)
 * - Future date rejection (date >= block.timestamp)
 * - TimeTravel state transitions with advancing blockchain time
 */
describe("Kpi - TimeTravel Tests", () => {
  let kpiTimeTravel: Contract;
  let owner: HardhatEthersSigner;
  let unknownSigner: Signer;
  let rbac: any;

  const MOCK_CURRENT_TIME = 1000000;
  const PAST_DATE = MOCK_CURRENT_TIME - 1;
  const CURRENT_DATE = MOCK_CURRENT_TIME;
  const FUTURE_DATE = MOCK_CURRENT_TIME + 1000;

  async function deployFixture() {
    const ownerAddress = await owner.getAddress();
    rbac = [
      {
        role: ROLES.KPI_DATA_MANAGER_ROLE,
        members: [ownerAddress],
      },
      { role: PAUSER_ROLE, members: [ownerAddress] },
    ];

    const proxyAdmin = await deployProxyAdmin(owner);
    const kpiLogic = await new KpiTimeTravel__factory(owner).deploy();
    await kpiLogic.waitForDeployment();

    const initData = kpiLogic.interface.encodeFunctionData("initialize", [rbac]);

    const proxy = await new TransparentUpgradeableProxy__factory(owner).deploy(
      await kpiLogic.getAddress(),
      await proxyAdmin.getAddress(),
      initData,
    );
    await proxy.waitForDeployment();

    const kpiProxy = KpiTimeTravel__factory.connect(await proxy.getAddress(), owner);
    await kpiProxy.changeSystemTimestamp(MOCK_CURRENT_TIME);

    return kpiProxy;
  }

  before(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
    unknownSigner = signers[signers.length - 1];
  });

  beforeEach(async () => {
    kpiTimeTravel = (await loadFixture(deployFixture)) as Contract;
  });

  describe("addKpiData - Time Boundary Validation", () => {
    it("GIVEN date is 1 second in the past WHEN adding KPI data THEN success", async () => {
      await expect(kpiTimeTravel.addKpiData(PAST_DATE, 100))
        .to.emit(kpiTimeTravel, "KpiDataAdded")
        .withArgs(PAST_DATE, 100);
    });

    it("GIVEN date equals current blockchain time WHEN adding KPI data THEN fail with InvalidDate", async () => {
      await expect(kpiTimeTravel.addKpiData(CURRENT_DATE, 100)).to.be.revertedWithCustomError(
        kpiTimeTravel,
        "InvalidDate",
      );
    });

    it("GIVEN date is in the future WHEN adding KPI data THEN fail with InvalidDate", async () => {
      await expect(kpiTimeTravel.addKpiData(FUTURE_DATE, 100)).to.be.revertedWithCustomError(
        kpiTimeTravel,
        "InvalidDate",
      );
    });

    it("GIVEN date far in the past WHEN adding KPI data THEN success", async () => {
      const farPastDate = 1;
      await expect(kpiTimeTravel.addKpiData(farPastDate, 100))
        .to.emit(kpiTimeTravel, "KpiDataAdded")
        .withArgs(farPastDate, 100);
    });
  });

  describe("addKpiData - TimeTravel State Transitions", () => {
    it("GIVEN future date rejected initially WHEN blockchain time advances THEN date becomes valid", async () => {
      const targetDate = MOCK_CURRENT_TIME + 500;

      await expect(kpiTimeTravel.addKpiData(targetDate, 100)).to.be.revertedWithCustomError(
        kpiTimeTravel,
        "InvalidDate",
      );

      await kpiTimeTravel.changeSystemTimestamp(MOCK_CURRENT_TIME + 1000);

      await expect(kpiTimeTravel.addKpiData(targetDate, 100))
        .to.emit(kpiTimeTravel, "KpiDataAdded")
        .withArgs(targetDate, 100);
    });

    it("GIVEN multiple future dates WHEN blockchain time advances past all dates THEN all become valid", async () => {
      const date1 = MOCK_CURRENT_TIME + 100;
      const date2 = MOCK_CURRENT_TIME + 200;
      const date3 = MOCK_CURRENT_TIME + 300;

      await expect(kpiTimeTravel.addKpiData(date1, 100)).to.be.revertedWithCustomError(kpiTimeTravel, "InvalidDate");

      await kpiTimeTravel.changeSystemTimestamp(MOCK_CURRENT_TIME + 500);

      await expect(kpiTimeTravel.addKpiData(date1, 100)).to.emit(kpiTimeTravel, "KpiDataAdded").withArgs(date1, 100);

      await expect(kpiTimeTravel.addKpiData(date2, 200)).to.emit(kpiTimeTravel, "KpiDataAdded").withArgs(date2, 200);

      await expect(kpiTimeTravel.addKpiData(date3, 300)).to.emit(kpiTimeTravel, "KpiDataAdded").withArgs(date3, 300);
    });

    it("GIVEN time advanced past target date WHEN adding KPI data for that date THEN success", async () => {
      const targetDate = 1500000;

      await kpiTimeTravel.changeSystemTimestamp(targetDate - 1);
      await expect(kpiTimeTravel.addKpiData(targetDate, 100)).to.be.revertedWithCustomError(
        kpiTimeTravel,
        "InvalidDate",
      );

      await kpiTimeTravel.changeSystemTimestamp(targetDate + 1);
      await expect(kpiTimeTravel.addKpiData(targetDate, 100))
        .to.emit(kpiTimeTravel, "KpiDataAdded")
        .withArgs(targetDate, 100);
    });
  });

  describe("addKpiData - Time Reset Scenarios", () => {
    it("GIVEN system time reset WHEN adding KPI data with past timestamp THEN success", async () => {
      await kpiTimeTravel.addKpiData(PAST_DATE, 100);

      await kpiTimeTravel.resetSystemTimestamp();
      await kpiTimeTravel.changeSystemTimestamp(MOCK_CURRENT_TIME + 10000);

      const farPastDate = MOCK_CURRENT_TIME - 5000;
      await expect(kpiTimeTravel.addKpiData(farPastDate, 200))
        .to.emit(kpiTimeTravel, "KpiDataAdded")
        .withArgs(farPastDate, 200);
    });
  });

  describe("getKpiData - Time-Dependent Range Queries", () => {
    it("GIVEN KPI data added at specific past dates WHEN querying in TimeTravel THEN success with aggregated values", async () => {
      const date1 = MOCK_CURRENT_TIME - 1000;
      const date2 = MOCK_CURRENT_TIME - 500;
      const date3 = MOCK_CURRENT_TIME - 100;

      await kpiTimeTravel.addKpiData(date1, 100);
      await kpiTimeTravel.addKpiData(date2, 200);
      await kpiTimeTravel.addKpiData(date3, 300);

      const result = await kpiTimeTravel.getKpiData(date1, date3);
      expect(result.kpiAggregatedValue).to.equal(600);
    });

    it("GIVEN future dates initially not addable WHEN time advances WHEN querying THEN includes all aggregated data", async () => {
      const date1 = MOCK_CURRENT_TIME - 1000;
      const date2 = MOCK_CURRENT_TIME + 500;

      await kpiTimeTravel.addKpiData(date1, 100);
      await expect(kpiTimeTravel.addKpiData(date2, 200)).to.be.revertedWithCustomError(kpiTimeTravel, "InvalidDate");

      await kpiTimeTravel.changeSystemTimestamp(MOCK_CURRENT_TIME + 1000);
      await kpiTimeTravel.addKpiData(date2, 200);

      const result = await kpiTimeTravel.getKpiData(date1, date2);
      expect(result.kpiAggregatedValue).to.equal(300);
    });
  });

  describe("addKpiData - Access Control with TimeTravel", () => {
    it("GIVEN caller without KPI_DATA_MANAGER_ROLE WHEN adding KPI data THEN fail regardless of time validity", async () => {
      await expect(kpiTimeTravel.connect(unknownSigner).addKpiData(PAST_DATE, 100)).to.be.revertedWithCustomError(
        kpiTimeTravel,
        "AccountHasNoRole",
      );
    });

    it("GIVEN contract paused WHEN adding KPI data THEN fail regardless of time validity", async () => {
      await kpiTimeTravel.pause();
      await expect(kpiTimeTravel.addKpiData(PAST_DATE, 100)).to.be.revertedWithCustomError(
        kpiTimeTravel,
        "TokenIsPaused",
      );
    });
  });

  describe("Edge Cases - Zero and Boundary Values", () => {
    it("GIVEN date is 0 WHEN adding KPI data THEN fail with InvalidDate", async () => {
      await expect(kpiTimeTravel.addKpiData(0, 100)).to.be.revertedWithCustomError(kpiTimeTravel, "InvalidDate");
    });

    it("GIVEN very large timestamp WHEN adding KPI data THEN success if in past", async () => {
      const veryLargeDate = MOCK_CURRENT_TIME - 1;
      await expect(kpiTimeTravel.addKpiData(veryLargeDate, 100))
        .to.emit(kpiTimeTravel, "KpiDataAdded")
        .withArgs(veryLargeDate, 100);
    });

    it("GIVEN blockchain time set to very large timestamp WHEN adding far past date THEN success", async () => {
      const veryLargeTime = 10_000_000_000;
      const pastDate = veryLargeTime - 1000;

      await kpiTimeTravel.changeSystemTimestamp(veryLargeTime);
      await expect(kpiTimeTravel.addKpiData(pastDate, 100))
        .to.emit(kpiTimeTravel, "KpiDataAdded")
        .withArgs(pastDate, 100);
    });
  });
});

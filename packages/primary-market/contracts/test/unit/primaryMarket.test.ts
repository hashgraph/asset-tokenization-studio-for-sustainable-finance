import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { PRIMARY_MARKET_CONFIG_ID } from "@scripts/domain";
import { IFactoryPrimaryMarket, IBusinessLogicResolver, IAccessControl, IPrimaryMarket } from "@contract-types";
import { IPause } from "@hashgraph/asset-tokenization-contracts";
import { deployFactoryPrimaryMarketSystem, PM_ROLES, ATS_ROLES } from "@scripts";
import { ADDRESS_ZERO, configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ITimeTravel } from "@hashgraph/asset-tokenization-contracts";
import { INT64_MAX, HEDERA_PRECOMPILED_ADDRESS } from "../constants";

// Contracts
let primaryMarket: IPrimaryMarket;
let primaryMarketTimeTravel: ITimeTravel;
let factoryPrimaryMarket: IFactoryPrimaryMarket;
let blr: IBusinessLogicResolver;
let accessControl: IAccessControl;
let pause: IPause;

// Signers
let admin: Signer;
let offeringCreator: Signer;
let investor1: Signer;
let investor2: Signer;
let investor3: Signer;
let treasury: Signer;

// Addresses
let adminAddress: string;
let offeringCreatorAddress: string;
let investor1Address: string;
let investor2Address: string;
let investor3Address: string;
let treasuryAddress: string;
let primaryMarketAddress: string;

// Mock contracts
let mockAsset: Contract;
let mockPaymentToken: Contract;
let mockPrecompiled: Contract;

describe("PrimaryMarket", () => {
  configureLogger({ level: LogLevel.SILENT });

  async function deployPrecompiledMock() {
    const PrecompiledMockContract = await ethers.getContractFactory("PrecompiledMock");

    const deployed = await PrecompiledMockContract.deploy();
    await deployed.deployed();

    const runtimeBytecode = await ethers.provider.getCode(deployed.address);
    await ethers.provider.send("hardhat_setCode", [HEDERA_PRECOMPILED_ADDRESS, runtimeBytecode]);
    mockPrecompiled = await ethers.getContractAt("PrecompiledMock", HEDERA_PRECOMPILED_ADDRESS);

    await mockPrecompiled.setPrecompiledTransferStatus(true);
    await mockPrecompiled.setPrecompiledAssociationStatus(true);
  }

  async function deployFixture() {
    const [deployer] = await ethers.getSigners();

    await deployPrecompiledMock();

    // Deploy factory system
    const deployment = await deployFactoryPrimaryMarketSystem(deployer, "hardhat", {
      useTimeTravel: true,
      saveOutput: false,
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

    // Grant PM_DEPLOYER_ROLE to admin
    await accessControl.grantRole(PM_ROLES.DEPLOYER_ROLE, adminAddress);

    // Deploy Primary Market instance
    const RBACS = [
      {
        role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
        members: [adminAddress],
      },
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [adminAddress],
      },
      {
        role: PM_ROLES.OFFERING_CREATOR_ROLE,
        members: [offeringCreatorAddress],
      },
    ];

    const RESOLVER_PROXY_CONFIG = {
      key: PRIMARY_MARKET_CONFIG_ID,
      version: 0,
    };

    const tx = await factoryPrimaryMarket.connect(admin).deployPrimaryMarket(blr.address, RESOLVER_PROXY_CONFIG, RBACS);

    const receipt = await tx.wait();

    // Find PrimaryMarketDeployed event
    const event = receipt.events?.find((e: any) => e.event === "PrimaryMarketDeployed");
    if (!event || !event.args) {
      throw new Error("PrimaryMarketDeployed event not found");
    }

    primaryMarketAddress = event.args.primaryMarketAddress;
    primaryMarket = (await ethers.getContractAt("PrimaryMarket", primaryMarketAddress)) as IPrimaryMarket;
    primaryMarketTimeTravel = (await ethers.getContractAt("ITimeTravel", primaryMarketAddress)) as ITimeTravel;
    pause = (await ethers.getContractAt("Pause", primaryMarketAddress)) as IPause;

    // Deploy mock tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockPaymentToken = await MockERC20.deploy("Mock USDC", "USDC", 6);
    await mockPaymentToken.deployed();

    const MockBond = await ethers.getContractFactory("MockBond");
    mockAsset = await MockBond.deploy("Green Bond", "GB", treasuryAddress);
    await mockAsset.deployed();

    // Mint payment tokens to investors
    await mockPaymentToken.mint(investor1Address, ethers.constants.MaxUint256.div(4));
    await mockPaymentToken.mint(investor2Address, ethers.constants.MaxUint256.div(4));
    await mockPaymentToken.mint(investor3Address, ethers.constants.MaxUint256.div(4));

    // Approve Primary Market to spend payment tokens
    await mockPaymentToken.connect(investor1).approve(primaryMarket.address, ethers.constants.MaxUint256);
    await mockPaymentToken.connect(investor2).approve(primaryMarket.address, ethers.constants.MaxUint256);

    return {
      factoryPrimaryMarket,
      accessControl,
      blr,
      primaryMarket,
      mockPaymentToken,
      mockAsset,
    };
  }

  before(async () => {
    const signers = await ethers.getSigners();
    [, admin, offeringCreator, investor1, investor2, investor3, treasury] = signers;
    adminAddress = await admin.getAddress();
    offeringCreatorAddress = await offeringCreator.getAddress();
    investor1Address = await investor1.getAddress();
    investor2Address = await investor2.getAddress();
    investor3Address = await investor3.getAddress();
    treasuryAddress = await treasury.getAddress();
  });

  beforeEach(async () => {
    const fixtures = await deployFixture();
    factoryPrimaryMarket = fixtures.factoryPrimaryMarket;
    accessControl = fixtures.accessControl;
    blr = fixtures.blr;
    primaryMarket = fixtures.primaryMarket;
    mockPaymentToken = fixtures.mockPaymentToken;
    mockAsset = fixtures.mockAsset;
  });

  describe("Creating Offerings", () => {
    it("GIVEN valid offering params WHEN creating offering THEN success", async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6), // 1000 USDC worth per lot
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0, // OVERSUBSCRIPTION_NOT_ALLOWED
        startDate: now + 60, // Starts in 1 minute
        endDate: now + 3600, // Ends in 1 hour
        deadlineRule: 0, // WAIT_UNTIL_END
        price: 0, // Will use bond's nominal value
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering))
        .to.emit(primaryMarket, "OfferingCreated")
        .withArgs(1, offeringCreatorAddress, anyValue);

      const total = await primaryMarket.getTotalOfferings();
      expect(total).to.equal(1);

      const [offeringInfo, creator, totalLots, pendingLots] = await primaryMarket.getOffering(1);
      expect(offeringInfo.asset).to.equal(offering.asset);
      expect(offeringInfo.treasury).to.equal(offering.treasury);
      expect(offeringInfo.paymentToken).to.equal(offering.paymentToken);
      expect(offeringInfo.lotSize).to.equal(offering.lotSize);
      expect(offeringInfo.minLots).to.equal(offering.minLots);
      expect(offeringInfo.maxLots).to.equal(offering.maxLots);
      expect(offeringInfo.targetLots).to.equal(offering.targetLots);
      expect(offeringInfo.targetQuantityRule).to.equal(offering.targetQuantityRule);
      expect(offeringInfo.startDate).to.equal(offering.startDate);
      expect(offeringInfo.endDate).to.equal(offering.endDate);
      expect(offeringInfo.deadlineRule).to.equal(offering.deadlineRule);
      expect(creator).to.equal(offeringCreatorAddress);
      expect(totalLots).to.equal(0);
      expect(pendingLots).to.equal(0);
    });

    it("GIVEN an offering with a payment token that cannot be associated WHEN creating offering THEN fail", async () => {
      const now = await time.latest();

      await mockPrecompiled.setPrecompiledAssociationStatus(false);

      const offering: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6), // 1000 USDC worth per lot
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0, // OVERSUBSCRIPTION_NOT_ALLOWED
        startDate: now + 60, // Starts in 1 minute
        endDate: now + 3600, // Ends in 1 hour
        deadlineRule: 0, // WAIT_UNTIL_END
        price: 0, // Will use bond's nominal value
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering)).to.be.revertedWithCustomError(
        primaryMarket,
        "AssociationFailed",
      );
    });

    it("GIVEN paused PM WHEN creating offering THEN fail", async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6), // 1000 USDC worth per lot
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0, // OVERSUBSCRIPTION_NOT_ALLOWED
        startDate: now + 60, // Starts in 1 minute
        endDate: now + 3600, // Ends in 1 hour
        deadlineRule: 0, // WAIT_UNTIL_END
        price: 0, // Will use bond's nominal value
      };

      await pause.connect(admin).pause();

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering)).to.be.revertedWithCustomError(
        pause,
        "TokenIsPaused",
      );
    });

    it("GIVEN invalid asset address WHEN creating offering THEN fail", async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
        asset: ADDRESS_ZERO,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering))
        .to.be.revertedWithCustomError(primaryMarket, "WrongAsset")
        .withArgs(offering.asset);
    });

    it("GIVEN invalid treasury address WHEN creating offering THEN fail", async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: ADDRESS_ZERO,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering))
        .to.be.revertedWithCustomError(primaryMarket, "WrongTreasury")
        .withArgs(offering.treasury);
    });

    it("GIVEN invalid payment token address WHEN creating offering THEN fail", async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: ADDRESS_ZERO,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering))
        .to.be.revertedWithCustomError(primaryMarket, "WrongPaymentToken")
        .withArgs(offering.paymentToken);
    });

    it("GIVEN star date bigger or equal than end date address WHEN creating offering THEN fail", async () => {
      const now = await time.latest();
      const offering_1: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now + 3600,
        endDate: now + 60,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering_1))
        .to.be.revertedWithCustomError(primaryMarket, "WrongDates")
        .withArgs(offering_1.startDate, offering_1.endDate);

      const offering_2: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now + 3600,
        endDate: now + 3600,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering_2))
        .to.be.revertedWithCustomError(primaryMarket, "WrongDates")
        .withArgs(offering_2.startDate, offering_2.endDate);
    });

    it("GIVEN start date less than current date address WHEN creating offering THEN fail", async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now - 3600,
        endDate: now + 60,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering))
        .to.be.revertedWithCustomError(primaryMarket, "WrongDates")
        .withArgs(offering.startDate, offering.endDate);
    });

    it("GIVEN lots equal to 0  WHEN creating offering THEN fail", async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: 0,
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering))
        .to.be.revertedWithCustomError(primaryMarket, "WrongQuantities")
        .withArgs(offering.lotSize, offering.minLots, offering.maxLots, offering.targetLots);

      const offering_2: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 0,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering_2))
        .to.be.revertedWithCustomError(primaryMarket, "WrongQuantities")
        .withArgs(offering_2.lotSize, offering_2.minLots, offering_2.maxLots, offering_2.targetLots);

      const offering_3: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 0,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering_3))
        .to.be.revertedWithCustomError(primaryMarket, "WrongQuantities")
        .withArgs(offering_3.lotSize, offering_3.minLots, offering_3.maxLots, offering_3.targetLots);

      const offering_4: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 0,
        targetQuantityRule: 0,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering_4))
        .to.be.revertedWithCustomError(primaryMarket, "WrongQuantities")
        .withArgs(offering_4.lotSize, offering_4.minLots, offering_4.maxLots, offering_4.targetLots);
    });

    it("GIVEN minLots larger than maxLots WHEN creating offering THEN fail", async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 50,
        maxLots: 1,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering))
        .to.be.revertedWithCustomError(primaryMarket, "WrongQuantities")
        .withArgs(offering.lotSize, offering.minLots, offering.maxLots, offering.targetLots);
    });

    it("GIVEN invalid rule combination WHEN creating offering THEN fail", async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 1, // OVERSUBSCRIPTION_ALLOWED
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 1, // CLOSE_TARGET_REACHED - Invalid combination
        price: 0,
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering))
        .to.be.revertedWithCustomError(primaryMarket, "InvalidRuleCombination")
        .withArgs(offering.targetQuantityRule, offering.deadlineRule);
    });

    it("GIVEN unauthorized account WHEN creating offering THEN fail", async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0,
        price: 0,
      };

      await expect(primaryMarket.connect(investor1).createOffering(offering)).to.be.revertedWithCustomError(
        primaryMarket,
        "AccountHasNoRole",
      );
    });
  });

  describe("Offering Status Transitions", () => {
    let offeringId: number;
    let offering: IPrimaryMarket.OfferingStruct;

    beforeEach(async () => {
      const now = await time.latest();
      offering = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0, // OVERSUBSCRIPTION_NOT_ALLOWED
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0, // WAIT_UNTIL_END
        price: 0,
      };

      const tx = await primaryMarket.connect(offeringCreator).createOffering(offering);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "OfferingCreated");
      offeringId = event?.args?.offeringId?.toNumber() || 0; // Get offeringId from event
    });

    it("GIVEN offering with OVERSUBSCRIPTION_ALLOWED + WAIT_UNTIL_END WHEN target reached and during offering period THEN OPEN", async () => {
      const now = await time.latest();
      const offering2: IPrimaryMarket.OfferingStruct = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 1, // OVERSUBSCRIPTION_ALLOWED
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0, // WAIT_UNTIL_END
        price: 0,
      };

      const tx = await primaryMarket.connect(offeringCreator).createOffering(offering2);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "OfferingCreated");
      const offering2Id = event?.args?.offeringId?.toNumber() || 0;

      await primaryMarketTimeTravel.changeSystemTimestamp(offering2.startDate + 1);

      // Reach target
      const iterations = offering2.targetLots / offering2.maxLots;
      for (let i = 0; i < iterations; i++) {
        await primaryMarket.connect(investor1).submitSubscription(offering2Id, offering2.maxLots);
      }

      // Status should still be OPEN (accepts oversubscriptions)
      const status = await primaryMarket.getOfferingStatus(offering2Id);
      expect(status).to.equal(1); // OPEN
    });

    async function reachTarget() {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate + 1);

      const iterations = offering.targetLots / offering.maxLots;

      for (let i = 0; i < iterations; i++) {
        await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.maxLots);
      }

      const remainder = offering.targetLots - iterations * offering.maxLots;
      if (remainder > 0) await primaryMarket.connect(investor1).submitSubscription(offeringId, remainder);
    }

    it("GIVEN offering before startDate WHEN checking status THEN PENDING", async () => {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate - 1);
      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(0); // PENDING
    });

    it("GIVEN offering after startDate WHEN checking status THEN OPEN", async () => {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate + 1);
      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(1); // OPEN
    });

    it("GIVEN OVERSUBSCRIPTION_NOT_ALLOWED + WAIT_UNTIL_END WHEN target reached THEN CLOSED", async () => {
      await reachTarget();

      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(2); // CLOSED
    });

    it("GIVEN target reached and past endDate WHEN checking status THEN EXECUTABLE", async () => {
      await reachTarget();

      // Move past endDate
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(3); // EXECUTABLE
    });

    it("GIVEN target not reached and past endDate WHEN checking status THEN CANCELLABLE", async () => {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate + 1);

      // Subscribe but don't reach target (only 30 lots out of 100)
      await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.minLots);

      // Move past endDate
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(4); // CANCELLABLE
    });

    it("GIVEN target not reached and past endDate with all subscriptions cancelled WHEN checking status THEN CANCELLED", async () => {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate + 1);

      // Subscribe but don't reach target
      await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.minLots);

      // Cancel the subscription while offering is still active
      await primaryMarket.connect(offeringCreator).cancelSubscription(offeringId, 1);

      // Move past endDate
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      // Status should be CANCELLED (pendingSubscribedLots = 0)
      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(6); // CANCELLED
    });
  });

  describe("Submitting Subscriptions", () => {
    let offeringId: number;
    let offering: IPrimaryMarket.OfferingStruct;

    async function createOffering(targetQuantityRule: number, deadlineRule: number) {
      const now = await time.latest();
      offering = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: targetQuantityRule,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: deadlineRule,
        price: 0,
      };

      const tx = await primaryMarket.connect(offeringCreator).createOffering(offering);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "OfferingCreated");
      offeringId = event?.args?.offeringId?.toNumber() || 0; // Get offeringId from event
      await time.increase(61); // Move past startDate
    }

    beforeEach(async () => {
      await createOffering(0, 0);
    });

    it("GIVEN valid subscription WHEN submitting THEN success", async () => {
      const lotsUnit = offering.minLots + 1;

      const balanceInvestorBefore = await mockPaymentToken.balanceOf(investor1Address);
      const balancePMBefore = await mockPaymentToken.balanceOf(primaryMarket.address);
      const nominalValue = (await mockAsset.getBondDetails()).nominalValue;

      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, lotsUnit))
        .to.emit(primaryMarket, "SubscriptionSubmitted")
        .withArgs(offeringId, 1, investor1Address, lotsUnit);

      const totalSubscription = await primaryMarket.getTotalSubscriptions(offeringId);
      expect(totalSubscription).to.equal(1);

      const [investor, subscribedLotUnits] = await primaryMarket.getSubscription(offeringId, 1);
      expect(investor).to.equal(investor1Address);
      expect(subscribedLotUnits).to.equal(lotsUnit);

      const cost = lotsUnit * offering.lotSize * nominalValue;

      const balanceInvestorAfter = await mockPaymentToken.balanceOf(investor1Address);
      const balancePMAfter = await mockPaymentToken.balanceOf(primaryMarket.address);

      expect(balanceInvestorBefore.sub(balanceInvestorAfter)).to.equal(cost);
      expect(balancePMAfter.sub(balancePMBefore)).to.equal(cost);

      const [, , totalLots, pendingLots] = await primaryMarket.getOffering(1);
      expect(totalLots).to.equal(lotsUnit);
      expect(pendingLots).to.equal(lotsUnit);
    });

    it("GIVEN valid subscription for an offering that accepts over subscription WHEN submitting THEN success", async () => {
      await createOffering(1, 0);

      const lotsUnit = offering.minLots + 1;

      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, lotsUnit))
        .to.emit(primaryMarket, "SubscriptionSubmitted")
        .withArgs(offeringId, 1, investor1Address, lotsUnit);
    });

    it("GIVEN paused PM WHEN submitting THEN fail", async () => {
      const lotsUnit = offering.minLots + 1;

      await pause.connect(admin).pause();

      await expect(
        primaryMarket.connect(investor1).submitSubscription(offeringId, lotsUnit),
      ).to.be.revertedWithCustomError(pause, "TokenIsPaused");
    });

    it("GIVEN subscription below minLots WHEN submitting THEN fail", async () => {
      const lotsUnit = offering.minLots - 1;

      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, lotsUnit))
        .to.be.revertedWithCustomError(primaryMarket, "InvalidSubscriptionLotUnits")
        .withArgs(lotsUnit, offering.minLots, offering.maxLots);
    });

    it("GIVEN subscription above maxLots WHEN submitting THEN fail", async () => {
      const lotsUnit = offering.maxLots + 1;

      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, lotsUnit))
        .to.be.revertedWithCustomError(primaryMarket, "InvalidSubscriptionLotUnits")
        .withArgs(lotsUnit, offering.minLots, offering.maxLots);
    });

    it("GIVEN subscription for non existing offering WHEN submitting THEN fail", async () => {
      const wrongOfferingId = 898956565656;
      const lotsUnit = offering.minLots + 1;

      await expect(primaryMarket.connect(investor1).submitSubscription(wrongOfferingId, lotsUnit))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingDoesNotExist")
        .withArgs(wrongOfferingId);
    });

    it("GIVEN offering ID = 0 WHEN submitting subscription THEN fail", async () => {
      await expect(primaryMarket.connect(investor1).submitSubscription(0, 1))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingDoesNotExist")
        .withArgs(0);
    });

    it("GIVEN subscription without giving allowance to PM WHEN submitting THEN fail", async () => {
      const lotsUnit = offering.minLots + 1;
      const nominalValue = (await mockAsset.getBondDetails()).nominalValue;

      const cost = lotsUnit * offering.lotSize * nominalValue;

      await expect(primaryMarket.connect(investor3).submitSubscription(offeringId, lotsUnit))
        .to.be.revertedWithCustomError(primaryMarket, "NotEnoughFunds")
        .withArgs(investor3Address, cost, 0, offering.paymentToken);
    });

    it("GIVEN subscription without enough balance to PM WHEN submitting THEN fail", async () => {
      const lotsUnit = offering.minLots + 1;

      // Transfer all balance away from investor3 to simulate no balance
      const investor3Balance = await mockPaymentToken.balanceOf(investor3Address);
      await mockPaymentToken.connect(investor3).transfer(investor1Address, investor3Balance);

      // Give allowance
      await mockPaymentToken.connect(investor3).approve(primaryMarket.address, ethers.constants.MaxUint256);

      await expect(primaryMarket.connect(investor3).submitSubscription(offeringId, lotsUnit)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance",
      );
    });

    it("GIVEN subscription to PM WHEN submitting if 'transferFrom' fails THEN fail", async () => {
      const lotsUnit = offering.minLots + 1;

      await mockPaymentToken.setTransferFromFail(true);

      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, lotsUnit)).to.be.revertedWith(
        "SafeERC20: ERC20 operation did not succeed",
      );
    });

    it("GIVEN subscription before offering startDate or after endDate WHEN submitting THEN fail", async () => {
      const lotsUnit = offering.minLots + 1;

      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate - 1);

      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, lotsUnit))
        .to.be.revertedWithCustomError(primaryMarket, "SubscriptionNotAcceptedForOffering")
        .withArgs(offeringId);

      let offeringStatus = await primaryMarket.getOfferingStatus(offeringId);

      expect(offeringStatus).to.equal(0); //PENDING

      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, lotsUnit))
        .to.be.revertedWithCustomError(primaryMarket, "SubscriptionNotAcceptedForOffering")
        .withArgs(offeringId);

      offeringStatus = await primaryMarket.getOfferingStatus(offeringId);

      expect(offeringStatus).to.equal(6); //CANCELED
    });

    it("GIVEN subscription for offering that has already reached its target when over subscription not allowed WHEN submitting THEN fail", async () => {
      const iterations = offering.targetLots / offering.maxLots; // 100 / 50 = 2

      for (let i = 0; i < iterations; i++) {
        await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.maxLots);
      }

      const remainder = offering.targetLots - iterations * offering.maxLots;

      if (remainder > 0) await primaryMarket.connect(investor1).submitSubscription(offeringId, remainder);

      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, offering.maxLots))
        .to.be.revertedWithCustomError(primaryMarket, "SubscriptionNotAcceptedForOffering")
        .withArgs(offeringId);

      let offeringStatus = await primaryMarket.getOfferingStatus(offeringId);

      expect(offeringStatus).to.equal(2); //CLOSED
    });

    it("GIVEN subscription for offering that has already reached its target when offerings closed on target WHEN submitting THEN fail", async () => {
      await createOffering(0, 1);

      const iterations = offering.targetLots / offering.maxLots; // 100 / 50 = 2

      for (let i = 0; i < iterations; i++) {
        await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.maxLots);
      }

      const remainder = offering.targetLots % offering.maxLots;

      if (remainder > 0) await primaryMarket.connect(investor1).submitSubscription(offeringId, remainder);

      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, offering.maxLots))
        .to.be.revertedWithCustomError(primaryMarket, "SubscriptionNotAcceptedForOffering")
        .withArgs(offeringId);

      let offeringStatus = await primaryMarket.getOfferingStatus(offeringId);

      expect(offeringStatus).to.equal(3); //EXECUTABLE
    });

    it("GIVEN subscription that exceeds target when over subscription not allowed WHEN submitting THEN fail", async () => {
      const iterations = offering.targetLots / offering.maxLots - 1; // 100 / 50 = 2

      for (let i = 0; i < iterations; i++) {
        await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.maxLots);
      }

      await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.minLots);

      const totalLots = iterations * offering.maxLots + offering.minLots;

      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, offering.maxLots))
        .to.be.revertedWithCustomError(primaryMarket, "SubscriptionExceedsTarget")
        .withArgs(totalLots, offering.maxLots, offering.targetLots);
    });
  });

  describe("Executing Offerings", () => {
    let offeringId: number;
    let offering: IPrimaryMarket.OfferingStruct;

    type InvestorSubscription = {
      price: number;
      tokens: number;
    };

    async function createOffering(targetQuantityRule: number, deadlineRule: number) {
      const now = await time.latest();
      offering = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: 2,
        minLots: 1,
        maxLots: 5,
        targetLots: 10,
        targetQuantityRule: targetQuantityRule,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: deadlineRule,
        price: 0,
      };

      const tx = await primaryMarket.connect(offeringCreator).createOffering(offering);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "OfferingCreated");
      offeringId = event?.args?.offeringId?.toNumber() || 0; // Get offeringId from event
      await time.increase(61); // Move past startDate
    }

    beforeEach(async () => {
      await createOffering(0, 0);
    });

    async function reachTarget() {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate + 1);

      const iterations = offering.targetLots / offering.minLots;

      for (let i = 0; i < iterations; i++) {
        const investor = i % 2 == 0 ? investor1 : investor2;
        await primaryMarket.connect(investor).submitSubscription(offeringId, offering.minLots);
      }

      const remainder = offering.targetLots - iterations * offering.minLots;

      if (remainder > 0) {
        for (let j = 0; j < remainder; j++) {
          const investor = j % 2 == 0 ? investor1 : investor2;
          await primaryMarket.connect(investor).submitSubscription(offeringId, 1);
        }
      }
    }

    async function executeSuccess(paginatedMethod: boolean = true) {
      await reachTarget();

      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      const TreasuryBalanceBefore = await mockPaymentToken.balanceOf(treasuryAddress);
      const PrimaryMarketBalanceBefore = await mockPaymentToken.balanceOf(primaryMarketAddress);
      const TotalAssetSupplyBefore = await mockAsset.getTotalSupply();

      const totalSubscriptions = await primaryMarket.getTotalSubscriptions(offeringId);

      const investorsSubscriptions = new Map<string, InvestorSubscription>();

      const nominalValue = (await mockAsset.getBondDetails()).nominalValue;

      const investorsList: string[] = [];

      for (let i = 0; i < totalSubscriptions.toNumber() / 2; i++) {
        for (let j = 1; j <= 2; j++) {
          const subscription = await primaryMarket.getSubscription(offeringId, i + j);

          let tokens = 0;

          if (investorsSubscriptions.get(subscription.investor)) {
            tokens = investorsSubscriptions.get(subscription.investor).tokens;
          } else investorsList.push(subscription.investor);

          tokens += subscription.lotUnits.toNumber() * offering.lotSize;
          const price = tokens * nominalValue;
          investorsSubscriptions.set(subscription.investor, { tokens: tokens, price: price });
        }

        const tx = paginatedMethod
          ? await primaryMarket.connect(offeringCreator).executeOffering(offeringId, i, 2)
          : await primaryMarket
              .connect(offeringCreator)
              .executeOfferingBySubscriptionId(offeringId, [i * 2 + 1, i * 2 + 2]);

        const receipt = await tx.wait();

        // Find the event
        const event = receipt.events?.find((e) => e.event === "OfferingExecuted");
        expect(event).to.not.be.undefined;

        // Check scalar args
        expect(event.args.offeringId).to.equal(offeringId);
        expect(event.args.operator).to.equal(offeringCreatorAddress);

        // Convert BigNumbers to numbers for array comparison
        const succeeded = event.args.subscriptionIdsSuccess.map((x) => x.toNumber());
        expect(succeeded).to.deep.equal([i * 2 + 1, i * 2 + 2]);

        const failed = event.args.subscriptionIdsFailed.map((x) => x.toNumber());
        expect(failed).to.deep.equal([]);

        const alreadyProcessed = event.args.subscriptionIdsAlreadyExecuted.map((x) => x.toNumber());
        expect(alreadyProcessed).to.deep.equal([]);
      }

      const TreasuryBalanceAfter = await mockPaymentToken.balanceOf(treasuryAddress);
      const PrimaryMarketBalanceAfter = await mockPaymentToken.balanceOf(primaryMarketAddress);
      const TotalAssetSupplyAfter = await mockAsset.getTotalSupply();
      const TotalAssets = offering.targetLots * offering.lotSize;
      const TotalCost = BigInt(TotalAssets) * BigInt(nominalValue);

      expect(BigInt(TreasuryBalanceBefore) + BigInt(TotalCost)).to.equal(BigInt(TreasuryBalanceAfter));
      expect(BigInt(PrimaryMarketBalanceBefore) - BigInt(TotalCost)).to.equal(BigInt(PrimaryMarketBalanceAfter));
      expect(BigInt(TotalAssetSupplyBefore) + BigInt(TotalAssets)).to.equal(BigInt(TotalAssetSupplyAfter));

      for (let p = 0; p < investorsList.length; p++) {
        const InvestorAssetBalance = await mockAsset.getBalanceOf(investorsList[p]);
        expect(InvestorAssetBalance).to.equal(investorsSubscriptions.get(investorsList[p])?.tokens);
      }
    }

    it("GIVEN executable offering WHEN executing paginated method THEN success", async () => {
      await executeSuccess(true);
    });

    it("GIVEN executable offering WHEN executing non paginated method THEN success", async () => {
      await executeSuccess(false);
    });

    it("GIVEN executable offering WHEN executing same subscriptions THEN success", async () => {
      await reachTarget();

      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      const totalSubscription = await primaryMarket.getTotalSubscriptions(offeringId);

      await primaryMarket.connect(offeringCreator).executeOffering(offeringId, 0, totalSubscription - 1);

      const tx = await primaryMarket.connect(offeringCreator).executeOffering(offeringId, 0, totalSubscription - 1);
      const receipt = await tx.wait();

      // Find the event
      const event = receipt.events?.find((e) => e.event === "OfferingExecuted");
      expect(event).to.not.be.undefined;

      // Check scalar args
      expect(event.args.offeringId).to.equal(offeringId);
      expect(event.args.operator).to.equal(offeringCreatorAddress);

      // Convert BigNumbers to numbers for array comparison
      const succeeded = event.args.subscriptionIdsSuccess.map((x) => x.toNumber());
      expect(succeeded).to.deep.equal([]);

      const failed = event.args.subscriptionIdsFailed.map((x) => x.toNumber());
      expect(failed).to.deep.equal([]);

      const alreadyProcessed = event.args.subscriptionIdsAlreadyExecuted.map((x) => x.toNumber());
      const arr = Array.from({ length: totalSubscription - 1 }, (_, i) => i + 1);
      expect(alreadyProcessed).to.deep.equal(arr);
    });

    it("GIVEN executable offering and not working precompiled WHEN executing THEN success with failures", async () => {
      await reachTarget();

      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      await mockPrecompiled.setPrecompiledTransferStatus(false);

      const totalSubscriptions = await primaryMarket.getTotalSubscriptions(offeringId);

      for (let i = 0; i < totalSubscriptions.toNumber() / 2; i++) {
        for (let methodId = 1; methodId < 2; methodId++) {
          const tx =
            methodId == 1
              ? await primaryMarket.connect(offeringCreator).executeOffering(offeringId, i, 2)
              : await primaryMarket
                  .connect(offeringCreator)
                  .executeOfferingBySubscriptionId(offeringId, [i * 2 + 1, i * 2 + 2]);

          const receipt = await tx?.wait();

          // Find the event
          const event = receipt.events?.find((e) => e.event === "OfferingExecuted");
          expect(event).to.not.be.undefined;

          // Check scalar args
          expect(event.args.offeringId).to.equal(offeringId);
          expect(event.args.operator).to.equal(offeringCreatorAddress);

          // Convert BigNumbers to numbers for array comparison
          const succeeded = event.args.subscriptionIdsSuccess.map((x) => x.toNumber());
          expect(succeeded).to.deep.equal([]);

          const failed = event.args.subscriptionIdsFailed.map((x) => x.toNumber());
          expect(failed).to.deep.equal([i * 2 + 1, i * 2 + 2]);

          const alreadyProcessed = event.args.subscriptionIdsAlreadyExecuted.map((x) => x.toNumber());
          expect(alreadyProcessed).to.deep.equal([]);
        }
      }
    });

    it("GIVEN paused PM WHEN executing THEN fail", async () => {
      await pause.connect(admin).pause();

      await expect(
        primaryMarket.connect(offeringCreator).executeOffering(offeringId, 0, 100),
      ).to.be.revertedWithCustomError(pause, "TokenIsPaused");

      await expect(
        primaryMarket.connect(offeringCreator).executeOfferingBySubscriptionId(offeringId, [1, 2]),
      ).to.be.revertedWithCustomError(pause, "TokenIsPaused");
    });

    it("GIVEN non existing offering WHEN executing THEN fail", async () => {
      const wrongOffering = offeringId + 100;

      await expect(primaryMarket.connect(offeringCreator).executeOffering(wrongOffering, 0, 100))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingDoesNotExist")
        .withArgs(wrongOffering);

      await expect(primaryMarket.connect(offeringCreator).executeOfferingBySubscriptionId(wrongOffering, [1, 2]))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingDoesNotExist")
        .withArgs(wrongOffering);
    });

    it("GIVEN unauthorized user WHEN executing THEN fail", async () => {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      await expect(primaryMarket.connect(investor1).executeOffering(offeringId, 0, 100))
        .to.be.revertedWithCustomError(primaryMarket, "UnauthorizedAccountForOffering")
        .withArgs(investor1Address, offeringId);

      await expect(primaryMarket.connect(investor1).executeOfferingBySubscriptionId(offeringId, [1, 2]))
        .to.be.revertedWithCustomError(primaryMarket, "UnauthorizedAccountForOffering")
        .withArgs(investor1Address, offeringId);
    });

    it("GIVEN pending offering WHEN executing THEN fail", async () => {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate - 1);

      await expect(primaryMarket.connect(offeringCreator).executeOffering(offeringId, 0, 100))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeExecuted")
        .withArgs(offeringId);

      await expect(primaryMarket.connect(offeringCreator).executeOfferingBySubscriptionId(offeringId, [1, 2]))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeExecuted")
        .withArgs(offeringId);
    });

    it("GIVEN open offering WHEN executing THEN fail", async () => {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate - 1);

      await expect(primaryMarket.connect(offeringCreator).executeOffering(offeringId, 0, 100))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeExecuted")
        .withArgs(offeringId);

      await expect(primaryMarket.connect(offeringCreator).executeOfferingBySubscriptionId(offeringId, [1, 2]))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeExecuted")
        .withArgs(offeringId);
    });

    it("GIVEN cancellable offering WHEN executing THEN fail", async () => {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      await expect(primaryMarket.connect(offeringCreator).executeOffering(offeringId, 0, 100))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeExecuted")
        .withArgs(offeringId);

      await expect(primaryMarket.connect(offeringCreator).executeOfferingBySubscriptionId(offeringId, [1, 2]))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeExecuted")
        .withArgs(offeringId);
    });

    it("GIVEN offering WHEN executing by subscription IDs with non-existing subscription THEN revert", async () => {
      // Create and reach target first
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate + 1);

      const iterations = offering.targetLots / offering.minLots;
      for (let i = 0; i < iterations; i++) {
        const investor = i % 2 == 0 ? investor1 : investor2;
        await primaryMarket.connect(investor).submitSubscription(offeringId, offering.minLots);
      }

      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      // Try to execute with non-existing subscription ID - should revert
      await expect(
        primaryMarket.connect(offeringCreator).executeOfferingBySubscriptionId(offeringId, [999]),
      ).to.be.revertedWithCustomError(primaryMarket, "SubscriptionDoesNotExist");
    });

    it("GIVEN offering WHEN executing with already executed subscription THEN mark as already processed", async () => {
      // Create and reach target
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate + 1);

      const iterations = offering.targetLots / offering.minLots;
      for (let i = 0; i < iterations; i++) {
        const investor = i % 2 == 0 ? investor1 : investor2;
        await primaryMarket.connect(investor).submitSubscription(offeringId, offering.minLots);
      }

      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      // Execute first subscription
      await primaryMarket.connect(offeringCreator).executeOfferingBySubscriptionId(offeringId, [1]);

      // Try to execute same subscription again
      const tx = await primaryMarket.connect(offeringCreator).executeOfferingBySubscriptionId(offeringId, [1]);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e) => e.event === "OfferingExecuted");

      const alreadyProcessed = event!
        .args!.subscriptionIdsAlreadyExecuted.map((x: any) => x.toNumber())
        .filter((x: number) => x > 0);
      expect(alreadyProcessed).to.include(1);
    });

    it("GIVEN subscription with amount exceeding int64 max WHEN executing THEN mark as failed", async () => {
      const now = await time.latest();

      const offering = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: 1,
        minLots: 1,
        maxLots: 1,
        targetLots: 1,
        targetQuantityRule: 0,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0,
        price: BigInt(INT64_MAX) + BigInt(1), // Use custom price exceeding int64 max
      };

      let tx = await primaryMarket.connect(offeringCreator).createOffering(offering);
      let receipt = await tx.wait();
      let event = receipt.events?.find((e: any) => e.event === "OfferingCreated");
      offeringId = event?.args?.offeringId?.toNumber() || 0; // Get offeringId from event

      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate + 1);

      await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.minLots);

      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      tx = await primaryMarket.connect(offeringCreator).executeOfferingBySubscriptionId(offeringId, [1]);
      receipt = await tx.wait();
      event = receipt.events?.find((e) => e.event === "OfferingExecuted");
      expect(event).to.not.be.undefined;

      const succeeded = event.args.subscriptionIdsSuccess.map((x) => x.toNumber());
      expect(succeeded).to.deep.equal([]);

      const failed = event.args.subscriptionIdsFailed.map((x) => x.toNumber());
      expect(failed).to.deep.equal([1]);

      const alreadyProcessed = event.args.subscriptionIdsAlreadyExecuted.map((x) => x.toNumber());
      expect(alreadyProcessed).to.deep.equal([]);
    });

    it("GIVEN offering after endDate with all subscriptions executed WHEN checking status THEN EXECUTED", async () => {
      await reachTarget();
      await mockPrecompiled.setPrecompiledTransferStatus(true);
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      // Execute all subscriptions by ID (targeting is 10 lots, minLots is 1, so we have 10 subscriptions)
      await primaryMarket
        .connect(offeringCreator)
        .executeOfferingBySubscriptionId(offeringId, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      // Check status should be EXECUTED (pendingSubscribedLots = 0)
      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(5); // EXECUTED
    });
  });

  describe("Cancelling Offerings", () => {
    let offeringId: number;
    let offering: IPrimaryMarket.OfferingStruct;

    async function createOffering(targetQuantityRule: number, deadlineRule: number) {
      const now = await time.latest();
      offering = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 1000,
        targetQuantityRule: targetQuantityRule,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: deadlineRule,
        price: 0,
      };

      const tx = await primaryMarket.connect(offeringCreator).createOffering(offering);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "OfferingCreated");
      offeringId = event?.args?.offeringId?.toNumber() || 0;
      await time.increase(61); // Move past startDate
    }

    beforeEach(async () => {
      await createOffering(0, 0);
    });

    async function createSubscriptions(numSubscriptions: number) {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate + 1);

      for (let i = 0; i < numSubscriptions; i++) {
        const investor = i % 2 == 0 ? investor1 : investor2;
        await primaryMarket.connect(investor).submitSubscription(offeringId, offering.minLots);
      }
    }

    it("GIVEN cancellable offering with subscriptions WHEN cancelling THEN success", async () => {
      const numSubscriptions = 10;
      await createSubscriptions(numSubscriptions);

      // Move past endDate to make it cancellable (target not reached)
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(4); // CANCELLABLE

      // Get initial balances
      const investor1BalanceBefore = await mockPaymentToken.balanceOf(investor1Address);
      const investor2BalanceBefore = await mockPaymentToken.balanceOf(investor2Address);
      const pmBalanceBefore = await mockPaymentToken.balanceOf(primaryMarket.address);

      // Cancel offering (process subscriptions 0-4)
      const tx = await primaryMarket.connect(offeringCreator).cancelOffering(offeringId, 0, 5);
      const receipt = await tx.wait();

      // Find the event
      const event = receipt.events?.find((e) => e.event === "OfferingCancelled");
      expect(event).to.not.be.undefined;

      // Check event args
      expect(event!.args!.offeringId).to.equal(offeringId);
      expect(event!.args!.operator).to.equal(offeringCreatorAddress);

      // Convert BigNumbers to numbers for array comparison - filter out zeros
      const succeeded = event!.args!.subscriptionIdsSuccess.map((x: any) => x.toNumber()).filter((x: number) => x > 0);
      const failed = event!.args!.subscriptionIdsFailed.map((x: any) => x.toNumber()).filter((x: number) => x > 0);

      expect(succeeded.length).to.equal(5);
      expect(succeeded).to.include.members([1, 2, 3, 4, 5]);
      expect(failed.length).to.equal(0); // No failures expected

      // Check balances - investors should be refunded
      const nominalValue = (await mockAsset.getBondDetails()).nominalValue;
      const refundPerSubscription = offering.minLots * offering.lotSize * nominalValue;

      // 3 subscriptions for investor1 (indices 0, 2, 4 -> subscription IDs 1, 3, 5)
      const investor1BalanceAfter = await mockPaymentToken.balanceOf(investor1Address);
      expect(investor1BalanceAfter.sub(investor1BalanceBefore)).to.equal(refundPerSubscription * 3);

      // 2 subscriptions for investor2 (indices 1, 3 -> subscription IDs 2, 4)
      const investor2BalanceAfter = await mockPaymentToken.balanceOf(investor2Address);
      expect(investor2BalanceAfter.sub(investor2BalanceBefore)).to.equal(refundPerSubscription * 2);

      // PM balance should decrease
      const pmBalanceAfter = await mockPaymentToken.balanceOf(primaryMarket.address);
      expect(pmBalanceBefore.sub(pmBalanceAfter)).to.equal(refundPerSubscription * 5);
    });

    it("GIVEN cancellable offering WHEN cancelling by subscription IDs THEN success", async () => {
      const numSubscriptions = 5;
      await createSubscriptions(numSubscriptions);

      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      const investor1BalanceBefore = await mockPaymentToken.balanceOf(investor1Address);
      const pmBalanceBefore = await mockPaymentToken.balanceOf(primaryMarket.address);

      // Cancel specific subscriptions by ID
      const subscriptionIds = [1, 3, 5]; // investor1's subscriptions
      const tx = await primaryMarket
        .connect(offeringCreator)
        .cancelOfferingBySubscriptionId(offeringId, subscriptionIds);
      const receipt = await tx.wait();

      const event = receipt.events?.find((e) => e.event === "OfferingCancelled");
      expect(event).to.not.be.undefined;

      const succeeded = event!.args!.subscriptionIdsSuccess.map((x: any) => x.toNumber()).filter((x: number) => x > 0);
      expect(succeeded.length).to.equal(3);
      expect(succeeded).to.include.members([1, 3, 5]);

      // Check refund
      const nominalValue = (await mockAsset.getBondDetails()).nominalValue;
      const refundPerSubscription = offering.minLots * offering.lotSize * nominalValue;
      const investor1BalanceAfter = await mockPaymentToken.balanceOf(investor1Address);
      const pmBalanceAfter = await mockPaymentToken.balanceOf(primaryMarket.address);

      expect(investor1BalanceAfter.sub(investor1BalanceBefore)).to.equal(refundPerSubscription * 3);
      expect(pmBalanceBefore.sub(pmBalanceAfter)).to.equal(refundPerSubscription * 3);
    });

    it("GIVEN paused PM WHEN cancelling THEN fail", async () => {
      await pause.connect(admin).pause();

      await expect(
        primaryMarket.connect(offeringCreator).cancelOffering(offeringId, 0, 100),
      ).to.be.revertedWithCustomError(pause, "TokenIsPaused");

      await expect(
        primaryMarket.connect(offeringCreator).cancelOfferingBySubscriptionId(offeringId, [1, 2]),
      ).to.be.revertedWithCustomError(pause, "TokenIsPaused");
    });

    it("GIVEN non existing offering WHEN cancelling THEN fail", async () => {
      const wrongOffering = offeringId + 100;

      await expect(primaryMarket.connect(offeringCreator).cancelOffering(wrongOffering, 0, 100))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingDoesNotExist")
        .withArgs(wrongOffering);

      await expect(primaryMarket.connect(offeringCreator).cancelOfferingBySubscriptionId(wrongOffering, [1, 2]))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingDoesNotExist")
        .withArgs(wrongOffering);
    });

    it("GIVEN unauthorized user WHEN cancelling THEN fail", async () => {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      await expect(primaryMarket.connect(investor1).cancelOffering(offeringId, 0, 100))
        .to.be.revertedWithCustomError(primaryMarket, "UnauthorizedAccountForOffering")
        .withArgs(investor1Address, offeringId);

      await expect(primaryMarket.connect(investor1).cancelOfferingBySubscriptionId(offeringId, [1, 2]))
        .to.be.revertedWithCustomError(primaryMarket, "UnauthorizedAccountForOffering")
        .withArgs(investor1Address, offeringId);
    });

    it("GIVEN pending offering WHEN cancelling THEN fail", async () => {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate - 1);

      await expect(primaryMarket.connect(offeringCreator).cancelOffering(offeringId, 0, 100))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeCancelled")
        .withArgs(offeringId);

      await expect(primaryMarket.connect(offeringCreator).cancelOfferingBySubscriptionId(offeringId, [1, 2]))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeCancelled")
        .withArgs(offeringId);
    });

    it("GIVEN open offering WHEN cancelling THEN fail", async () => {
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate + 1);

      await expect(primaryMarket.connect(offeringCreator).cancelOffering(offeringId, 0, 100))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeCancelled")
        .withArgs(offeringId);

      await expect(primaryMarket.connect(offeringCreator).cancelOfferingBySubscriptionId(offeringId, [1, 2]))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeCancelled")
        .withArgs(offeringId);
    });

    it("GIVEN executable offering WHEN cancelling THEN fail", async () => {
      // Reach target
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.startDate + 1);
      const iterations = offering.targetLots / offering.minLots;
      for (let i = 0; i < iterations; i++) {
        const investor = i % 2 == 0 ? investor1 : investor2;
        await primaryMarket.connect(investor).submitSubscription(offeringId, offering.minLots);
      }

      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(3); // EXECUTABLE

      await expect(primaryMarket.connect(offeringCreator).cancelOffering(offeringId, 0, 100))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeCancelled")
        .withArgs(offeringId);

      await expect(primaryMarket.connect(offeringCreator).cancelOfferingBySubscriptionId(offeringId, [1, 2]))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingCannotBeCancelled")
        .withArgs(offeringId);
    });

    it("GIVEN cancellable offering with multiple subscriptions WHEN cancelling all THEN pendingLots = 0", async () => {
      const numSubscriptions = 5;
      await createSubscriptions(numSubscriptions);

      // Move past endDate to make it cancellable (target not reached)
      await primaryMarketTimeTravel.changeSystemTimestamp(offering.endDate + 1);

      // Cancel all subscriptions by ID to avoid pagination issues
      await primaryMarket.connect(offeringCreator).cancelOfferingBySubscriptionId(offeringId, [1, 2, 3, 4, 5]);

      // Verify all processed (pendingLots = 0)
      const [, , , pendingLots] = await primaryMarket.getOffering(offeringId);
      expect(pendingLots).to.equal(0);
    });
  });

  describe("Cancelling Individual Subscriptions", () => {
    let offeringId: number;
    let offering: IPrimaryMarket.OfferingStruct;

    beforeEach(async () => {
      const now = await time.latest();
      offering = {
        asset: mockAsset.address,
        treasury: treasuryAddress,
        paymentToken: mockPaymentToken.address,
        lotSize: ethers.utils.parseUnits("1000", 6),
        minLots: 1,
        maxLots: 50,
        targetLots: 100,
        targetQuantityRule: 0,
        startDate: now + 60,
        endDate: now + 3600,
        deadlineRule: 0,
        price: 0,
      };

      const tx = await primaryMarket.connect(offeringCreator).createOffering(offering);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "OfferingCreated");
      offeringId = event?.args?.offeringId?.toNumber() || 0;
      await time.increase(61);
    });

    it("GIVEN valid subscription WHEN cancelling individual subscription THEN success", async () => {
      // Create subscription
      await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.minLots);

      const subscriptionId = 1;
      const investor1BalanceBefore = await mockPaymentToken.balanceOf(investor1Address);
      const pmBalanceBefore = await mockPaymentToken.balanceOf(primaryMarket.address);

      // Cancel subscription
      await primaryMarket.connect(offeringCreator).cancelSubscription(offeringId, subscriptionId);

      // Check refund
      const nominalValue = (await mockAsset.getBondDetails()).nominalValue;
      const expectedRefund = offering.minLots * offering.lotSize * nominalValue;

      const investor1BalanceAfter = await mockPaymentToken.balanceOf(investor1Address);
      const pmBalanceAfter = await mockPaymentToken.balanceOf(primaryMarket.address);

      expect(investor1BalanceAfter.sub(investor1BalanceBefore)).to.equal(expectedRefund);
      expect(pmBalanceBefore.sub(pmBalanceAfter)).to.equal(expectedRefund);

      // Check pending lots updated
      const [, , , pendingLots] = await primaryMarket.getOffering(offeringId);
      expect(pendingLots).to.equal(0);
    });

    it("GIVEN paused PM WHEN cancelling subscription THEN fail", async () => {
      await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.minLots);

      await pause.connect(admin).pause();

      await expect(
        primaryMarket.connect(offeringCreator).cancelSubscription(offeringId, 1),
      ).to.be.revertedWithCustomError(pause, "TokenIsPaused");
    });

    it("GIVEN non existing offering WHEN cancelling subscription THEN fail", async () => {
      const wrongOffering = offeringId + 100;

      await expect(primaryMarket.connect(offeringCreator).cancelSubscription(wrongOffering, 1))
        .to.be.revertedWithCustomError(primaryMarket, "OfferingDoesNotExist")
        .withArgs(wrongOffering);
    });

    it("GIVEN non existing subscription WHEN cancelling THEN fail", async () => {
      const wrongSubscriptionId = 999;

      await expect(primaryMarket.connect(offeringCreator).cancelSubscription(offeringId, wrongSubscriptionId))
        .to.be.revertedWithCustomError(primaryMarket, "SubscriptionIsNotActive")
        .withArgs(offeringId, wrongSubscriptionId);
    });

    it("GIVEN unauthorized user WHEN cancelling subscription THEN fail", async () => {
      await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.minLots);

      await expect(primaryMarket.connect(investor1).cancelSubscription(offeringId, 1))
        .to.be.revertedWithCustomError(primaryMarket, "UnauthorizedAccountForOffering")
        .withArgs(investor1Address, offeringId);
    });

    it("GIVEN already cancelled subscription WHEN cancelling again THEN fail", async () => {
      await primaryMarket.connect(investor1).submitSubscription(offeringId, offering.minLots);

      // Cancel first time
      await primaryMarket.connect(offeringCreator).cancelSubscription(offeringId, 1);

      // Cancel again should fail
      await expect(primaryMarket.connect(offeringCreator).cancelSubscription(offeringId, 1))
        .to.be.revertedWithCustomError(primaryMarket, "SubscriptionIsNotActive")
        .withArgs(offeringId, 1);
    });
  });

  describe("Price Field Tests", () => {
    describe("GIVEN price = 0", () => {
      let offeringId: number;
      let offering: IPrimaryMarket.OfferingStruct;

      beforeEach(async () => {
        const now = await time.latest();
        offering = {
          asset: mockAsset.address,
          treasury: treasuryAddress,
          paymentToken: mockPaymentToken.address,
          lotSize: ethers.utils.parseUnits("1000", 6), // 1000 USDC worth per lot
          minLots: 1,
          maxLots: 50,
          targetLots: 100,
          targetQuantityRule: 0, // OVERSUBSCRIPTION_NOT_ALLOWED
          startDate: now + 60,
          endDate: now + 3600,
          deadlineRule: 0, // WAIT_UNTIL_END
          price: 0, // Will use bond's nominal value
        };

        await primaryMarket.connect(offeringCreator).createOffering(offering);
        offeringId = 1;
      });

      it("WHEN creating offering THEN price is set to bond nominal value", async () => {
        const [offeringInfo] = await primaryMarket.getOffering(offeringId);
        const bondDetails = await mockAsset.getBondDetails();
        expect(offeringInfo.price).to.equal(bondDetails.nominalValue);
        expect(offeringInfo.price).to.equal(3); // Default nominal value in MockBond
      });

      it("WHEN submitting subscription THEN payment uses bond nominal value", async () => {
        await time.increaseTo(offering.startDate);

        const bondDetails = await mockAsset.getBondDetails();
        const lotUnits = 5;
        const expectedPayment = lotUnits * offering.lotSize.toNumber() * bondDetails.nominalValue.toNumber();

        const balanceBefore = await mockPaymentToken.balanceOf(investor1Address);

        await primaryMarket.connect(investor1).submitSubscription(offeringId, lotUnits);

        const balanceAfter = await mockPaymentToken.balanceOf(investor1Address);
        expect(balanceBefore.sub(balanceAfter)).to.equal(expectedPayment);
      });

      it("WHEN cancelling subscription THEN refund uses bond nominal value", async () => {
        await time.increaseTo(offering.startDate);

        const bondDetails = await mockAsset.getBondDetails();
        const lotUnits = 5;
        const expectedPayment = lotUnits * offering.lotSize.toNumber() * bondDetails.nominalValue.toNumber();

        await primaryMarket.connect(investor1).submitSubscription(offeringId, lotUnits);

        const balanceBefore = await mockPaymentToken.balanceOf(investor1Address);

        await primaryMarket.connect(offeringCreator).cancelSubscription(offeringId, 1);

        const balanceAfter = await mockPaymentToken.balanceOf(investor1Address);
        expect(balanceAfter.sub(balanceBefore)).to.equal(expectedPayment);
      });
    });

    describe("GIVEN price > 0 (custom price)", () => {
      let offeringId: number;
      let offering: IPrimaryMarket.OfferingStruct;
      const customPrice = 5; // Different from bond's nominal value (3)

      beforeEach(async () => {
        const now = await time.latest();
        offering = {
          asset: mockAsset.address,
          treasury: treasuryAddress,
          paymentToken: mockPaymentToken.address,
          lotSize: ethers.utils.parseUnits("1000", 6), // 1000 USDC worth per lot
          minLots: 1,
          maxLots: 50,
          targetLots: 100,
          targetQuantityRule: 0, // OVERSUBSCRIPTION_NOT_ALLOWED
          startDate: now + 60,
          endDate: now + 3600,
          deadlineRule: 0, // WAIT_UNTIL_END
          price: customPrice, // Custom price instead of nominal value
        };

        await primaryMarket.connect(offeringCreator).createOffering(offering);
        offeringId = 1;
      });

      it("WHEN creating offering THEN price is kept as provided", async () => {
        const [offeringInfo] = await primaryMarket.getOffering(offeringId);
        const bondDetails = await mockAsset.getBondDetails();
        expect(offeringInfo.price).to.equal(customPrice);
        expect(offeringInfo.price).to.not.equal(bondDetails.nominalValue); // Should be different from nominal value
      });

      it("WHEN submitting subscription THEN payment uses custom price", async () => {
        await time.increaseTo(offering.startDate);

        const lotUnits = 5;
        const expectedPayment = lotUnits * offering.lotSize.toNumber() * customPrice;

        const balanceBefore = await mockPaymentToken.balanceOf(investor1Address);

        await primaryMarket.connect(investor1).submitSubscription(offeringId, lotUnits);

        const balanceAfter = await mockPaymentToken.balanceOf(investor1Address);
        expect(balanceBefore.sub(balanceAfter)).to.equal(expectedPayment);
      });

      it("WHEN cancelling subscription THEN refund uses custom price", async () => {
        await time.increaseTo(offering.startDate);

        const lotUnits = 5;
        const expectedPayment = lotUnits * offering.lotSize.toNumber() * customPrice;

        await primaryMarket.connect(investor1).submitSubscription(offeringId, lotUnits);

        const balanceBefore = await mockPaymentToken.balanceOf(investor1Address);

        await primaryMarket.connect(offeringCreator).cancelSubscription(offeringId, 1);

        const balanceAfter = await mockPaymentToken.balanceOf(investor1Address);
        expect(balanceAfter.sub(balanceBefore)).to.equal(expectedPayment);
      });

      it("WHEN executing offering THEN calculation uses custom price", async () => {
        await time.increaseTo(offering.startDate);

        const lotUnits = offering.maxLots; // Use maxLots instead of targetLots
        await primaryMarket.connect(investor1).submitSubscription(offeringId, lotUnits);
        await primaryMarket.connect(investor2).submitSubscription(offeringId, lotUnits);

        await time.increaseTo(offering.endDate + 1);

        const treasuryBalanceBefore = await mockPaymentToken.balanceOf(treasuryAddress);

        // Execute using subscription IDs instead of pagination
        await primaryMarket.connect(offeringCreator).executeOfferingBySubscriptionId(offeringId, [1, 2]);

        const treasuryBalanceAfter = await mockPaymentToken.balanceOf(treasuryAddress);
        const expectedPayment = lotUnits * 2 * offering.lotSize.toNumber() * customPrice;

        expect(treasuryBalanceAfter.sub(treasuryBalanceBefore)).to.equal(expectedPayment);
      });
    });

    describe("GIVEN different prices across offerings", () => {
      it("WHEN creating multiple offerings with different prices THEN each uses its own price", async () => {
        const now = await time.latest();

        // Offering 1 with price = 0 (uses nominal value)
        const offering1: IPrimaryMarket.OfferingStruct = {
          asset: mockAsset.address,
          treasury: treasuryAddress,
          paymentToken: mockPaymentToken.address,
          lotSize: ethers.utils.parseUnits("1000", 6),
          minLots: 1,
          maxLots: 50,
          targetLots: 100,
          targetQuantityRule: 0,
          startDate: now + 60,
          endDate: now + 3600,
          deadlineRule: 0,
          price: 0,
        };

        // Offering 2 with custom price
        const offering2: IPrimaryMarket.OfferingStruct = {
          asset: mockAsset.address,
          treasury: treasuryAddress,
          paymentToken: mockPaymentToken.address,
          lotSize: ethers.utils.parseUnits("1000", 6),
          minLots: 1,
          maxLots: 50,
          targetLots: 100,
          targetQuantityRule: 0,
          startDate: now + 60,
          endDate: now + 3600,
          deadlineRule: 0,
          price: 10,
        };

        await primaryMarket.connect(offeringCreator).createOffering(offering1);
        await primaryMarket.connect(offeringCreator).createOffering(offering2);

        const [offering1Info] = await primaryMarket.getOffering(1);
        const [offering2Info] = await primaryMarket.getOffering(2);

        const bondDetails = await mockAsset.getBondDetails();
        expect(offering1Info.price).to.equal(bondDetails.nominalValue); // Uses bond nominal value
        expect(offering2Info.price).to.equal(10); // Uses custom price
      });
    });

    describe("GIVEN super large price values (edge cases)", () => {
      it("WHEN executing offering with super large price THEN success with batch processing", async () => {
        const now = await time.latest();

        // Calculate super large price that will trigger batch processing
        // Using a smaller lotSize to ensure tokensPerSubscription calculation is correct
        const tokensPerSubscription = 1 * 1; // lotSize * minLots
        const superLargePrice = BigInt(INT64_MAX) / BigInt(tokensPerSubscription);

        // Set nominal value BEFORE creating offering so price captures it
        await mockAsset.setNominalValue(superLargePrice);

        const offering: IPrimaryMarket.OfferingStruct = {
          asset: mockAsset.address,
          treasury: treasuryAddress,
          paymentToken: mockPaymentToken.address,
          lotSize: 1, // Small lotSize for easier int64 overflow calculation
          minLots: 1,
          maxLots: 5,
          targetLots: 10,
          targetQuantityRule: 0,
          startDate: now + 60,
          endDate: now + 3600,
          deadlineRule: 0,
          price: 0, // Will use the super large nominal value set above
        };

        await primaryMarket.connect(offeringCreator).createOffering(offering);
        const offeringId = 1;

        // Enable precompiled mock for transfers to work
        await mockPrecompiled.setPrecompiledTransferStatus(true);

        await time.increaseTo(offering.startDate);

        // Create subscriptions to reach target
        for (let i = 0; i < 10; i++) {
          const investor = i % 2 == 0 ? investor1 : investor2;
          await primaryMarket.connect(investor).submitSubscription(offeringId, offering.minLots);
        }

        await time.increaseTo(offering.endDate + 1);

        // Execute offering - with super large price, this triggers batch processing
        // Need to execute all subscriptions (10 total)
        const totalSubscriptions = await primaryMarket.getTotalSubscriptions(offeringId);
        await primaryMarket.connect(offeringCreator).executeOffering(offeringId, 0, totalSubscriptions);

        const status = await primaryMarket.getOfferingStatus(offeringId);
        expect(status).to.equal(5); // EXECUTED
      });

      it("WHEN cancelling offering with super large price THEN success with batch processing", async () => {
        const now = await time.latest();

        // Set nominal value BEFORE creating offering so it captures the large value
        const tokensPerSubscription = 2; // lotSize 2 * minLots 1
        const nominalValue = BigInt(INT64_MAX) / BigInt(tokensPerSubscription);
        await mockAsset.setNominalValue(nominalValue);

        const offering: IPrimaryMarket.OfferingStruct = {
          asset: mockAsset.address,
          treasury: treasuryAddress,
          paymentToken: mockPaymentToken.address,
          lotSize: 2,
          minLots: 1,
          maxLots: 5,
          targetLots: 100, // High target so we don't reach it
          targetQuantityRule: 0,
          startDate: now + 60,
          endDate: now + 3600,
          deadlineRule: 0,
          price: 0, // Will use the super large nominal value set above
        };

        const tx = await primaryMarket.connect(offeringCreator).createOffering(offering);
        const receipt = await tx.wait();
        const event = receipt.events?.find((e: any) => e.event === "OfferingCreated");
        const offeringId = event?.args?.offeringId?.toNumber() || 0;

        await time.increaseTo(offering.startDate);

        // Create 10 subscriptions (not reaching target of 100)
        for (let i = 0; i < 10; i++) {
          const investor = i % 2 == 0 ? investor1 : investor2;
          await primaryMarket.connect(investor).submitSubscription(offeringId, offering.minLots);
        }

        // Move past endDate to make it cancellable (target not reached intentionally)
        await time.increaseTo(offering.endDate + 1);

        // Cancel offering - with super large price, this triggers the int64 overflow path during cancellation
        await primaryMarket
          .connect(offeringCreator)
          .cancelOfferingBySubscriptionId(offeringId, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        const status = await primaryMarket.getOfferingStatus(offeringId);
        expect(status).to.equal(6); // CANCELLED
      });
    });
  });
});

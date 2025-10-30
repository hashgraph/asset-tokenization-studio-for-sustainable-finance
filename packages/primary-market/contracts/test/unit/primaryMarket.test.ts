import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { PRIMARY_MARKET_CONFIG_ID } from "@scripts/domain";
import {
  IFactoryPrimaryMarket,
  IBusinessLogicResolver,
  IAccessControl,
  IPrimaryMarket,
} from "@contracts";
import {
  DEFAULT_ADMIN_ROLE,
  deployFactoryPrimaryMarketSystem,
  PM_DEPLOYER_ROLE,
  OFFERING_CREATOR_ROLE,
} from "@scripts";
import {
  ADDRESS_ZERO,
  HardhatProvider,
  configureLogger,
  LogLevel,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

// Contracts
let primaryMarket: IPrimaryMarket;
let factoryPrimaryMarket: IFactoryPrimaryMarket;
let blr: IBusinessLogicResolver;
let accessControl: IAccessControl;

// Signers
let deployer: Signer;
let admin: Signer;
let offeringCreator: Signer;
let investor1: Signer;
let investor2: Signer;
let treasury: Signer;

// Addresses
let adminAddress: string;
let offeringCreatorAddress: string;
let investor1Address: string;
let investor2Address: string;
let treasuryAddress: string;

// Mock contracts
let mockAsset: Contract;
let mockPaymentToken: Contract;

describe("PrimaryMarket", () => {
  configureLogger({ level: LogLevel.SILENT });

  async function deployFixture() {
    const provider = new HardhatProvider();

    // Deploy factory system
    const deployment = await deployFactoryPrimaryMarketSystem(provider, "hardhat", {
      useTimeTravel: false,
      saveOutput: false,
    });

    factoryPrimaryMarket = (await ethers.getContractAt(
      "FactoryPrimaryMarket",
      deployment.infrastructure.factoryPrimaryMarket.proxy
    )) as IFactoryPrimaryMarket;

    accessControl = (await ethers.getContractAt(
      "AccessControl",
      deployment.infrastructure.factoryPrimaryMarket.proxy
    )) as IAccessControl;

    blr = (await ethers.getContractAt(
      "IBusinessLogicResolver",
      deployment.infrastructure.blr.proxy
    )) as IBusinessLogicResolver;

    // Grant PM_DEPLOYER_ROLE to admin
    await accessControl.grantRole(PM_DEPLOYER_ROLE, adminAddress);

    // Deploy Primary Market instance
    const RBACS = [
      {
        role: DEFAULT_ADMIN_ROLE,
        members: [adminAddress],
      },
      {
        role: OFFERING_CREATOR_ROLE,
        members: [offeringCreatorAddress],
      },
    ];

    const RESOLVER_PROXY_CONFIG = {
      key: PRIMARY_MARKET_CONFIG_ID,
      version: 0,
    };

    const tx = await factoryPrimaryMarket
      .connect(admin)
      .deployPrimaryMarket(blr.address, RESOLVER_PROXY_CONFIG, RBACS);

    const receipt = await tx.wait();

    // Find PrimaryMarketDeployed event
    const event = receipt.events?.find((e: any) => e.event === "PrimaryMarketDeployed");
    if (!event || !event.args) {
      throw new Error("PrimaryMarketDeployed event not found");
    }

    const primaryMarketAddress = event.args.primaryMarketAddress;
    primaryMarket = (await ethers.getContractAt("PrimaryMarket", primaryMarketAddress)) as IPrimaryMarket;

    // Deploy mock tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockPaymentToken = await MockERC20.deploy("Mock USDC", "USDC", 6);
    await mockPaymentToken.deployed();

    const MockBond = await ethers.getContractFactory("MockBond");
    mockAsset = await MockBond.deploy("Green Bond", "GB", treasuryAddress);
    await mockAsset.deployed();

    // Mint payment tokens to investors
    const mintAmount = ethers.utils.parseUnits("1000000", 6); // 1M USDC
    await mockPaymentToken.mint(investor1Address, mintAmount);
    await mockPaymentToken.mint(investor2Address, mintAmount);

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
    [deployer, admin, offeringCreator, investor1, investor2, treasury] = signers;
    adminAddress = await admin.getAddress();
    offeringCreatorAddress = await offeringCreator.getAddress();
    investor1Address = await investor1.getAddress();
    investor2Address = await investor2.getAddress();
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
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering))
        .to.emit(primaryMarket, "OfferingCreated");
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
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering)).to.be.revertedWithCustomError(
        primaryMarket,
        "WrongAsset"
      );
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
      };

      await expect(primaryMarket.connect(offeringCreator).createOffering(offering)).to.be.revertedWithCustomError(
        primaryMarket,
        "InvalidRuleCombination"
      );
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
      };

      await expect(primaryMarket.connect(investor1).createOffering(offering)).to.be.revertedWithCustomError(
        primaryMarket,
        "AccountHasNoRole"
      );
    });
  });

  describe("Offering Status Transitions", () => {
    let offeringId: number;

    beforeEach(async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
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
      };

      const tx = await primaryMarket.connect(offeringCreator).createOffering(offering);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "OfferingCreated");
      offeringId = event?.args?.offeringId?.toNumber() || 0; // Get offeringId from event
    });

    it("GIVEN offering before startDate WHEN checking status THEN PENDING", async () => {
      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(0); // PENDING
    });

    it("GIVEN offering after startDate WHEN checking status THEN OPEN", async () => {
      await time.increase(61); // Move past startDate
      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(1); // OPEN
    });

    it("GIVEN OVERSUBSCRIPTION_NOT_ALLOWED + WAIT_UNTIL_END WHEN target reached THEN CLOSED_TARGET_WAITING", async () => {
      await time.increase(61); // Move past startDate

      // Subscribe to reach target (100 lots * 100 tokens = 10,000 tokens)
      await primaryMarket.connect(investor1).submitSubscription(offeringId, 50);
      await primaryMarket.connect(investor2).submitSubscription(offeringId, 50);

      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(3); // CLOSED_TARGET_WAITING
    });

    it("GIVEN target reached and past endDate WHEN checking status THEN EXECUTABLE", async () => {
      await time.increase(61); // Move past startDate

      // Subscribe to reach target
      await primaryMarket.connect(investor1).submitSubscription(offeringId, 50);
      await primaryMarket.connect(investor2).submitSubscription(offeringId, 50);

      // Move past endDate
      await time.increase(3600);

      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(5); // EXECUTABLE
    });

    it("GIVEN target not reached and past endDate WHEN checking status THEN CANCELLABLE_ONLY", async () => {
      await time.increase(61); // Move past startDate

      // Subscribe but don't reach target (only 30 lots out of 100)
      await primaryMarket.connect(investor1).submitSubscription(offeringId, 30);

      // Move past endDate
      await time.increase(3600);

      const status = await primaryMarket.getOfferingStatus(offeringId);
      expect(status).to.equal(6); // CANCELLABLE_ONLY
    });
  });

  describe("Submitting Subscriptions", () => {
    let offeringId: number;

    beforeEach(async () => {
      const now = await time.latest();
      const offering: IPrimaryMarket.OfferingStruct = {
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
      };

      const tx = await primaryMarket.connect(offeringCreator).createOffering(offering);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "OfferingCreated");
      offeringId = event?.args?.offeringId?.toNumber() || 0; // Get offeringId from event
      await time.increase(61); // Move past startDate
    });

    it("GIVEN valid subscription WHEN submitting THEN success", async () => {
      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, 10))
        .to.emit(primaryMarket, "SubscriptionSubmitted")
        .withArgs(offeringId, 0, investor1Address, 10);
    });

    it("GIVEN subscription below minLots WHEN submitting THEN fail", async () => {
      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, 0)).to.be.revertedWithCustomError(
        primaryMarket,
        "WrongQuantities"
      );
    });

    it("GIVEN subscription above maxLots WHEN submitting THEN fail", async () => {
      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, 51)).to.be.revertedWithCustomError(
        primaryMarket,
        "WrongQuantities"
      );
    });

    it("GIVEN OVERSUBSCRIPTION_NOT_ALLOWED WHEN subscription exceeds target THEN fail", async () => {
      // First subscription: 90 lots (must be within maxLots=50, so use 45)
      await primaryMarket.connect(investor1).submitSubscription(offeringId, 45);
      await primaryMarket.connect(investor1).submitSubscription(offeringId, 45);

      // Second subscription would exceed target (45 + 45 + 20 = 110 > 100)
      await expect(primaryMarket.connect(investor2).submitSubscription(offeringId, 20)).to.be.revertedWithCustomError(
        primaryMarket,
        "WrongQuantities"
      );
    });

    it("GIVEN CLOSED_TARGET_WAITING status WHEN submitting THEN fail", async () => {
      // Reach target
      await primaryMarket.connect(investor1).submitSubscription(offeringId, 50);
      await primaryMarket.connect(investor2).submitSubscription(offeringId, 50);

      // Try to submit when status is CLOSED_TARGET_WAITING
      await expect(primaryMarket.connect(investor1).submitSubscription(offeringId, 1)).to.be.revertedWithCustomError(
        primaryMarket,
        "SubscriptionNotAcceptedForOffering"
      );
    });
  });

  describe("Reading Offering Data", () => {
    let offeringId: number;

    beforeEach(async () => {
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
      };

      const tx = await primaryMarket.connect(offeringCreator).createOffering(offering);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "OfferingCreated");
      offeringId = event?.args?.offeringId?.toNumber() || 0; // Get offeringId from event
    });

    it("GIVEN offering created WHEN getting total offerings THEN correct count", async () => {
      const total = await primaryMarket.getTotalOfferings();
      expect(total).to.equal(1);
    });

    it("GIVEN offering created WHEN getting offering details THEN correct data", async () => {
      const [offeringInfo, creator] = await primaryMarket.getOffering(offeringId);
      expect(offeringInfo.asset).to.equal(mockAsset.address);
      expect(offeringInfo.treasury).to.equal(treasuryAddress);
      expect(creator).to.equal(offeringCreatorAddress);
    });

    it("GIVEN subscriptions submitted WHEN getting total subscriptions THEN correct count", async () => {
      await time.increase(61);
      await primaryMarket.connect(investor1).submitSubscription(offeringId, 10);
      await primaryMarket.connect(investor2).submitSubscription(offeringId, 20);

      const total = await primaryMarket.getTotalSubscriptions(offeringId);
      expect(total).to.equal(2);
    });

    it("GIVEN subscription submitted WHEN getting subscription details THEN correct data", async () => {
      await time.increase(61);
      await primaryMarket.connect(investor1).submitSubscription(offeringId, 10);

      const [investor, lotUnits] = await primaryMarket.getSubscription(offeringId, 0);
      expect(investor).to.equal(investor1Address);
      expect(lotUnits).to.equal(10);
    });
  });
});

// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { PAYOUT_ROLE, PAUSER_ROLE } from "../../scripts/constants";
import { HEDERA_PRECOMPILED_ADDRESS } from "../constants";
import { deployPrecompiledMock } from "../helpers/deployment";
import { deployTreasury } from "../../scripts/workflows/deployTreasurySystemWithNewBlr";
import { configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import type { ITreasury, IPrecompiledMock } from "@contract-types";

describe("LifeCycleCashFlow operations", () => {
  configureLogger({ level: LogLevel.SILENT });

  let signer_A, signer_B;
  let treasury: ITreasury;
  let assetAddress: string;
  let paymentToken: Contract;
  let paymentTokenAddress: string;
  let assetMockContract: ContractFactory;
  let paymentTokenMockContract: ContractFactory;

  before(async () => {
    [signer_A, signer_B] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const deployment = await deployTreasury(signer_A, "hardhat", {
      useTimeTravel: false,
      saveOutput: false,
    });

    treasury = (await ethers.getContractAt("ITreasury", deployment.infrastructure.treasury.proxy)) as ITreasury;

    await deployPrecompiledMock();

    assetMockContract = await ethers.getContractFactory("AssetMock");
    paymentTokenMockContract = await ethers.getContractFactory("PaymentTokenMock");
    paymentToken = await paymentTokenMockContract.deploy("Tadios Stablecoin", "TSC", 2);
    await paymentToken.deployed();
    paymentTokenAddress = paymentToken.address;
  });

  describe("initialize_LifeCycleCashFlow", () => {
    beforeEach(async () => {
      const asset = await assetMockContract.deploy(2, 1, [], false, true);
      await asset.deployed();
      assetAddress = asset.address;

      treasury = treasury.connect(signer_A);
      await treasury.initialize_LifeCycleCashFlow(assetAddress);
    });

    it("GIVEN a LifeCycleCashFlow facet already initialized, WHEN trying to initialize again, THEN it reverts with AlreadyInitialized error", async () => {
      await expect(treasury.initialize_LifeCycleCashFlow(assetAddress)).to.be.revertedWithCustomError(
        treasury,
        "AlreadyInitialized",
      );
    });

    it("GIVEN a LifeCycleCashFlow facet, WHEN passing a zero address asset, THEN it reverts with InvalidAddressZero error", async () => {
      await expect(treasury.initialize_LifeCycleCashFlow(AddressZero)).to.be.revertedWithCustomError(
        treasury,
        "InvalidAddressZero",
      );
    });
  });

  describe("executeDistribution", () => {
    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution with the contract paused, THEN it reverts with TokenIsPaused error", async () => {
      await treasury.grantRole(PAUSER_ROLE, signer_A.address);
      await treasury.pause();

      await expect(treasury.executeDistribution(AddressZero, 1, 1, 1)).to.be.revertedWithCustomError(
        treasury,
        "TokenIsPaused",
      );
    });

    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN an account not granted the PAYOUT_ROLE role executes a distribution, THEN it reverts with AccountHasNoRole error", async () => {
      treasury = treasury.connect(signer_B);
      await expect(treasury.executeDistribution(AddressZero, 1, 1, 1))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_B.address, PAYOUT_ROLE);
    });

    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN an account with the PAYOUT_ROLE role revoked executes a distribution, THEN it reverts with AccountHasNoRole error", async () => {
      await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
      await treasury.revokeRole(PAYOUT_ROLE, signer_A.address);

      await expect(treasury.executeDistribution(AddressZero, 1, 1, 1))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_A.address, PAYOUT_ROLE);
    });

    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution of an address zero address, THEN it reverts with InvalidAddressZero error", async () => {
      await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
      await expect(treasury.executeDistribution(AddressZero, 1, 1, 1)).to.be.revertedWithCustomError(
        treasury,
        "InvalidAddressZero",
      );
    });

    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution of a random asset, THEN it reverts with InvalidAddressZero error", async () => {
      await treasury.grantRole(PAYOUT_ROLE, signer_A.address);

      const randomWallet = ethers.Wallet.createRandom();
      const privateKey = randomWallet.privateKey;

      await expect(treasury.executeDistribution(randomWallet.address, 1, 1, 1)).to.be.revertedWithCustomError(
        treasury,
        "InvalidAsset",
      );
    });

    describe("LifeCycleCashFlow with a distribution payment date that has not already arrived", () => {
      beforeEach(async () => {
        const asset = await assetMockContract.deploy(2, 1, [], false, true);
        await asset.deployed();
        assetAddress = asset.address;

        await treasury.initialize_LifeCycleCashFlow(assetAddress);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution on a non-distribution date, THEN it reverts with NotPaymentDate error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);

        await expect(treasury.executeDistribution(assetAddress, 1, 1, 1)).to.be.revertedWithCustomError(
          treasury,
          "NotPaymentDate",
        );
      });
    });

    describe("LifeCycleCashFlow with a distribution payment date equals to ZERO", () => {
      beforeEach(async () => {
        const asset = await assetMockContract.deploy(0, 1, [], false, true);
        await asset.deployed();
        assetAddress = asset.address;

        await treasury.initialize_LifeCycleCashFlow(assetAddress);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution on a ZERO date, THEN it reverts with NotPaymentDate error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);

        await expect(treasury.executeDistribution(assetAddress, 1, 1, 1)).to.be.revertedWithCustomError(
          treasury,
          "NotPaymentDate",
        );
      });
    });

    describe("LifeCycleCashFlow with a distribution payment date that has already arrived", () => {
      describe("Distribution a coupon without holders", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(1, 1, [], false, true);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and there are no holders, THEN false is returned as executed result", async () => {
          const [results, executed] = await treasury.callStatic.executeDistribution(assetAddress, 1, 1, 1);
          expect(executed).to.equal(false);
          expect(results).to.deep.equal([]);
        });
      });

      describe("Distribution a coupon when getting the distribution holders fails", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(
            1,
            1,
            ["0x0000000000000000000000000000000000000002"],
            false,
            true,
          );
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and getting the holders fails, THEN false is returned as executed result", async () => {
          const [results, executed] = await treasury.callStatic.executeDistribution(assetAddress, 1, 1, 1);
          expect(executed).to.equal(false);
          expect(results).to.deep.equal([]);
        });
      });

      describe("Distribution a coupon with an address zero holder", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(1, 1, [AddressZero], false, true);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and the holder has address zero, THEN a DistributionExecuted event is emitted with the holder in FAILED status", async () => {
          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.pageIndex).to.equal(1);
          expect(event.args.pageLength).to.equal(1);
          expect(event.args.results[0].holder).to.equal(AddressZero);
          expect(event.args.results[0].status).to.equal(1);
          expect(event.args.results[0].amount).to.equal(0);
        });
      });

      describe("Distribution a coupon with holders", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(1, 300, [signer_B.address], false, true);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and there is not enough balance, THEN a DistributionExecuted event is emitted with the holder in FAILED status", async () => {
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.pageIndex).to.equal(1);
          expect(event.args.pageLength).to.equal(1);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(1);
          expect(event.args.results[0].amount).to.equal(30000);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution twice, THEN a DistributionExecuted event is emitted with the holder in ALREADY PAID status", async () => {
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await paymentToken.mint(treasury.address, 10000000000);

          await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.pageIndex).to.equal(1);
          expect(event.args.pageLength).to.equal(1);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(2);
          expect(event.args.results[0].amount).to.equal(0);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution, THEN a DistributionExecuted event is emitted with the holder is SUCCEEDED status", async () => {
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await paymentToken.mint(treasury.address, 10000000000);

          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.pageIndex).to.equal(1);
          expect(event.args.pageLength).to.equal(1);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(0);
          expect(event.args.results[0].amount).to.equal(30000);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and payment token decimals are wrong, THEN it reverts with InvalidTokenDecimals error", async () => {
          const paymentToken = await paymentTokenMockContract.deploy("Tadios Stablecoin", "TSC", 2);
          await paymentToken.deployed();
          const paymentTokenAddress = paymentToken.address;
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          const precompiled = (await ethers.getContractAt(
            "IPrecompiledMock",
            HEDERA_PRECOMPILED_ADDRESS,
          )) as IPrecompiledMock;
          await precompiled.setPrecompiledNegativeDecimals(true);

          await expect(treasury.executeDistribution(assetAddress, 1, 1, 1))
            .to.be.revertedWithCustomError(treasury, "InvalidTokenDecimals")
            .withArgs(paymentTokenAddress, -1);

          await precompiled.setPrecompiledNegativeDecimals(false);
        });
      });

      describe("Distribution a coupon when getting payment token decimals fails", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(1, 10, [signer_B.address], false, true);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and getting payment token decimals fails, THEN it reverts with a GetTokenDecimalsFailed error", async () => {
          await expect(treasury.executeDistribution(assetAddress, 1, 1, 1))
            .to.be.revertedWithCustomError(treasury, "GetTokenDecimalsFailed")
            .withArgs(AddressZero, 21);
        });
      });

      describe("Distribution a coupon with two holders", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(1, 300, [signer_B.address, signer_A.address], false, true);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution, THEN a DistributionExecuted event is emitted with both holders in SUCCEEDED status", async () => {
          await paymentToken.mint(treasury.address, 1000000);

          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 2);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.pageIndex).to.equal(1);
          expect(event.args.pageLength).to.equal(2);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[1].holder).to.equal(signer_A.address);
          expect(event.args.results[0].status).to.equal(0);
          expect(event.args.results[1].status).to.equal(0);
          expect(event.args.results[0].amount).to.equal(30000);
          expect(event.args.results[1].amount).to.equal(30000);
        });
      });

      describe("Distribution a coupon with holders and a great amount of tokens", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(1, 28054423280000000000n, [signer_B.address], false, true);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution to a holder so the amount to pay is greater than the max amount (int64), THEN a DistributionExecuted event is emitted with the holder in FAILED status", async () => {
          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.pageIndex).to.equal(1);
          expect(event.args.pageLength).to.equal(1);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(1);
          expect(event.args.results[0].amount).to.equal(0);
        });
      });
    });
  });

  describe("executeDistributionByAddresses", () => {
    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution with the contract paused, THEN it reverts with TokenIsPaused error", async () => {
      await treasury.grantRole(PAUSER_ROLE, signer_A.address);
      await treasury.pause();

      await expect(treasury.executeDistributionByAddresses(AddressZero, 1, [])).to.be.revertedWithCustomError(
        treasury,
        "TokenIsPaused",
      );
    });

    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN an account not granted the PAYOUT_ROLE role executes a distribution, THEN it reverts with AccountHasNoRole error", async () => {
      treasury = treasury.connect(signer_B);
      await expect(treasury.executeDistributionByAddresses(AddressZero, 1, []))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_B.address, PAYOUT_ROLE);
    });

    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN an account with the PAYOUT_ROLE role revoked executes a distribution, THEN it reverts with AccountHasNoRole error", async () => {
      await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
      await treasury.revokeRole(PAYOUT_ROLE, signer_A.address);

      await expect(treasury.executeDistributionByAddresses(AddressZero, 1, []))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_A.address, PAYOUT_ROLE);
    });

    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution of an address zero address, THEN it reverts with InvalidAddressZero error", async () => {
      await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
      await expect(treasury.executeDistributionByAddresses(AddressZero, 1, [])).to.be.revertedWithCustomError(
        treasury,
        "InvalidAddressZero",
      );
    });

    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution of a random asset, THEN it reverts with InvalidAddressZero error", async () => {
      await treasury.grantRole(PAYOUT_ROLE, signer_A.address);

      const randomWallet = ethers.Wallet.createRandom();
      const privateKey = randomWallet.privateKey;

      await expect(treasury.executeDistributionByAddresses(randomWallet.address, 1, [])).to.be.revertedWithCustomError(
        treasury,
        "InvalidAsset",
      );
    });

    describe("LifeCycleCashFlow with a distribution payment date that has not already arrived", () => {
      beforeEach(async () => {
        const asset = await assetMockContract.deploy(2, 1, [], false, true);
        await asset.deployed();
        assetAddress = asset.address;
        await treasury.initialize_LifeCycleCashFlow(assetAddress);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution on a non-distribution date, THEN it reverts with NotPaymentDate error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);

        await expect(treasury.executeDistributionByAddresses(assetAddress, 1, [])).to.be.revertedWithCustomError(
          treasury,
          "NotPaymentDate",
        );
      });
    });

    describe("LifeCycleCashFlow with a distribution payment date equals to ZERO", () => {
      beforeEach(async () => {
        const asset = await assetMockContract.deploy(0, 1, [], false, true);
        await asset.deployed();
        assetAddress = asset.address;

        await treasury.initialize_LifeCycleCashFlow(assetAddress);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution by addresses on a ZERO date, THEN it reverts with NotPaymentDate error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);

        await expect(treasury.executeDistributionByAddresses(assetAddress, 1, [])).to.be.revertedWithCustomError(
          treasury,
          "NotPaymentDate",
        );
      });
    });

    describe("LifeCycleCashFlow with a distribution payment date that has already arrived", () => {
      describe("Distribution a coupon without holders", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(1, 1, [], false, true);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and there are no holders, THEN DistributionByAddressesExecuted event is emitted with empty arrays", async () => {
          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, []);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.holders).to.deep.equal([]);
          expect(event.args.results).to.deep.equal([]);
        });
      });

      describe("Distribution a coupon with an address zero holder", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(1, 1, [AddressZero], false, true);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and the holder has address zero, THEN a DistributionExecuted event is emitted with the holder in FAILED status", async () => {
          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [AddressZero]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.holders[0]).to.equal(AddressZero);
          expect(event.args.results[0].holder).to.equal(AddressZero);
          expect(event.args.results[0].status).to.equal(1);
          expect(event.args.results[0].amount).to.equal(0);
        });
      });

      describe("Distribution a coupon with holders", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(1, 300, [signer_B.address], false, true);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and there is not enough balance, THEN a DistributionExecuted event is emitted with the holder in FAILED status", async () => {
          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(1);
          expect(event.args.results[0].amount).to.equal(30000);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution twice, THEN a DistributionExecuted event is emitted with the holder in ALREADY PAID status", async () => {
          await paymentToken.mint(treasury.address, 10000000000);

          await treasury.executeDistributionByAddresses(assetAddress, 1, [signer_B.address]);
          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(2);
          expect(event.args.results[0].amount).to.equal(0);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution, THEN a DistributionExecuted event is emitted with holder in SUCCEEDED status", async () => {
          await paymentToken.mint(treasury.address, 1000000);

          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(0);
          expect(event.args.results[0].amount).to.equal(30000);
        });
      });

      describe("Distribution a coupon with two holders", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(1, 300, [signer_B.address, signer_A.address], false, true);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution, THEN a DistributionExecuted event is emitted with both holders in SUCCEEDED status", async () => {
          await paymentToken.mint(treasury.address, 1000000);

          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [
            signer_B.address,
            signer_A.address,
          ]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.holders[1]).to.equal(signer_A.address);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[1].holder).to.equal(signer_A.address);
          expect(event.args.results[0].status).to.equal(0);
          expect(event.args.results[1].status).to.equal(0);
          expect(event.args.results[0].amount).to.equal(30000);
          expect(event.args.results[1].amount).to.equal(30000);
        });
      });

      describe("Distribution a coupon with two holders of a great amount of tokens", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(
            1,
            90000000000000000n,
            [signer_B.address, signer_A.address],
            false,
            true,
          );
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution with a great amount to pay to every holder, THEN a DistributionExecuted event is emitted with both holders in SUCCEEDED status", async () => {
          await paymentToken.mint(treasury.address, 18000000000000000000n);

          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [
            signer_B.address,
            signer_A.address,
          ]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.holders[1]).to.equal(signer_A.address);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[1].holder).to.equal(signer_A.address);
          expect(event.args.results[0].status).to.equal(0);
          expect(event.args.results[1].status).to.equal(0);
          expect(event.args.results[0].amount).to.equal(9000000000000000000n);
          expect(event.args.results[1].amount).to.equal(9000000000000000000n);
        });
      });

      describe("Distribution a coupon with holders and a great amount of tokens", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(1, 922337203685477589n, [signer_B.address], false, true);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution to a holder so the amount to pay is greater than the max amount (int64), THEN a DistributionExecuted event is emitted with the holder in FAILED status", async () => {
          await paymentToken.mint(treasury.address, 999999999999999999n);

          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(1);
          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(1);
          expect(event.args.results[0].amount).to.equal(0);
        });
      });
    });
  });

  describe("getAsset", () => {
    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN an account gets the asset, THEN asset is obtained", async () => {
      const asset = await assetMockContract.deploy(2, 1, [], false, true);
      await asset.deployed();
      assetAddress = asset.address;

      treasury = treasury.connect(signer_A);
      await treasury.initialize_LifeCycleCashFlow(assetAddress);

      const a = await treasury.getAsset();
      expect(await treasury.getAsset()).to.equal(asset.address);
    });
  });
});

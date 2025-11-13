// SPDX-License-Identifier: Apache-2.0

import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";
import { deployContract, deployPaymentToken } from "../helpers/deployment";
import { deployTreasury } from "../../scripts/workflows/deployTreasury";
import { ITreasury, ITreasury__factory } from "@contract-types";
import { AssetMock__factory } from "@contract-types";
import { PAYOUT_ROLE, PAUSER_ROLE } from "../../scripts/constants";

describe("LifeCycleCashFlow operations", () => {
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;
  let treasury: ITreasury;
  let assetAddress: string;
  let paymentTokenAddress: string;
  let paymentTokenFactoryAddress: string;

  beforeEach(async () => {
    [signer_A, signer_B] = await ethers.getSigners();

    const deployment = await deployTreasury(signer_A, "hardhat", {
      useTimeTravel: false,
      saveOutput: false,
    });

    treasury = ITreasury__factory.connect(deployment.infrastructure.treasury.proxy, signer_A);
  });

  describe("initialize_LifeCycleCashFlow", () => {
    beforeEach(async () => {
      const assetFactory = new AssetMock__factory(signer_A);
      assetAddress = await deployContract(assetFactory, [false, 1, [], false]);

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
    describe("LifeCycleCashFlow with a distribution payment date that has not already arrived", () => {
      beforeEach(async () => {
        const assetFactory = new AssetMock__factory(signer_A);
        assetAddress = await deployContract(assetFactory, [false, 1, [], false]);
        await treasury.initialize_LifeCycleCashFlow(assetAddress);
      });

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

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution on a non-distribution date, THEN it reverts with NotPaymentDate error", async () => {
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
          const assetFactory = new AssetMock__factory(signer_A);
          assetAddress = await deployContract(assetFactory, [true, 1, [], false]);
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and there are no holders, THEN false is returned as executed result", async () => {
          const [result, executed] = await treasury.callStatic.executeDistribution(assetAddress, 1, 1, 1);
          expect(executed).to.equal(false);
        });
      });

      describe("Distribution a coupon with an address zero holder", () => {
        beforeEach(async () => {
          const assetFactory = new AssetMock__factory(signer_A);
          assetAddress = await deployContract(assetFactory, [true, 1, [AddressZero], false]);
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and the holder has address zero, THEN a DistributionExecuted event is emitted with all arrays containing address zero", async () => {
          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.pageIndex).to.equal(BigNumber.from(1));
          expect(event.args.pageLength).to.equal(BigNumber.from(1));
          expect(event.args.result.failedAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.succeededAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.paidAmounts[0]).to.equal(BigNumber.from(0));
        });
      });

      describe("Distribution a coupon with holders", () => {
        beforeEach(async () => {
          const assetFactory = new AssetMock__factory(signer_A);
          assetAddress = await deployContract(assetFactory, [true, 300000, [signer_B.address], false]);
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          [paymentTokenFactoryAddress, paymentTokenAddress] = await deployPaymentToken(signer_A, 10000000000, 2);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and there is not enough balance, THEN a DistributionExecuted event is emitted with the holder in the failed array", async () => {
          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.pageIndex).to.equal(BigNumber.from(1));
          expect(event.args.pageLength).to.equal(BigNumber.from(1));
          expect(event.args.result.failedAddresses[0]).to.equal(signer_B.address);
          expect(event.args.result.succeededAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.paidAmounts[0]).to.equal(BigNumber.from(0));
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution twice, THEN a DistributionExecuted event is emitted with the holder in the already paid array", async () => {
          let paymentTokenFactory = await ethers.getContractAt("PaymentTokenFactory", paymentTokenFactoryAddress);
          paymentTokenFactory = paymentTokenFactory.connect(signer_A);
          await paymentTokenFactory.transferPaymentToken(paymentTokenAddress, treasury.address, 10000000000);

          await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.pageIndex).to.equal(BigNumber.from(1));
          expect(event.args.pageLength).to.equal(BigNumber.from(1));
          expect(event.args.result.failedAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.succeededAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(signer_B.address);
          expect(event.args.result.paidAmounts[0]).to.equal(BigNumber.from(0));
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution, THEN a DistributionExecuted event is emitted", async () => {
          let paymentTokenFactory = await ethers.getContractAt("PaymentTokenFactory", paymentTokenFactoryAddress);
          paymentTokenFactory = paymentTokenFactory.connect(signer_A);
          await paymentTokenFactory.transferPaymentToken(paymentTokenAddress, treasury.address, 1000000);

          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.pageIndex).to.equal(BigNumber.from(1));
          expect(event.args.pageLength).to.equal(BigNumber.from(1));
          expect(event.args.result.failedAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.succeededAddresses[0]).to.equal(signer_B.address);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.paidAmounts[0]).to.equal(BigNumber.from(98600));
        });
      });

      describe("Distribution a coupon with two holders", () => {
        beforeEach(async () => {
          const assetFactory = new AssetMock__factory(signer_A);
          assetAddress = await deployContract(assetFactory, [
            true,
            300000,
            [signer_B.address, signer_A.address],
            false,
          ]);
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          [paymentTokenFactoryAddress, paymentTokenAddress] = await deployPaymentToken(signer_A, 10000000000, 2);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution, THEN a DistributionExecuted event is emitted", async () => {
          let paymentTokenFactory = await ethers.getContractAt("PaymentTokenFactory", paymentTokenFactoryAddress);
          paymentTokenFactory = paymentTokenFactory.connect(signer_A);
          await paymentTokenFactory.transferPaymentToken(paymentTokenAddress, treasury.address, 1000000);

          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 2);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.pageIndex).to.equal(BigNumber.from(1));
          expect(event.args.pageLength).to.equal(BigNumber.from(2));
          expect(event.args.result.failedAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.failedAddresses[1]).to.equal(AddressZero);
          expect(event.args.result.succeededAddresses[0]).to.equal(signer_B.address);
          expect(event.args.result.succeededAddresses[1]).to.equal(signer_A.address);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.alreadyPaidAddresses[1]).to.equal(AddressZero);
          expect(event.args.result.paidAmounts[0]).to.equal(BigNumber.from(98600));
          expect(event.args.result.paidAmounts[1]).to.equal(BigNumber.from(98600));
        });
      });

      describe("Distribution a coupon with holders and a great amount of tokens", () => {
        beforeEach(async () => {
          const assetFactory = new AssetMock__factory(signer_A);
          assetAddress = await deployContract(assetFactory, [true, 28054423280000000000n, [signer_B.address], false]);
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          [paymentTokenFactoryAddress, paymentTokenAddress] = await deployPaymentToken(signer_A, 1, 2);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          let paymentTokenFactory = await ethers.getContractAt("PaymentTokenFactory", paymentTokenFactoryAddress);
          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution to a holder so the amount to pay is greater than the max amount (int64), THEN a DistributionExecuted event is emitted with the holder in the failed array", async () => {
          const tx = await treasury.executeDistribution(assetAddress, 1, 1, 1);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.pageIndex).to.equal(BigNumber.from(1));
          expect(event.args.pageLength).to.equal(BigNumber.from(1));
          expect(event.args.result.failedAddresses[0]).to.equal(signer_B.address);
          expect(event.args.result.succeededAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.paidAmounts[0]).to.equal(0);
        });
      });
    });
  });

  describe("executeDistributionByAddresses", () => {
    describe("LifeCycleCashFlow with a distribution payment date that has not already arrived", () => {
      beforeEach(async () => {
        const assetFactory = new AssetMock__factory(signer_A);
        assetAddress = await deployContract(assetFactory, [false, 1, [], false]);
        await treasury.initialize_LifeCycleCashFlow(assetAddress);
      });

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

        await expect(
          treasury.executeDistributionByAddresses(randomWallet.address, 1, []),
        ).to.be.revertedWithCustomError(treasury, "InvalidAsset");
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution on a non-distribution date, THEN it reverts with NotPaymentDate error", async () => {
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
          const assetFactory = new AssetMock__factory(signer_A);
          assetAddress = await deployContract(assetFactory, [true, 1, [], false]);
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and there are no holders, THEN DistributionByAddressesExecuted event is emitted with empty arrays", async () => {
          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, []);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.holders).to.deep.equal([]);
          expect(event.args.result.failedAddresses).to.deep.equal([]);
          expect(event.args.result.succeededAddresses).to.deep.equal([]);
          expect(event.args.result.alreadyPaidAddresses).to.deep.equal([]);
          expect(event.args.result.paidAmounts).to.deep.equal([]);
        });
      });

      describe("Distribution a coupon with an address zero holder", () => {
        beforeEach(async () => {
          const assetFactory = new AssetMock__factory(signer_A);
          assetAddress = await deployContract(assetFactory, [true, 1, [AddressZero], false]);
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and the holder has address zero, THEN a DistributionExecuted event is emitted with all arrays containing address zero", async () => {
          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [AddressZero]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.holders[0]).to.equal(AddressZero);
          expect(event.args.result.failedAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.succeededAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.paidAmounts[0]).to.equal(BigNumber.from(0));
        });
      });

      describe("Distribution a coupon with holders", () => {
        beforeEach(async () => {
          const assetFactory = new AssetMock__factory(signer_A);
          assetAddress = await deployContract(assetFactory, [true, 300000, [signer_B.address], false]);
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          [paymentTokenFactoryAddress, paymentTokenAddress] = await deployPaymentToken(signer_A, 10000000000, 2);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution and there is not enough balance, THEN a DistributionExecuted event is emitted with the holder in the failed array", async () => {
          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.result.failedAddresses[0]).to.equal(signer_B.address);
          expect(event.args.result.succeededAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.paidAmounts[0]).to.equal(BigNumber.from(0));
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution twice, THEN a DistributionExecuted event is emitted with the holder in the already paid array", async () => {
          let paymentTokenFactory = await ethers.getContractAt("PaymentTokenFactory", paymentTokenFactoryAddress);
          paymentTokenFactory = paymentTokenFactory.connect(signer_A);
          await paymentTokenFactory.transferPaymentToken(paymentTokenAddress, treasury.address, 10000000000);

          await treasury.executeDistributionByAddresses(assetAddress, 1, [signer_B.address]);
          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.result.failedAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.succeededAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(signer_B.address);
          expect(event.args.result.paidAmounts[0]).to.equal(BigNumber.from(0));
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution, THEN a DistributionExecuted event is emitted", async () => {
          let paymentTokenFactory = await ethers.getContractAt("PaymentTokenFactory", paymentTokenFactoryAddress);
          paymentTokenFactory = paymentTokenFactory.connect(signer_A);
          await paymentTokenFactory.transferPaymentToken(paymentTokenAddress, treasury.address, 1000000);

          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.result.failedAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.succeededAddresses[0]).to.equal(signer_B.address);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.paidAmounts[0]).to.equal(BigNumber.from(98600));
        });
      });

      describe("Distribution a coupon with two holders", () => {
        beforeEach(async () => {
          const assetFactory = new AssetMock__factory(signer_A);
          assetAddress = await deployContract(assetFactory, [
            true,
            300000,
            [signer_B.address, signer_A.address],
            false,
          ]);
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          [paymentTokenFactoryAddress, paymentTokenAddress] = await deployPaymentToken(signer_A, 10000000000, 2);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution, THEN a DistributionExecuted event is emitted", async () => {
          let paymentTokenFactory = await ethers.getContractAt("PaymentTokenFactory", paymentTokenFactoryAddress);
          paymentTokenFactory = paymentTokenFactory.connect(signer_A);
          await paymentTokenFactory.transferPaymentToken(paymentTokenAddress, treasury.address, 1000000);

          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [
            signer_B.address,
            signer_A.address,
          ]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.holders[1]).to.equal(signer_A.address);
          expect(event.args.result.failedAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.failedAddresses[1]).to.equal(AddressZero);
          expect(event.args.result.succeededAddresses[0]).to.equal(signer_B.address);
          expect(event.args.result.succeededAddresses[1]).to.equal(signer_A.address);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.alreadyPaidAddresses[1]).to.equal(AddressZero);
          expect(event.args.result.paidAmounts[0]).to.equal(BigNumber.from(98600));
          expect(event.args.result.paidAmounts[1]).to.equal(BigNumber.from(98600));
        });
      });

      describe("Distribution a coupon with holders and a great amount of tokens", () => {
        beforeEach(async () => {
          const assetFactory = new AssetMock__factory(signer_A);
          assetAddress = await deployContract(assetFactory, [true, 28054423280000000000n, [signer_B.address], false]);
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          [paymentTokenFactoryAddress, paymentTokenAddress] = await deployPaymentToken(signer_A, 1, 2);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          let paymentTokenFactory = await ethers.getContractAt("PaymentTokenFactory", paymentTokenFactoryAddress);
          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution to a holder so the amount to pay is greater than the max amount (int64), THEN a DistributionExecuted event is emitted with the holder in the failed array", async () => {
          const tx = await treasury.executeDistributionByAddresses(assetAddress, 1, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "DistributionByAddressesExecuted");

          expect(event.args.distributionID).to.equal(BigNumber.from(1));
          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.result.failedAddresses[0]).to.equal(signer_B.address);
          expect(event.args.result.succeededAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.alreadyPaidAddresses[0]).to.equal(AddressZero);
          expect(event.args.result.paidAmounts[0]).to.equal(0);
        });
      });
    });
  });
});

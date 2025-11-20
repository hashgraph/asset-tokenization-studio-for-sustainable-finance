// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { PAYOUT_ROLE, PAUSER_ROLE } from "../../scripts/constants";
import { deployPrecompiledMock } from "../helpers/deployment";
import { deployTreasury } from "../../scripts/workflows/deployTreasurySystemWithNewBlr";
import { configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import type { ITreasury } from "@contract-types";

describe("LifeCycleCashFlow operations", () => {
  configureLogger({ level: LogLevel.SILENT });

  let signer_A, signer_B;
  let treasury: ITreasury;
  let assetAddress: string;
  let paymentToken: Contract;
  let paymentTokenAddress: string;
  let assetMockContract: ContractFactory;

  beforeEach(async () => {
    [signer_A, signer_B] = await ethers.getSigners();
    const deployment = await deployTreasury(signer_A, "hardhat", {
      useTimeTravel: false,
      saveOutput: false,
    });

    treasury = (await ethers.getContractAt("ITreasury", deployment.infrastructure.treasury.proxy)) as ITreasury;

    await deployPrecompiledMock();

    assetMockContract = await ethers.getContractFactory("AssetMock");
    const paymentTokenMockContract = await ethers.getContractFactory("PaymentTokenMock");
    paymentToken = await paymentTokenMockContract.deploy("Tadios Stablecoin", "TSC", 2);
    await paymentToken.deployed();
    paymentTokenAddress = paymentToken.address;
  });

  describe("initialize_LifeCycleCashFlow", () => {
    beforeEach(async () => {
      const asset = await assetMockContract.deploy(false, 1, [], false);
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

  describe("executeBondRedemption", () => {
    describe("LifeCycleCashFlow with a redemption date that has not already arrived", () => {
      beforeEach(async () => {
        const asset = await assetMockContract.deploy(false, 1, [], false);
        await asset.deployed();
        assetAddress = asset.address;
        await treasury.initialize_LifeCycleCashFlow(assetAddress);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a bond redemption with the contract paused, THEN it reverts with TokenIsPaused error", async () => {
        await treasury.grantRole(PAUSER_ROLE, signer_A.address);
        await treasury.pause();

        await expect(treasury.executeBondRedemption(AddressZero, 1, 1)).to.be.revertedWithCustomError(
          treasury,
          "TokenIsPaused",
        );
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN an account not granted the PAYOUT_ROLE role executes a bond redemption, THEN it reverts with AccountHasNoRole error", async () => {
        treasury = treasury.connect(signer_B);
        await expect(treasury.executeBondRedemption(AddressZero, 1, 1))
          .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
          .withArgs(signer_B.address, PAYOUT_ROLE);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN an account with the PAYOUT_ROLE role revoked executes a bond redemption, THEN it reverts with AccountHasNoRole error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        await treasury.revokeRole(PAYOUT_ROLE, signer_A.address);

        await expect(treasury.executeBondRedemption(AddressZero, 1, 1))
          .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
          .withArgs(signer_A.address, PAYOUT_ROLE);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a bond redemption of a zero address bond, THEN it reverts with InvalidAddressZero error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        await expect(treasury.executeBondRedemption(AddressZero, 1, 1)).to.be.revertedWithCustomError(
          treasury,
          "InvalidAddressZero",
        );
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a bond redemption of a random bond, THEN it reverts with InvalidAddressZero error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);

        const randomWallet = ethers.Wallet.createRandom();
        const privateKey = randomWallet.privateKey;

        await expect(treasury.executeBondRedemption(randomWallet.address, 1, 1)).to.be.revertedWithCustomError(
          treasury,
          "InvalidAsset",
        );
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a bond redemption on a non-redemption date, THEN it reverts with NotPaymentDate error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);

        await expect(treasury.executeBondRedemption(assetAddress, 1, 1)).to.be.revertedWithCustomError(
          treasury,
          "NotPaymentDate",
        );
      });
    });

    describe("LifeCycleCashFlow with a redemption date that has already arrived", () => {
      describe("Redeem a bond without holders", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(true, 1, [], false);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption and there are no holders, THEN false is returned as executed result", async () => {
          const [result, executed] = await treasury.callStatic.executeBondRedemption(assetAddress, 1, 1);
          expect(executed).to.equal(false);
        });
      });
    });

    describe("Redeem a bond with an address zero holder", () => {
      beforeEach(async () => {
        const asset = await assetMockContract.deploy(true, 1, [AddressZero], false);
        await asset.deployed();
        assetAddress = asset.address;
        await treasury.initialize_LifeCycleCashFlow(assetAddress);

        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption and the holder has address zero, THEN a RedemptionExecuted event is emitted when the holder in FAILED status", async () => {
        const tx = await treasury.executeBondRedemption(assetAddress, 1, 1);
        const receipt = await tx.wait();
        const event = receipt.events.find((e) => e.event === "RedemptionExecuted");

        expect(event.args.pageIndex).to.equal(BigNumber.from(1));
        expect(event.args.pageLength).to.equal(BigNumber.from(1));
        expect(event.args.results[0].holder).to.equal(AddressZero);
        expect(event.args.results[0].status).to.equal(1);
        expect(event.args.results[0].amount).to.equal(BigNumber.from(0));
      });
    });

    describe("Redeem a bond with holders", () => {
      beforeEach(async () => {
        const asset = await assetMockContract.deploy(true, 120, [signer_B.address], false);
        await asset.deployed();
        assetAddress = asset.address;
        await treasury.initialize_LifeCycleCashFlow(assetAddress);
        await treasury.initialize_Portfolio(paymentTokenAddress, []);

        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a bond redemption and there is not enough balance, THEN a RedemptionExecuted event is emitted with the holder in FAILED status", async () => {
        const tx = await treasury.executeBondRedemption(assetAddress, 1, 1);
        const receipt = await tx.wait();
        const event = receipt.events.find((e) => e.event === "RedemptionExecuted");

        expect(event.args.pageIndex).to.equal(BigNumber.from(1));
        expect(event.args.pageLength).to.equal(BigNumber.from(1));
        expect(event.args.results[0].holder).to.equal(signer_B.address);
        expect(event.args.results[0].status).to.equal(1);
        expect(event.args.results[0].amount).to.equal(BigNumber.from(0));
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption twice, THEN a RedemptionExecuted event is emitted with the holder in SUCCEEDED status", async () => {
        await paymentToken.mint(treasury.address, 10000000000);

        await treasury.executeBondRedemption(assetAddress, 1, 1);
        const tx = await treasury.executeBondRedemption(assetAddress, 1, 1);
        const receipt = await tx.wait();
        const event = receipt.events.find((e) => e.event === "RedemptionExecuted");

        expect(event.args.pageIndex).to.equal(BigNumber.from(1));
        expect(event.args.pageLength).to.equal(BigNumber.from(1));
        expect(event.args.results[0].holder).to.equal(signer_B.address);
        expect(event.args.results[0].status).to.equal(0);
        expect(event.args.results[0].amount).to.equal(BigNumber.from(24000));
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption, THEN a RedemptionExecuted event is emitted when the holder in SUCCEEDED status", async () => {
        await paymentToken.mint(treasury.address, 1000000);

        const tx = await treasury.executeBondRedemption(assetAddress, 1, 1);
        const receipt = await tx.wait();
        const event = receipt.events.find((e) => e.event === "RedemptionExecuted");

        expect(event.args.pageIndex).to.equal(BigNumber.from(1));
        expect(event.args.pageLength).to.equal(BigNumber.from(1));
        expect(event.args.results[0].holder).to.equal(signer_B.address);
        expect(event.args.results[0].status).to.equal(0);
        expect(event.args.results[0].amount).to.equal(BigNumber.from(24000));
      });
    });

    describe("Redeem a bond with two holders", () => {
      beforeEach(async () => {
        const asset = await assetMockContract.deploy(true, 120, [signer_B.address, signer_A.address], false);
        await asset.deployed();
        assetAddress = asset.address;
        await treasury.initialize_LifeCycleCashFlow(assetAddress);
        await treasury.initialize_Portfolio(paymentTokenAddress, []);

        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN redeeming a bond, THEN a RedemptionExecuted event is emitted with both holders in SUCCEEDED status", async () => {
        await paymentToken.mint(treasury.address, 1000000);

        const tx = await treasury.executeBondRedemption(assetAddress, 1, 2);
        const receipt = await tx.wait();
        const event = receipt.events.find((e) => e.event === "RedemptionExecuted");

        expect(event.args.pageIndex).to.equal(BigNumber.from(1));
        expect(event.args.pageLength).to.equal(BigNumber.from(2));
        expect(event.args.results[0].holder).to.equal(signer_B.address);
        expect(event.args.results[1].holder).to.equal(signer_A.address);
        expect(event.args.results[0].status).to.equal(0);
        expect(event.args.results[1].status).to.equal(0);
        expect(event.args.results[0].amount).to.equal(BigNumber.from(24000));
        expect(event.args.results[1].amount).to.equal(BigNumber.from(24000));
      });
    });

    describe("Redeem a bond with holders and a great amount of tokens", () => {
      beforeEach(async () => {
        const asset = await assetMockContract.deploy(true, 4611686018000n, [signer_B.address], false);
        await asset.deployed();
        assetAddress = asset.address;
        await treasury.initialize_LifeCycleCashFlow(assetAddress);
        await treasury.initialize_Portfolio(paymentTokenAddress, []);

        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN redeeming a bond for a holder so the amount to pay is greater than the max amount (int64), THEN a RedemptionExecuted event is emitted with the holder in FAILED status", async () => {
        const tx = await treasury.executeBondRedemption(assetAddress, 1, 1);
        const receipt = await tx.wait();
        const event = receipt.events.find((e) => e.event === "RedemptionExecuted");

        expect(event.args.pageIndex).to.equal(BigNumber.from(1));
        expect(event.args.pageLength).to.equal(BigNumber.from(1));
        expect(event.args.results[0].holder).to.equal(signer_B.address);
        expect(event.args.results[0].status).to.equal(1);
        expect(event.args.results[0].amount).to.equal(0);
      });
    });
  });

  describe("executeBondRedemptionByAddresses", () => {
    describe("LifeCycleCashFlow with a redemption date that has not already arrived", () => {
      beforeEach(async () => {
        const asset = await assetMockContract.deploy(false, 1, [], false);
        await asset.deployed();
        assetAddress = asset.address;
        await treasury.initialize_LifeCycleCashFlow(assetAddress);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing redemption with the contract paused, THEN it reverts with TokenIsPaused error", async () => {
        await treasury.grantRole(PAUSER_ROLE, signer_A.address);
        await treasury.pause();

        await expect(treasury.executeBondRedemptionByAddresses(AddressZero, [])).to.be.revertedWithCustomError(
          treasury,
          "TokenIsPaused",
        );
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN an account not granted the PAYOUT_ROLE role executes a redemption, THEN it reverts with AccountHasNoRole error", async () => {
        treasury = treasury.connect(signer_B);
        await expect(treasury.executeBondRedemptionByAddresses(AddressZero, []))
          .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
          .withArgs(signer_B.address, PAYOUT_ROLE);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN an account with the PAYOUT_ROLE role revoked executes a redemption, THEN it reverts with AccountHasNoRole error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        await treasury.revokeRole(PAYOUT_ROLE, signer_A.address);

        await expect(treasury.executeBondRedemptionByAddresses(AddressZero, []))
          .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
          .withArgs(signer_A.address, PAYOUT_ROLE);
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption of an address zero address, THEN it reverts with InvalidAddressZero error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        await expect(treasury.executeBondRedemptionByAddresses(AddressZero, [])).to.be.revertedWithCustomError(
          treasury,
          "InvalidAddressZero",
        );
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption of a random asset, THEN it reverts with InvalidAddressZero error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);

        const randomWallet = ethers.Wallet.createRandom();
        const privateKey = randomWallet.privateKey;

        await expect(treasury.executeBondRedemptionByAddresses(randomWallet.address, [])).to.be.revertedWithCustomError(
          treasury,
          "InvalidAsset",
        );
      });

      it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption on a non-redemption date, THEN it reverts with NotPaymentDate error", async () => {
        await treasury.grantRole(PAYOUT_ROLE, signer_A.address);

        await expect(treasury.executeBondRedemptionByAddresses(assetAddress, [])).to.be.revertedWithCustomError(
          treasury,
          "NotPaymentDate",
        );
      });
    });

    describe("LifeCycleCashFlow with a redemption payment date that has already arrived", () => {
      describe("Redeem a bond without holders", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(true, 1, [], false);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption and there are no holders, THEN RedemptionByAddressesExecuted event is emitted with empty result array", async () => {
          const tx = await treasury.executeBondRedemptionByAddresses(assetAddress, []);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "RedemptionByAddressesExecuted");

          expect(event.args.holders).to.deep.equal([]);
          expect(event.args.results).to.deep.equal([]);
        });
      });

      describe("Redeem a bond with an address zero holder", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(true, 1, [AddressZero], false);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption and the holder has address zero, THEN a RedemptionByAddressesExecuted event is emitted with the holder in FAILED status", async () => {
          const tx = await treasury.executeBondRedemptionByAddresses(assetAddress, [AddressZero]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "RedemptionByAddressesExecuted");

          expect(event.args.holders[0]).to.equal(AddressZero);
          expect(event.args.results[0].holder).to.equal(AddressZero);
          expect(event.args.results[0].status).to.equal(1);
          expect(event.args.results[0].amount).to.equal(BigNumber.from(0));
        });
      });

      describe("Redeem a bond with holders", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(true, 120, [signer_B.address], false);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption and there is not enough balance, THEN a RedemptionByAddressesExecuted event is emitted with the holder in FAILED status", async () => {
          const tx = await treasury.executeBondRedemptionByAddresses(assetAddress, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "RedemptionByAddressesExecuted");

          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(1);
          expect(event.args.results[0].amount).to.equal(BigNumber.from(0));
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption twice, THEN a RedemptionByAddressesExecuted event is emitted with the holder in SUCCEEDED status", async () => {
          await paymentToken.mint(treasury.address, 10000000000);

          await treasury.executeBondRedemptionByAddresses(assetAddress, [signer_B.address]);
          const tx = await treasury.executeBondRedemptionByAddresses(assetAddress, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "RedemptionByAddressesExecuted");

          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(0);
          expect(event.args.results[0].amount).to.equal(BigNumber.from(24000));
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption, THEN a RedemptionByAddressesExecuted event is emitted with holder in SUCCEEDED status", async () => {
          await paymentToken.mint(treasury.address, 1000000);

          const tx = await treasury.executeBondRedemptionByAddresses(assetAddress, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "RedemptionByAddressesExecuted");

          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(0);
          expect(event.args.results[0].amount).to.equal(BigNumber.from(24000));
        });
      });

      describe("Redeem a bond with two holders", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(true, 120, [signer_B.address, signer_A.address], false);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption, THEN a RedemptionByAddressesExecuted event is emitted with both holders in SUCCEEDED status", async () => {
          await paymentToken.mint(treasury.address, 1000000);

          const tx = await treasury.executeBondRedemptionByAddresses(assetAddress, [
            signer_B.address,
            signer_A.address,
          ]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "RedemptionByAddressesExecuted");

          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.holders[1]).to.equal(signer_A.address);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[1].holder).to.equal(signer_A.address);
          expect(event.args.results[0].status).to.equal(0);
          expect(event.args.results[1].status).to.equal(0);
          expect(event.args.results[0].amount).to.equal(BigNumber.from(24000));
          expect(event.args.results[1].amount).to.equal(BigNumber.from(24000));
        });
      });

      describe("Redeem a bond with holders and a great amount of tokens", () => {
        beforeEach(async () => {
          const asset = await assetMockContract.deploy(true, 4611686018000n, [signer_B.address], false);
          await asset.deployed();
          assetAddress = asset.address;
          await treasury.initialize_LifeCycleCashFlow(assetAddress);
          await treasury.initialize_Portfolio(paymentTokenAddress, []);

          await treasury.grantRole(PAYOUT_ROLE, signer_A.address);
        });

        it("GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a redemption to a holder so the amount to pay is greater than the max amount (int64), THEN a RedemptionByAddressesExecuted event is emitted with the holder in FAILED status", async () => {
          const tx = await treasury.executeBondRedemptionByAddresses(assetAddress, [signer_B.address]);
          const receipt = await tx.wait();
          const event = receipt.events.find((e) => e.event === "RedemptionByAddressesExecuted");

          expect(event.args.holders[0]).to.equal(signer_B.address);
          expect(event.args.results[0].holder).to.equal(signer_B.address);
          expect(event.args.results[0].status).to.equal(1);
          expect(event.args.results[0].amount).to.equal(BigNumber.from(0));
        });
      });
    });
  });

  describe("getAsset", () => {
    it("GIVEN an initialized LifeCycleCashFlow facet, WHEN an account gets the asset, THEN asset is obtained", async () => {
      const asset = await assetMockContract.deploy(false, 1, [], false);
      await asset.deployed();
      assetAddress = asset.address;

      treasury = treasury.connect(signer_A);
      await treasury.initialize_LifeCycleCashFlow(assetAddress);

      const a = await treasury.getAsset();
      expect(await treasury.getAsset()).to.equal(asset.address);
    });
  });
});

// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { PAUSER_ROLE, FUNDS_MANAGER_ROLE, PROCEEDS_FULL_MANAGER_ROLE } from "../../scripts/constants";
import { deployPrecompiledMock } from "../helpers/deployment";
import { deployTreasury } from "../../scripts/workflows/deployTreasurySystemWithNewBlr";
import { configureLogger, LogLevel } from "@hashgraph/asset-tokenization-contracts/scripts";
import type { ITreasury } from "@contract-types";

describe("Proceeds management operations", () => {
  configureLogger({ level: LogLevel.SILENT });

  let signer_A, signer_B;
  let treasury: ITreasury;
  let environmentalAssetAddress: string;
  let paymentToken: Contract;
  let environmentalAsset: Contract;

  beforeEach(async () => {
    [signer_A, signer_B] = await ethers.getSigners();
    const deployment = await deployTreasury(signer_A, "hardhat", {
      useTimeTravel: false,
      saveOutput: false,
    });

    treasury = (await ethers.getContractAt("ITreasury", deployment.infrastructure.treasury.proxy)) as ITreasury;

    const paymentTokenMockContract = await ethers.getContractFactory("PaymentTokenMock");
    paymentToken = await paymentTokenMockContract.deploy("Tadios Stablecoin", "TSC", 2);
    await paymentToken.deployed();
    const paymentTokenAddress = paymentToken.address;

    const environmentalAssetMockContract = await ethers.getContractFactory("EnvironmentalAssetMock");
    environmentalAsset = await environmentalAssetMockContract.deploy("Sella River Clean", "SRC");
    await environmentalAsset.deployed();
    environmentalAssetAddress = environmentalAsset.address;

    await deployPrecompiledMock();

    treasury = treasury.connect(signer_A);
    await treasury.initialize_Portfolio(paymentTokenAddress, [environmentalAssetAddress]);
  });

  describe("transferPaymentToken", () => {
    it("GIVEN a deployed Treasury contract, WHEN the contract is paused and transfers payment tokens, THEN a TokenIsPaused error occurs", async () => {
      await treasury.grantRole(PAUSER_ROLE, signer_A.address);
      await treasury.pause();

      await expect(treasury.transferPaymentToken(AddressZero, 1)).to.be.revertedWithCustomError(
        treasury,
        "TokenIsPaused",
      );
    });

    it("GIVEN a deployed Treasury contract, WHEN an account not granted the PROCEEDS_FULL_MANAGER_ROLE transfers payment tokens, THEN an AccountHasNoRole error occurs", async () => {
      treasury = treasury.connect(signer_B);
      await expect(treasury.transferPaymentToken(AddressZero, 1))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_B.address, PROCEEDS_FULL_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account having the PROCEEDS_FULL_MANAGER_ROLE revoked transfers payment tokens, THEN an AccountHasNoRole error occurs", async () => {
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);
      await treasury.revokeRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(treasury.transferPaymentToken(AddressZero, 1))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_A.address, PROCEEDS_FULL_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account having the PROCEEDS_FULL_MANAGER_ROLE transfers payment tokens to a zero address, THEN an InvalidAddressZero error occurs", async () => {
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(treasury.transferPaymentToken(AddressZero, 1)).to.be.revertedWithCustomError(
        treasury,
        "InvalidAddressZero",
      );
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE transfers more payment tokens than the Treasury owns, THEN a NotEnoughBalance error occurs", async () => {
      await paymentToken.mint(treasury.address, 100);
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(treasury.transferPaymentToken(signer_A.address, 200))
        .to.be.revertedWithCustomError(treasury, "NotEnoughBalance")
        .withArgs(200);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE transfers payment tokens to a zero address account, THEN a InvalidAddressZero error occurs", async () => {
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(treasury.transferPaymentToken(AddressZero, 100)).to.be.revertedWithCustomError(
        treasury,
        "InvalidAddressZero",
      );
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE transfers an amount of payment tokens greater than 9223372036854775807, THEN a NotAllowedAmount error occurs", async () => {
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(treasury.transferPaymentToken(signer_A.address, BigNumber.from("9223372036854775808")))
        .to.be.revertedWithCustomError(treasury, "NotAllowedAmount")
        .withArgs(9223372036854775808n);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE transfers an amount of payment tokens to a non existing account, THEN a TransferPaymentTokenFailed error occurs", async () => {
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      const notExistingReciver = "0x0000000000000000000000000000000000000001";

      await expect(treasury.transferPaymentToken(notExistingReciver, 1))
        .to.be.revertedWithCustomError(treasury, "TransferPaymentTokenFailed")
        .withArgs(notExistingReciver, 1);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE transfers payment tokens, THEN payment tokens are transferred", async () => {
      await paymentToken.mint(treasury.address, 100);
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);
      await expect(
        treasury.transferPaymentToken(signer_A.address, 100, {
          gasLimit: 2000000,
        }),
      )
        .to.emit(treasury, "PaymentTokenTransferred")
        .withArgs(signer_A.address, 100);
    });
  });

  describe("transferEnvironmentalAssetToken", () => {
    it("GIVEN a deployed Treasury contract, WHEN the contract is paused and transfers an environmental asset token, THEN a TokenIsPaused error occurs", async () => {
      await treasury.grantRole(PAUSER_ROLE, signer_A.address);
      await treasury.pause();

      await expect(treasury.transferEnvironmentalAssetToken(AddressZero, AddressZero, 1)).to.be.revertedWithCustomError(
        treasury,
        "TokenIsPaused",
      );
    });

    it("GIVEN a deployed Treasury contract, WHEN an account not granted the PROCEEDS_FULL_MANAGER_ROLE transfers an environmental asset token, THEN an AccountHasNoRole error occurs", async () => {
      treasury = treasury.connect(signer_B);

      await expect(treasury.transferEnvironmentalAssetToken(AddressZero, AddressZero, 1))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_B.address, PROCEEDS_FULL_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account having the PROCEEDS_FULL_MANAGER_ROLE revoked transfers an environmental asset token, THEN an AccountHasNoRole error occurs", async () => {
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);
      await treasury.revokeRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(treasury.transferEnvironmentalAssetToken(AddressZero, AddressZero, 1))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_A.address, PROCEEDS_FULL_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account having the PROCEEDS_FULL_MANAGER_ROLE revoked transfers a zero address environmental asset token, THEN an InvalidAddressZero error occurs", async () => {
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(treasury.transferEnvironmentalAssetToken(AddressZero, AddressZero, 1)).to.be.revertedWithCustomError(
        treasury,
        "InvalidAddressZero",
      );
    });

    it("GIVEN a deployed Treasury contract, WHEN an account having the PROCEEDS_FULL_MANAGER_ROLE revoked transfers an environmental asset token to a zero address, THEN an InvalidAddressZero error occurs", async () => {
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(
        treasury.transferEnvironmentalAssetToken(environmentalAssetAddress, AddressZero, 1),
      ).to.be.revertedWithCustomError(treasury, "InvalidAddressZero");
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE transfers an environmental asset the Treasury does not own, THEN a NotTokenIdOwner error occurs", async () => {
      const tokenId = 0;
      await environmentalAsset.mint(signer_B.address);
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(treasury.transferEnvironmentalAssetToken(environmentalAssetAddress, signer_A.address, tokenId))
        .to.be.revertedWithCustomError(treasury, "NotTokenIdOwner")
        .withArgs(tokenId);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE transfers an invalid environmental asset token id, THEN a TransferEnvironmentalAssetTokenFailed error occurs", async () => {
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(treasury.transferEnvironmentalAssetToken(environmentalAssetAddress, signer_A.address, 346346))
        .to.be.revertedWithCustomError(treasury, "TransferEnvironmentalAssetTokenFailed")
        .withArgs(environmentalAssetAddress, signer_A.address, 346346);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE transfers a environmental asset token with a serial number greater than 9223372036854775807, THEN a NotAllowedSerialNumber error occurs", async () => {
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(
        treasury.transferEnvironmentalAssetToken(
          environmentalAssetAddress,
          signer_A.address,
          BigNumber.from("9223372036854775808"),
        ),
      )
        .to.be.revertedWithCustomError(treasury, "NotAllowedSerialNumber")
        .withArgs(9223372036854775808n);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE transfers an environmental asset token, THEN the environmental asset token is transferred", async () => {
      const tokenId = 0;
      await environmentalAsset.mint(treasury.address);
      await treasury.grantRole(PROCEEDS_FULL_MANAGER_ROLE, signer_A.address);

      await expect(treasury.transferEnvironmentalAssetToken(environmentalAssetAddress, signer_A.address, tokenId))
        .to.emit(treasury, "EnvironmentalAssetTokenTransferred")
        .withArgs(environmentalAssetAddress, signer_A.address, tokenId);
    });
  });

  describe("fundProceedsRecipient", () => {
    describe("A proceeds recipient is not needed", () => {
      it("GIVEN a deployed Treasury contract, WHEN the contract is paused and funds a proceeds recipient, THEN a TokenIsPaused error occurs", async () => {
        await treasury.grantRole(PAUSER_ROLE, signer_A.address);
        await treasury.pause();

        await expect(treasury.fundProceedsRecipient(AddressZero, 1)).to.be.revertedWithCustomError(
          treasury,
          "TokenIsPaused",
        );
      });

      it("GIVEN a deployed Treasury contract, WHEN an account not granted the PROCEEDS_FULL_MANAGER_ROLE funds a proceeds recipient, THEN an AccountHasNoRole error occurs", async () => {
        treasury = treasury.connect(signer_B);

        await expect(treasury.fundProceedsRecipient(AddressZero, 1))
          .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
          .withArgs(signer_B.address, FUNDS_MANAGER_ROLE);
      });

      it("GIVEN a deployed Treasury contract, WHEN an account having the PROCEEDS_FULL_MANAGER_ROLE revoked funds a proceeds recipient, THEN an AccountHasNoRole error occurs", async () => {
        await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address);
        await treasury.revokeRole(FUNDS_MANAGER_ROLE, signer_A.address);

        await expect(treasury.fundProceedsRecipient(AddressZero, 1))
          .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
          .withArgs(signer_A.address, FUNDS_MANAGER_ROLE);
      });

      it("GIVEN a deployed Treasury contract, WHEN an account having the PROCEEDS_FULL_MANAGER_ROLE funds a zero address proceeds recipient, THEN an AccountHasNoRole error occurs", async () => {
        await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address);

        await expect(treasury.fundProceedsRecipient(AddressZero, 1)).to.be.revertedWithCustomError(
          treasury,
          "InvalidAddressZero",
        );
      });
    });

    describe("The proceeds recipient does not belong to the bond", () => {
      it("GIVEN a deployed Treasury contract, WHEN an account having the PROCEEDS_FULL_MANAGER_ROLE funds a proceeds recipient that does not belong to the asset, THEN a WrongProceedsRecipient error occurs", async () => {
        const assetMockContract = await ethers.getContractFactory("AssetMock");
        const asset = await assetMockContract.deploy(2, 1, [], false, true);
        await asset.deployed();
        const assetAddress = asset.address;

        await treasury.initialize_LifeCycleCashFlow(assetAddress);

        const proceedsRecipient = ethers.Wallet.createRandom();

        await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address);

        await expect(treasury.fundProceedsRecipient(proceedsRecipient.address, 1))
          .to.be.revertedWithCustomError(treasury, "WrongProceedsRecipient")
          .withArgs(proceedsRecipient.address);
      });
    });

    describe("The proceeds recipient belongs to the bond", () => {
      beforeEach(async () => {
        await paymentToken.mint(treasury.address, 100);

        const assetMockContract = await ethers.getContractFactory("AssetMock");
        const asset = await assetMockContract.deploy(2, 1, [], true, true);
        await asset.deployed();
        const assetAddress = asset.address;

        await treasury.initialize_LifeCycleCashFlow(assetAddress);
      });

      it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE funds a proceeds recipient with more payment tokens than the Treasury owns, THEN a NotEnoughBalance error occurs", async () => {
        await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address);

        const proceedsRecipient = ethers.Wallet.createRandom();

        await expect(treasury.fundProceedsRecipient(proceedsRecipient.address, 200))
          .to.be.revertedWithCustomError(treasury, "NotEnoughBalance")
          .withArgs(200);
      });

      it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE funds a with zero address proceeds recipient, THEN a InvalidAddressZero error occurs", async () => {
        await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address);

        await expect(treasury.fundProceedsRecipient(AddressZero, 100)).to.be.revertedWithCustomError(
          treasury,
          "InvalidAddressZero",
        );
      });

      it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE funds a proceeds recipient with an amount greater than 9223372036854775807, THEN a NotAllowedAmount error occurs", async () => {
        await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address);

        const proceedsRecipient = ethers.Wallet.createRandom();

        await expect(treasury.fundProceedsRecipient(proceedsRecipient.address, BigNumber.from("9223372036854775808")))
          .to.be.revertedWithCustomError(treasury, "NotAllowedAmount")
          .withArgs(9223372036854775808n);
      });

      it("GIVEN a deployed Treasury contract, WHEN an account granting the PROCEEDS_FULL_MANAGER_ROLE funds a proceeds recipient, THEN the proceeds recipient is funded", async () => {
        await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address);

        const proceedsRecipient = ethers.Wallet.createRandom();

        await expect(treasury.fundProceedsRecipient(proceedsRecipient.address, 100))
          .to.emit(treasury, "ProceedsRecipientFunded")
          .withArgs(proceedsRecipient.address, 100);
      });
    });
  });
});

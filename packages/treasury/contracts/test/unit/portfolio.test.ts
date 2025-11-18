// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { PAUSER_ROLE, PORTFOLIO_MANAGER_ROLE } from "../../scripts/constants";
import { deployPrecompiledMock } from "../helpers/deployment";
import { deployTreasury } from "../../scripts/workflows/deployTreasury";
import type { ITreasury } from "@contract-types";

describe("Portfolio operations", () => {
  let signer_A, signer_B;
  let treasury: ITreasury;
  let paymentTokenAddress: string;
  let paymentTokenMockContract: ContractFactory;
  let paymentToken: Contract;

  beforeEach(async () => {
    [signer_A, signer_B] = await ethers.getSigners();
    const deployment = await deployTreasury(signer_A, "hardhat", {
      useTimeTravel: false,
      saveOutput: false,
    });

    treasury = (await ethers.getContractAt("ITreasury", deployment.infrastructure.treasury.proxy)) as ITreasury;

    paymentTokenMockContract = await ethers.getContractFactory("PaymentTokenMock");
    paymentToken = await paymentTokenMockContract.deploy("Tadios Stablecoin", "TSC", 2);
    await paymentToken.deployed();
    paymentTokenAddress = paymentToken.address

    await deployPrecompiledMock();

    treasury = treasury.connect(signer_A);
    await treasury.initialize_Portfolio(paymentTokenAddress, []);
  });

  describe("initialize_Portfolio", () => {
    it("GIVEN an already initialized Portfolio facet, WHEN initializing once again, THEN an AlreadyInitialized error occurs", async () => {
      await expect(treasury.initialize_Portfolio(paymentTokenAddress, [])).to.be.revertedWithCustomError(
        treasury,
        "AlreadyInitialized",
      );
    });

    it("GIVEN a Portfolio facet, WHEN initializing with a zero address payment token, THEN an InvalidAddressZero error occurs", async () => {
      await expect(treasury.initialize_Portfolio(AddressZero, [])).to.be.revertedWithCustomError(
        treasury,
        "InvalidAddressZero",
      );
    });

    it("GIVEN a Portfolio facet, WHEN initializing with address zero environmental assets, THEN an InvalidAddressZero error occurs", async () => {
      await expect(treasury.initialize_Portfolio(paymentTokenAddress, [AddressZero])).to.be.revertedWithCustomError(
        treasury,
        "InvalidAddressZero",
      );
    });
  });

  describe("addEnvironmentalAssetToken", () => {
    it("GIVEN a deployed Treasury contract, WHEN the contract is paused and adds an environmental asset token, THEN a TokenIsPaused error occurs", async () => {
      await treasury.grantRole(PAUSER_ROLE, signer_A.address);
      await treasury.pause();

      await expect(treasury.addEnvironmentalAssetToken(AddressZero)).to.be.revertedWithCustomError(
        treasury,
        "TokenIsPaused",
      );
    });

    it("GIVEN a deployed Treasury contract, WHEN an account not granted the PORTFOLIO_MANAGER_ROLE adds an environmental asset token, THEN an AccountHasNoRole error occurs", async () => {
      treasury = treasury.connect(signer_B);

      await expect(treasury.addEnvironmentalAssetToken(AddressZero))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_B.address, PORTFOLIO_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account having the PORTFOLIO_MANAGER_ROLE revoked adds an environmental asset token, THEN an AccountHasNoRole error occurs", async () => {
      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);
      await treasury.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);

      await expect(treasury.addEnvironmentalAssetToken(AddressZero))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_A.address, PORTFOLIO_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE adds zero address environmental asset token, THEN an InvalidAddressZero error occurs", async () => {
      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);
      await expect(treasury.addEnvironmentalAssetToken(AddressZero)).to.be.revertedWithCustomError(
        treasury,
        "InvalidAddressZero",
      );
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE adds an environmental asset token, THEN the environmental asset token is added", async () => {
      const environmentalAssetMockContract = await ethers.getContractFactory("EnvironmentalAssetMock");
      const environmentalAsset = await environmentalAssetMockContract.deploy("Sella River Clean", "SRC");
      await environmentalAsset.deployed();
      const environmentalAssetAddress = environmentalAsset.address

      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_B.address);

      treasury = treasury.connect(signer_B);

      await expect(treasury.addEnvironmentalAssetToken(environmentalAssetAddress))
        .to.emit(treasury, "TokenAssociated")
        .withArgs(environmentalAssetAddress)
        .to.emit(treasury, "EnvironmentalAssetAdded")
        .withArgs(signer_B.address, environmentalAssetAddress);

      expect(await treasury.getTotalEnvironmentalAssetTokens()).to.equal(1);

      expect((await treasury.getEnvironmentalAssetTokens(0, 1))[0]).to.equal(environmentalAssetAddress.toString());
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE adds an already added environmental asset token, THEN TokenAssociated and EnvironmentalAssetAdded events are not emitted", async () => {
      const environmentalAssetMockContract = await ethers.getContractFactory("EnvironmentalAssetMock");
      const environmentalAsset = await environmentalAssetMockContract.deploy("Sella River Clean", "SRC");
      await environmentalAsset.deployed();
      const environmentalAssetAddress = environmentalAsset.address

      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_B.address);

      treasury = treasury.connect(signer_B);

      await treasury.addEnvironmentalAssetToken(environmentalAssetAddress);

      await expect(treasury.addEnvironmentalAssetToken(environmentalAssetAddress))
        .to.not.emit(treasury, "TokenAssociated")
        .to.not.emit(treasury, "EnvironmentalAssetAdded");

      expect(await treasury.getTotalEnvironmentalAssetTokens()).to.equal(1);

      expect((await treasury.getEnvironmentalAssetTokens(0, 1))[0]).to.equal(environmentalAssetAddress.toString());
    });
  });

  describe("removeEnvironmentalAssetToken", () => {
    it("GIVEN a deployed Treasury contract, WHEN the contract is paused and removes an environmental asset token, THEN a TokenIsPaused error occurs", async () => {
      await treasury.grantRole(PAUSER_ROLE, signer_A.address);
      await treasury.pause();

      await expect(treasury.removeEnvironmentalAssetToken(AddressZero)).to.be.revertedWithCustomError(
        treasury,
        "TokenIsPaused",
      );
    });

    it("GIVEN a deployed Treasury contract, WHEN an account not granted the PORTFOLIO_MANAGER_ROLE removes an environmental asset token, THEN an AccountHasNoRole error occurs", async () => {
      treasury = treasury.connect(signer_B);

      await expect(treasury.removeEnvironmentalAssetToken(AddressZero))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_B.address, PORTFOLIO_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account having the PORTFOLIO_MANAGER_ROLE revoked removes an environmental asset token, THEN an AccountHasNoRole error occurs", async () => {
      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);
      await treasury.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);

      await expect(treasury.removeEnvironmentalAssetToken(AddressZero))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_A.address, PORTFOLIO_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE removes a zero address environmental asset token, THEN an InvalidAddressZero error occurs", async () => {
      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);
      await expect(treasury.removeEnvironmentalAssetToken(AddressZero)).to.be.revertedWithCustomError(
        treasury,
        "InvalidAddressZero",
      );
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE removes an environmental asset token, THEN the environmental asset token is removed", async () => {
      const environmentalAssetMockContract = await ethers.getContractFactory("EnvironmentalAssetMock");
      const environmentalAsset = await environmentalAssetMockContract.deploy("Sella River Clean", "SRC");
      await environmentalAsset.deployed();
      const environmentalAssetAddress = environmentalAsset.address

      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_B.address);

      treasury = treasury.connect(signer_B);

      await treasury.addEnvironmentalAssetToken(environmentalAssetAddress);

      expect(await treasury.getTotalEnvironmentalAssetTokens()).to.equal(1);

      await expect(treasury.removeEnvironmentalAssetToken(environmentalAssetAddress))
        .to.emit(treasury, "EnvironmentalAssetRemoved")
        .withArgs(signer_B.address, environmentalAssetAddress, 0);

      expect(await treasury.getTotalEnvironmentalAssetTokens()).to.equal(0);
    });
  });

  describe("updatePaymentToken", () => {
    it("GIVEN a deployed Treasury contract, WHEN the contract is paused and updates the payment token, THEN a TokenIsPaused error occurs", async () => {
      await treasury.grantRole(PAUSER_ROLE, signer_A.address);
      await treasury.pause();

      await expect(treasury.updatePaymentToken(AddressZero)).to.be.revertedWithCustomError(treasury, "TokenIsPaused");
    });

    it("GIVEN a deployed Treasury contract, WHEN an account not granted the PORTFOLIO_MANAGER_ROLE updates the payment token, THEN an AccountHasNoRole error occurs", async () => {
      treasury = treasury.connect(signer_B);

      await expect(treasury.updatePaymentToken(AddressZero))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_B.address, PORTFOLIO_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account having the PORTFOLIO_MANAGER_ROLE revoked updates the payment token, THEN an AccountHasNoRole error occurs", async () => {
      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);
      await treasury.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);

      await expect(treasury.updatePaymentToken(AddressZero))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_A.address, PORTFOLIO_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE updates the payment token with a zero address token, THEN an InvalidAddressZero error occurs", async () => {
      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);
      await expect(treasury.updatePaymentToken(AddressZero)).to.be.revertedWithCustomError(
        treasury,
        "InvalidAddressZero",
      );
    });

    it("GIVEN a treasury with a balance of 1 payment token, WHEN updating the payment token, THEN a PaymentTokenUpdated event is emitted with a 195 dissociation code error", async () => {
      await paymentToken.mint(treasury.address, 100);

      const paymentTokenNew = await paymentTokenMockContract.deploy("Tadios Stablecoin", "TSC", 2);
      await paymentTokenNew.deployed();
      const paymentTokenNewAddress = paymentTokenNew.address

      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);

      await expect(treasury.updatePaymentToken(paymentTokenNewAddress))
        .to.emit(treasury, "PaymentTokenUpdated")
        .withArgs(signer_A.address, paymentTokenNewAddress, paymentTokenAddress, 195);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE updates the payment token, THEN the payment token is updated", async () => {
      const paymentTokenNew = await paymentTokenMockContract.deploy("Tadios Stablecoin", "TSC", 2);
      await paymentTokenNew.deployed();
      const paymentTokenNewAddress = paymentTokenNew.address

      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);

      await expect(treasury.updatePaymentToken(paymentTokenNewAddress))
        .to.emit(treasury, "PaymentTokenUpdated")
        .withArgs(signer_A.address, paymentTokenNewAddress, paymentTokenAddress, 0);
    });
  });

  describe("dissociateToken", () => {
    it("GIVEN a deployed Treasury contract, WHEN the contract is paused and dissociates the payment token, THEN a TokenIsPaused error occurs", async () => {
      await treasury.grantRole(PAUSER_ROLE, signer_A.address);
      await treasury.pause();

      await expect(treasury.dissociateToken(AddressZero)).to.be.revertedWithCustomError(treasury, "TokenIsPaused");
    });

    it("GIVEN a deployed Treasury contract, WHEN an account not granted the PORTFOLIO_MANAGER_ROLE dissociates the payment token, THEN an AccountHasNoRole error occurs", async () => {
      treasury = treasury.connect(signer_B);

      await expect(treasury.dissociateToken(AddressZero))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_B.address, PORTFOLIO_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account having the PORTFOLIO_MANAGER_ROLE revoked dissociates the payment token, THEN an AccountHasNoRole error occurs", async () => {
      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);
      await treasury.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);

      await expect(treasury.dissociateToken(AddressZero))
        .to.be.revertedWithCustomError(treasury, "AccountHasNoRole")
        .withArgs(signer_A.address, PORTFOLIO_MANAGER_ROLE);
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE dissociates a zero address token, THEN an InvalidAddressZero error occurs", async () => {
      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);
      await expect(treasury.dissociateToken(AddressZero)).to.be.revertedWithCustomError(treasury, "InvalidAddressZero");
    });

    it("GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE dissociates the payment token, THEN a TokenDissociated event is emitted", async () => {
      await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address);
      await expect(treasury.dissociateToken(paymentTokenAddress))
        .to.emit(treasury, "TokenDissociated")
        .withArgs(paymentTokenAddress);
    });
  });
});

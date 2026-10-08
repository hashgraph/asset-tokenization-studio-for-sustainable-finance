// SPDX-License-Identifier: Apache-2.0

import "./globalSetup"; // Side-effect: silences deployment logs
import { ethers } from "hardhat";
import { parseEther, type ContractFactory, type Signer } from "ethers";
import { EnvironmentalAssetFactory__factory, PaymentTokenFactory__factory } from "@contract-types";
import { HEDERA_PRECOMPILED_ADDRESS } from "../constants";

export async function deployContract<T extends ContractFactory>(factory: T, args: any[] = []): Promise<string> {
  const contract = await factory.deploy(...args);
  return await contract.getAddress();
}

export async function deployEnvironmentalAsset(signer: Signer): Promise<[string, string, string]> {
  const environmentalAssetFactory = await new EnvironmentalAssetFactory__factory(signer).deploy();
  const tx = await environmentalAssetFactory.createEnvironmentalAsset("Sella River Clean", "SRC", {
    gasLimit: 800000,
    value: parseEther("10"),
  });
  const receipt = await tx.wait();
  if (!receipt || !receipt.logs) {
    throw new Error("No events found in transaction receipt");
  }
  const iface = EnvironmentalAssetFactory__factory.createInterface();
  const EnvironmentalAssetCreatedEvent = receipt.logs
    .map((log) => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e) => e?.name === "EnvironmentalAssetCreated");

  const NFTMintedEvent = receipt.logs
    .map((log) => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e) => e?.name === "NFTMinted");

  if (!EnvironmentalAssetCreatedEvent || !NFTMintedEvent) {
    throw new Error("Required events not found in transaction receipt");
  }
  return [await environmentalAssetFactory.getAddress(), EnvironmentalAssetCreatedEvent.args[0], NFTMintedEvent.args[1]];
}

export async function deployPaymentToken(signer: Signer, initialSupply: any, decimals: any): Promise<[string, string]> {
  const paymentTokenFactory = await new PaymentTokenFactory__factory(signer).deploy();
  const tx = await paymentTokenFactory.createPaymentToken("Tadios Stable Coin", "TSC", initialSupply, decimals, {
    gasLimit: 1000000,
    value: parseEther("10"),
  });
  const receipt = await tx.wait();
  if (!receipt || !receipt.logs) {
    throw new Error("No events found in transaction receipt");
  }
  const iface = PaymentTokenFactory__factory.createInterface();
  const event = receipt.logs
    .map((log) => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e) => e?.name === "PaymentTokenCreated");

  if (!event) {
    throw new Error("PaymentTokenCreated event not found in transaction receipt");
  }
  return [await paymentTokenFactory.getAddress(), event.args[0]];
}

export async function deployPrecompiledMock() {
  const PrecompiledMockContract = await ethers.getContractFactory("PrecompiledMock");

  const deployed = await PrecompiledMockContract.deploy();
  const deployedAddress = await deployed.getAddress();

  const runtimeBytecode = await ethers.provider.getCode(deployedAddress);
  await ethers.provider.send("hardhat_setCode", [HEDERA_PRECOMPILED_ADDRESS, runtimeBytecode]);
  const mockPrecompiled = await ethers.getContractAt("PrecompiledMock", HEDERA_PRECOMPILED_ADDRESS);
  await mockPrecompiled.setPrecompiledTransferStatus(true);
}

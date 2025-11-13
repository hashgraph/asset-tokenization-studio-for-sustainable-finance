// SPDX-License-Identifier: Apache-2.0

import { utils } from "ethers";
import type { ContractFactory, Signer } from "ethers";
import { EnvironmentalAssetFactory__factory, PaymentTokenFactory__factory } from "@contract-types";

export async function deployContract<T extends ContractFactory>(factory: T, args: any[] = []): Promise<string> {
  const contract = await factory.deploy(...args);
  await contract.deployed();
  return contract.address;
}

export async function deployEnvironmentalAsset(signer: Signer): Promise<[string, string, string]> {
  const environmentalAssetFactory = await new EnvironmentalAssetFactory__factory(signer).deploy();
  const tx = await environmentalAssetFactory.createEnvironmentalAsset("Sella River Clean", "SRC", {
    gasLimit: 800000,
    value: utils.parseEther("10"),
  });
  const receipt = await tx.wait();
  if (!receipt.events) {
    throw new Error("No events found in transaction receipt");
  }
  const EnvironmentalAssetCreatedEvent = receipt.events.find((e) => e.event === "EnvironmentalAssetCreated");
  const NFTMintedEvent = receipt.events.find((e) => e.event === "NFTMinted");
  if (!EnvironmentalAssetCreatedEvent?.args || !NFTMintedEvent?.args) {
    throw new Error("Required events not found in transaction receipt");
  }
  return [
    environmentalAssetFactory.address,
    EnvironmentalAssetCreatedEvent.args.tokenAddress,
    NFTMintedEvent.args.tokenId,
  ];
}

export async function deployPaymentToken(signer: Signer, initialSupply: any, decimals: any): Promise<[string, string]> {
  const paymentTokenFactory = await new PaymentTokenFactory__factory(signer).deploy();
  const tx = await paymentTokenFactory.createPaymentToken("Tadios Stable Coin", "TSC", initialSupply, decimals, {
    gasLimit: 1000000,
    value: utils.parseEther("10"),
  });
  const receipt = await tx.wait();
  if (!receipt.events) {
    throw new Error("No events found in transaction receipt");
  }
  const event = receipt.events.find((e) => e.event === "PaymentTokenCreated");
  if (!event?.args) {
    throw new Error("PaymentTokenCreated event not found in transaction receipt");
  }
  return [paymentTokenFactory.address, event.args.tokenAddress];
}

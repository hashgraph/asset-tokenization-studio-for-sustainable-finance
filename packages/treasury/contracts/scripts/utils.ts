// SPDX-License-Identifier: Apache-2.0

/// <reference types="@nomicfoundation/hardhat-ethers" />

import { ethers } from "hardhat";
import { getAddress } from "ethers";

/**
 * Get ProxyAdmin owner signer from environment or default signer.
 *
 * @returns Promise resolving to signer from PROXY_ADMIN_ADDRESS env var, or first default signer
 */
export async function getProxyAdminOwnerEnv() {
  return await ethers.getSigner(process.env.PROXY_ADMIN_ADDRESS ?? (await ethers.getSigners())[0].address);
}

/**
 * Read implementation address from ERC1967 proxy storage slot.
 *
 * @param proxyAddress - Address of the ERC1967 proxy contract
 * @returns Promise resolving to implementation contract address
 */
export async function getImplementationAddress(proxyAddress: string) {
  const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  const raw = await ethers.provider.getStorage(proxyAddress, IMPLEMENTATION_SLOT);
  return getAddress("0x" + raw.slice(26));
}

/**
 * Convert addressable objects to addresses recursively.
 *
 * Processes arrays and objects with getAddress() method, resolving them to
 * plain string addresses. Useful for converting signer objects to addresses
 * before passing to contract initialization data.
 *
 * @param arg - Value to process (can be addressable object, array, or primitive)
 * @returns Promise resolving to processed value with addresses resolved
 */
export async function processAddressableArgs(arg: unknown): Promise<unknown> {
  if (Array.isArray(arg)) {
    return Promise.all(arg.map(processAddressableArgs));
  } else if (arg && typeof arg === "object" && "getAddress" in arg && typeof (arg as any).getAddress === "function") {
    return await (arg as any).getAddress();
  }
  return arg;
}

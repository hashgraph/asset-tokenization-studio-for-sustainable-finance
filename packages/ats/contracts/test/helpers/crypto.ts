// SPDX-License-Identifier: Apache-2.0

import { ethers } from "hardhat";

/**
 * Create a keccak256 hash from a string.
 * Useful for generating test role identifiers.
 */
export function hashRole(roleName: string): string {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(roleName));
}

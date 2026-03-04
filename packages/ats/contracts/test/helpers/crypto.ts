// SPDX-License-Identifier: Apache-2.0

import { keccak256, toUtf8Bytes } from "ethers";

/**
 * Create a keccak256 hash from a string.
 * Useful for generating test role identifiers.
 */
export function hashRole(roleName: string): string {
  return keccak256(toUtf8Bytes(roleName));
}

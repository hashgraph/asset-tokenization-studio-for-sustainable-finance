// SPDX-License-Identifier: Apache-2.0

/**
 * Test utilities module.
 *
 * Provides reusable helper functions for test operations to avoid code duplication
 * and magic inline implementations.
 *
 * @module test/helpers/testUtils
 */

import { ethers } from "hardhat";

/**
 * Create a test role hash from a role name.
 *
 * Wrapper for ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name))
 * to avoid inline keccak256 calls throughout tests.
 *
 * @param roleName - The role name to hash (e.g., "ROLE_1", "KPI_ROLE_1")
 * @returns The keccak256 hash of the role name as bytes32 string
 *
 * @example
 * ```typescript
 * const role1Hash = createTestRole("ROLE_1");
 * await accessControl.grantRole(role1Hash, admin.address);
 * ```
 */
export function createTestRole(roleName: string): string {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(roleName));
}

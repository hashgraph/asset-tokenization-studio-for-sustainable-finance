// SPDX-License-Identifier: Apache-2.0

/**
 * Global type definitions for Hardhat test environment.
 *
 * Triple-slash directives load type extensions from Hardhat plugins:
 * - hardhat-ethers: Adds ethers to HardhatRuntimeEnvironment
 * - hardhat-chai-matchers: Adds properAddress, reverted, emit, etc.
 * - typechain/hardhat: Adds typechain configuration to HardhatConfig
 */

/// <reference types="@nomicfoundation/hardhat-ethers" />
/// <reference types="@nomicfoundation/hardhat-chai-matchers" />
/// <reference types="@typechain/hardhat" />

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @title Roles Constants
 * @author Green Bonds Platform Team
 * @notice Defines role constants used throughout the Factory Suite system
 * @dev Using keccak256 hashes for gas-efficient role definitions
 */

/// @dev Role for deploying new bond suites - keccak256('green.bonds.platform.role.deployer')
bytes32 constant DEPLOYER_ROLE = 0x1e30887951e961109b31c3e05261cd69e3d6381327ba40ce9968bbadbebce283;

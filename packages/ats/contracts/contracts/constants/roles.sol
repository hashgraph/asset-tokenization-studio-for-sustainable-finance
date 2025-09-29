// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Roles Constants
 * @author Green Bonds Platform Team
 * @notice Defines role constants used throughout the Factory Suite system
 * @dev Using keccak256 hashes for gas-efficient role definitions
 */

/// @dev Role for deploying new bond suites - keccak256('green.bonds.platform.role.deployer')
bytes32 constant DEPLOYER_ROLE = 0x1e30887951e961109b31c3e05261cd69e3d6381327ba40ce9968bbadbebce283;

// keccak256(security.token.standard.role.kpi_data_manager)
bytes32 constant KPI_DATA_MANAGER_ROLE = 0xe3e2abcfc68779afa925744779b1f36fbbaa16e06e4638bfe50c5b4456a2b37c;

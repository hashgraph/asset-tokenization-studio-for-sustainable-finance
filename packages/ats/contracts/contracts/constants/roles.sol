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

// keccak256(abi.encode(uint256(keccak256("kpi.storage.main")) - 1)) & ~bytes32(uint256(0xff))
bytes32 constant _MAIN_STORAGE_LOCATION = 0x7951b57d34492147b02ce280f4a5a3e267a90c41bb73a92f7e5957582ef3b4cc;

// keccak256(security.token.standard.role.kpi_data_manager)
bytes32 constant _KPI_DATA_MANAGER_ROLE = 0xe3e2abcfc68779afa925744779b1f36fbbaa16e06e4638bfe50c5b4456a2b37c;

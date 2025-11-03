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

/// @dev Role for managing KPI data - keccak256('green.bonds.platform.role.kpi_data_manager')
bytes32 constant KPI_DATA_MANAGER_ROLE = 0x8108220811ff31812653b43da259792e3fb45324bd180667be52cdb5621e363e;

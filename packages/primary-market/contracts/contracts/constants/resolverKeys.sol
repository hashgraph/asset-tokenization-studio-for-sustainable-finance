// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
// solhint-disable max-line-length

/**
 * @title Primary Market Resolver Keys Constants
 * @author Green Bonds Platform Team
 * @notice Defines resolver keys for Primary Market Diamond facet registration
 * @dev Using keccak256 hashes for facet-to-resolver mapping in the Diamond pattern
 */

/// @dev Resolver key for FactoryPrimaryMarket facet - keccak256('green.bonds.platform.factoryprimarymarket.resolverKey')
bytes32 constant FACTORY_PRIMARY_MARKET_RESOLVER_KEY = 0x98c9d1e17a94f8342c5219f2e037b33ad4a5f9cd3c6dada43d647da671418de5;

/// @dev Resolver key for PrimaryMarket facet - keccak256('green.bonds.platform.primarymarket.resolverKey')
bytes32 constant PRIMARY_MARKET_RESOLVER_KEY = 0xcdfe5eae53e62eb0e55385ee0e010eb2376afa6690d7ed8e0266c6fa9820c082;

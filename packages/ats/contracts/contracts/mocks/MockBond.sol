// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";

/**
 * @title MockBond
 * @notice Mock bond contract with AccessControl for testing FactorySuite RBAC functionality
 * @dev Used by MockAtsFactory to simulate bond contract creation with proper role management
 */
contract MockBond is AccessControl {
    string public name;
    string public symbol;

    /**
     * @notice Creates a new MockBond with role-based access control
     * @param _name Token name
     * @param _symbol Token symbol
     * @param rbacs Array of role configurations to initialize
     */
    constructor(
        string memory _name,
        string memory _symbol,
        IResolverProxy.Rbac[] memory rbacs
    ) {
        name = _name;
        symbol = _symbol;

        // Initialize RBAC based on passed configuration
        for (uint256 i = 0; i < rbacs.length; i++) {
            bytes32 role = rbacs[i].role;
            address[] memory members = rbacs[i].members;

            for (uint256 j = 0; j < members.length; j++) {
                _grantRole(role, members[j]);
            }
        }
    }
}

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";

contract MockBond is AccessControl {
    string public name;
    string public symbol;

    constructor(string memory _name, string memory _symbol, IResolverProxy.Rbac[] memory rbacs) {
        name = _name;
        symbol = _symbol;

        for (uint256 i = 0; i < rbacs.length; i++) {
            bytes32 role = rbacs[i].role;
            address[] memory members = rbacs[i].members;

            for (uint256 j = 0; j < members.length; j++) {
                _grantRole(role, members[j]);
            }
        }
    }
}

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length
import { IStaticFunctionSelectors } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { FACTORY_SUITE_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { IFactorySuite } from "../interfaces/IFactorySuite.sol";
import { FactorySuite } from "./FactorySuite.sol";
// solhint-enable max-line-length

/**
 * @title FactorySuiteFacet
 * @notice Atomic deployment of Bond, Treasury, and KPI contract suites
 * @dev Diamond facet for factory suite operations
 */
contract FactorySuiteFacet is IStaticFunctionSelectors, FactorySuite {
    constructor() {
        // solhint-disable-previous-line no-empty-blocks
    }

    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey) {
        staticResolverKey = FACTORY_SUITE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors) {
        staticFunctionSelectors = new bytes4[](1);
        // ! When adding more selectors, update the array size above and uncomment the lines below
        // uint256 selectorIndex = 0;
        // staticFunctionSelectors[0] = this.deployBondSuite.selector;
        // staticFunctionSelectors[++selectorIndex] = this.<<anotherMethod>>.selector;
        staticFunctionSelectors[0] = this.deployBondSuite.selector;
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds) {
        staticInterfaceIds = new bytes4[](1);
        staticInterfaceIds[0] = type(IFactorySuite).interfaceId;
    }
}

// Test change for CI workflow validation

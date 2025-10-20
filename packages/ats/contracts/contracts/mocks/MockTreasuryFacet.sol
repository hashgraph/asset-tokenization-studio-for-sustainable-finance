// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

/**
 * @title MockTreasuryFacet
 * @notice Minimal mock implementation of Treasury facet for testing FactorySuite deployment
 * @dev Only implements required IStaticFunctionSelectors interface - no actual Treasury logic
 */
contract MockTreasuryFacet is IStaticFunctionSelectors {
    /// @notice Mock resolver key for Treasury configuration
    bytes32 private constant RESOLVER_KEY = bytes32("TREASURY_MOCK");

    /**
     * @notice Returns the resolver key for Treasury configuration
     * @return Resolver key bytes32
     */
    function getStaticResolverKey() external pure override returns (bytes32) {
        return RESOLVER_KEY;
    }

    /**
     * @notice Returns function selectors for Treasury facet
     * @return Array of function selectors (minimal for mock)
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = this.getStaticResolverKey.selector;
        selectors[1] = this.getStaticFunctionSelectors.selector;
        selectors[2] = this.getStaticInterfaceIds.selector;
        return selectors;
    }

    /**
     * @notice Returns interface IDs for Treasury facet
     * @return Array of interface IDs (minimal for mock)
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        bytes4[] memory interfaceIds = new bytes4[](1);
        interfaceIds[0] = type(IStaticFunctionSelectors).interfaceId;
        return interfaceIds;
    }
}

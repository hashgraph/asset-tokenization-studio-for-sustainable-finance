// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable-next-line max-line-length
import { IStaticFunctionSelectors } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

/**
 * @title MockTreasuryFacet
 * @notice Minimal mock implementation of Treasury facet for testing FactorySuite deployment
 * @dev Only implements required IStaticFunctionSelectors interface - no actual Treasury logic
 */
contract MockTreasuryFacet is IStaticFunctionSelectors {
    bytes32 private constant _RESOLVER_KEY = bytes32("TREASURY_MOCK");

    function getStaticResolverKey() external pure override returns (bytes32) {
        return _RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = this.getStaticResolverKey.selector;
        selectors[1] = this.getStaticFunctionSelectors.selector;
        selectors[2] = this.getStaticInterfaceIds.selector;
        return selectors;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        bytes4[] memory interfaceIds = new bytes4[](1);
        interfaceIds[0] = type(IStaticFunctionSelectors).interfaceId;
        return interfaceIds;
    }
}

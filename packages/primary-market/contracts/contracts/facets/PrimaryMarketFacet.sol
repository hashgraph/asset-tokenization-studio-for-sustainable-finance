// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { PRIMARY_MARKET_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { IPrimaryMarket } from "../interfaces/IPrimaryMarket.sol";

/**
 * @title PrimaryMarketFacet
 * @notice Placeholder facet for Primary Market functionality
 * @dev This is a minimal facet for BLR configuration registration.
 *      Business logic methods will be implemented in future iterations.
 */
contract PrimaryMarketFacet is IStaticFunctionSelectors {
    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey) {
        staticResolverKey = PRIMARY_MARKET_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors) {
        // Placeholder - no methods implemented yet
        staticFunctionSelectors = new bytes4[](0);
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds) {
        staticInterfaceIds = new bytes4[](1);
        staticInterfaceIds[0] = type(IPrimaryMarket).interfaceId;
    }
}

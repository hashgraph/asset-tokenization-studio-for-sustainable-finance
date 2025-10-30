// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { PRIMARY_MARKET_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { IPrimaryMarket } from "../interfaces/IPrimaryMarket.sol";
import { PrimaryMarket } from "./PrimaryMarket.sol";

/**
 * @title PrimaryMarketFacet
 * @notice Diamond facet implementing Primary Market functionality
 * @dev Implements offerings and subscriptions management
 */
contract PrimaryMarketFacet is IStaticFunctionSelectors, PrimaryMarket {
    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey) {
        staticResolverKey = PRIMARY_MARKET_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors) {
        staticFunctionSelectors = new bytes4[](12);
        uint256 selectorIndex = 0;

        // Write functions
        staticFunctionSelectors[selectorIndex++] = this.createOffering.selector;
        staticFunctionSelectors[selectorIndex++] = this.submitSubscription.selector;
        staticFunctionSelectors[selectorIndex++] = this.executeOffering.selector;
        staticFunctionSelectors[selectorIndex++] = this.cancelOffering.selector;
        staticFunctionSelectors[selectorIndex++] = this.cancelSubscription.selector;

        // View functions
        staticFunctionSelectors[selectorIndex++] = this.getTotalOfferings.selector;
        staticFunctionSelectors[selectorIndex++] = this.getOfferingIds.selector;
        staticFunctionSelectors[selectorIndex++] = this.getOffering.selector;
        staticFunctionSelectors[selectorIndex++] = this.getOfferingStatus.selector;
        staticFunctionSelectors[selectorIndex++] = this.getTotalSubscriptions.selector;
        staticFunctionSelectors[selectorIndex++] = this.getSubscriptionIds.selector;
        staticFunctionSelectors[selectorIndex++] = this.getSubscription.selector;
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds) {
        staticInterfaceIds = new bytes4[](1);
        staticInterfaceIds[0] = type(IPrimaryMarket).interfaceId;
    }
}
